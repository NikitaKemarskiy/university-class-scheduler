import { ImpossibleToGenerateScheduleError } from "../../errors";
import { getUniqueClasses } from "../../helpers";
import { Class } from "../../types";
import { getAvailabilityDifference, getAvailabilityIntersection } from "./helpers";
import { Availability, DisciplineClassAssigned, GeneticAlgorithmSchedulerParams, _Room } from "./types";

export class Individual {
  public disciplineClassesAssigned: Array<DisciplineClassAssigned>;
  public roomIds: Array<number>;
  public classes: Array<Array<Class>>;
  private schedulerParams: GeneticAlgorithmSchedulerParams;

  constructor(params: {
    disciplineClassesAssigned: Array<DisciplineClassAssigned>,
    roomIds: Array<number>,
    classes: Array<Array<Class>>,
    schedulerParams: GeneticAlgorithmSchedulerParams,
  }) {
    this.disciplineClassesAssigned = params.disciplineClassesAssigned;
    this.roomIds = params.roomIds;
    this.classes = params.classes;
    this.schedulerParams = params.schedulerParams;
  }

  getRoomAvailability(room: _Room): Availability {
    const roomBusyClasses = this.disciplineClassesAssigned.flatMap(
      (_, index) => this.roomIds[index] === room.id
        ? this.classes[index]
        : []
    );

    return getAvailabilityDifference([
      room.availability,
      roomBusyClasses,
    ]);
  }

  getDisciplineClassAssignedAvailability(disciplineClassAssigned: DisciplineClassAssigned): Availability {
    // Get lecturers availabilites intersection
    const lecturersAvailability: Availability = getAvailabilityIntersection(disciplineClassAssigned.lecturerIds.map((lecturerId) => {
      const lecturerBusyClasses = this.disciplineClassesAssigned.flatMap(
        (_, index) => this.disciplineClassesAssigned[index].lecturerIds.includes(lecturerId)
          ? this.classes[index]
          : []
      );
      return getAvailabilityDifference([
        this.schedulerParams.lecturers.get(lecturerId)!.availability,
        lecturerBusyClasses,
      ]);
    }));
  
    // Get groups availabilites intersection
    const groupsAvailability: Availability = getAvailabilityIntersection(disciplineClassAssigned.groupIds.map(groupId => {
      const groupClasses = this.disciplineClassesAssigned.flatMap(
        (_, index) => this.disciplineClassesAssigned[index].groupIds.includes(groupId)
          ? this.classes[index]
          : []
      );
      return getAvailabilityDifference([
        this.schedulerParams.groupTypes.get(this.schedulerParams.groups.get(groupId)!.typeId)!.availability,
        groupClasses,
      ]);
    }));
  
    // Return lecturers and groups availabilites intersection
    return getAvailabilityIntersection([
      lecturersAvailability,
      groupsAvailability,
    ]);
  }

  isAppropriate(): boolean {
    return ![
      // Перевірка "накладок" та дотримання ліміту занять на день у груп
      Array.from(this.schedulerParams.groups.keys()).some((groupId: number) => {
        const group = this.schedulerParams.groups.get(groupId)!;
        const groupType = this.schedulerParams.groupTypes.get(group.typeId)!;

        const groupClasses: Array<Class> = this.disciplineClassesAssigned.flatMap(
          ({ groupIds }, index) => groupIds.includes(groupId)
            ? this.classes[index]
            : []
        );

        // Присутня "накладка" у групи
        if (getUniqueClasses(groupClasses).length !== groupClasses.length) {
          return true;
        }

        const groupClassesByDays: Array<Array<Class>> = Array.from(
          groupClasses
            .reduce((accum: Map<string, Array<Class>>, cls: Class) => {
              const key = `${cls.workingDay}-${cls.weekNumber}`;
              const existingClassesByDay = accum.get(key);

              if (existingClassesByDay) {
                accum.set(key, [...existingClassesByDay, cls]);
              } else {
                accum.set(key, [cls]);
              }

              return accum;
            }, new Map())
            .values()
        );

        // Кількість занять на день більша за ліміт
        groupClassesByDays.forEach((groupClassesByDay) => {
          if (groupClassesByDay.length > groupType.maxClassesPerDay) {
            return true;
          }
        })
      }),
      // Перевірка "накладок" та доступності аудиторій
      Array.from(this.schedulerParams.rooms.keys()).some((roomId: number) => {
        const roomClasses: Array<Class> = this.disciplineClassesAssigned.flatMap(
          (_, index) => this.roomIds[index] === roomId
            ? this.classes[index]
            : []
        );

        // Присутня "накладка" у аудиторії
        if (getUniqueClasses(roomClasses).length !== roomClasses.length) {
          return true;
        }

        const room = this.schedulerParams.rooms.get(roomId)!;

        // Аудиторія недоступна в назначений час
        if (
          getAvailabilityIntersection([
            room.availability,
            roomClasses,
          ]).length !== roomClasses.length
        ) {
          return true;
        }
      }),
      // Перевірка "накладок" у викладачів
      Array.from(this.schedulerParams.lecturers.keys()).some((lecturerId: number) => {
        const lecturerClasses: Array<Class> = this.disciplineClassesAssigned.flatMap(
          ({ lecturerIds }, index) => lecturerIds.includes(lecturerId)
            ? this.classes[index]
            : []
        );

        // Присутня "накладка" у викладача
        if (getUniqueClasses(lecturerClasses).length !== lecturerClasses.length) {
          return true;
        }
      }),
      // Перевірка обсягу проведених занять та вимог до аудиторій
      this.disciplineClassesAssigned.some((disciplineClassAssigned, index) => {
        if (this.classes[index].length !== disciplineClassAssigned.classesPerCycle) {
          return true;
        }

        const room = this.schedulerParams.rooms.get(this.roomIds[index])!;

        if (
          // Аудиторія не підходить за типом
          !disciplineClassAssigned.appropriateRoomTypeIds.includes(room.typeId)
          // Аудиторія замала (не здатна вмістити необхідну кількість груп)
          || room.capacityGroups < disciplineClassAssigned.groupIds.length
          // Аудиторія привʼязана до іншого факультету, аніж дисципліна
          || (
            disciplineClassAssigned.facultyId
            && room.facultyId !== disciplineClassAssigned.facultyId
          )
          // Аудиторія привʼязана до іншої кафедри, аніж дисципліна
          || (
            disciplineClassAssigned.facultyDepartmentId
            && room.facultyDepartmentId !== disciplineClassAssigned.facultyDepartmentId
          )
        ) {
          return true;
        }
      })
    ]
      .some((checkResult: boolean) => checkResult);
  }

  getCrossoverIndividual(secondaryParent: Individual): Individual {
    // Create a copy of a main parent (this) individual
    const crossoverIndividual = new Individual({
      disciplineClassesAssigned: this.disciplineClassesAssigned,
      roomIds: [...this.roomIds],
      classes: [...this.classes],
      schedulerParams: this.schedulerParams,
    });

    for (let i = 0; i < crossoverIndividual.disciplineClassesAssigned.length; i++) {
      // Try to perform crossover
      if (Math.floor(Math.random() * 2) === 1) {
        const availability = getAvailabilityIntersection([
          crossoverIndividual.getRoomAvailability(this.schedulerParams.rooms.get(secondaryParent.roomIds[i])!),
          crossoverIndividual.getDisciplineClassAssignedAvailability(crossoverIndividual.disciplineClassesAssigned[i]),
        ]);

        // Enough mutual availability between the room and discipline class assigned
        if (availability.length >= crossoverIndividual.disciplineClassesAssigned[i].classesPerCycle) {
          const classes = [
            ...Array(crossoverIndividual.disciplineClassesAssigned[i].classesPerCycle).keys()
          ].map(() => {
            // Remove random Class from the array and return it
            const [randomClass] = availability.splice(Math.floor(Math.random() * availability.length), 1);
    
            return randomClass;
          });

          // Perform mutation & break from the loop
          crossoverIndividual.roomIds[i] = secondaryParent.roomIds[i];
          crossoverIndividual.classes[i] = classes;

          break;
        }
      }
    }

    return crossoverIndividual;
  }

  static getRandomIndividual(
    disciplineClassesAssigned: Array<DisciplineClassAssigned>,
    schedulerParams: GeneticAlgorithmSchedulerParams,
  ): Individual {
    // Initialize empty individual
    const randomIndividual = new Individual({
      disciplineClassesAssigned,
      roomIds: new Array(disciplineClassesAssigned.length).fill(null),
      classes: new Array(disciplineClassesAssigned.length).fill([]),
      schedulerParams,
    });

    for (let i = 0; i < disciplineClassesAssigned.length; i++) {
      const disciplineClassAssigned = disciplineClassesAssigned[i];
      const appropriateRooms = this.getAppropriateRooms(disciplineClassAssigned, schedulerParams);

      while (appropriateRooms.length) {
        // Remove random Class from the array and return it
        const [randomAppropriateRoom] = appropriateRooms.splice(
          Math.floor(Math.random() * appropriateRooms.length),
          1
        );

        const availability = getAvailabilityIntersection([
          randomIndividual.getRoomAvailability(randomAppropriateRoom),
          randomIndividual.getDisciplineClassAssignedAvailability(disciplineClassesAssigned[i]),
        ]);

        // Not enough mutual availability between the room and discipline class assigned
        if (availability.length >= disciplineClassAssigned.classesPerCycle) {
          const classes = [
            ...Array(disciplineClassAssigned.classesPerCycle).keys()
          ].map(() => {
            // Remove random Class from the array and return it
            const [randomClass] = availability.splice(Math.floor(Math.random() * availability.length), 1);
    
            return randomClass;
          });
  
          // Save solution into random individual & break from the loop
          randomIndividual.roomIds[i] = randomAppropriateRoom.id;
          randomIndividual.classes[i] = classes;

          break;
        }
      }

      if (randomIndividual.roomIds[i] === null) {
        throw new ImpossibleToGenerateScheduleError(
          `No appropriate room found. DisciplineClassAssigned: ${JSON.stringify(disciplineClassAssigned)}`,
        );
      }
    }

    return randomIndividual;
  }

  static getMutatedIndividual(parent: Individual, geneMutationProbability: number): Individual {
    // Create a copy of a parent individual
    const mutatedIndividual = new Individual({
      disciplineClassesAssigned: parent.disciplineClassesAssigned,
      roomIds: [...parent.roomIds],
      classes: [...parent.classes],
      schedulerParams: parent.schedulerParams,
    });

    for (let i = 0; i < mutatedIndividual.disciplineClassesAssigned.length; i++) {
      // Try to perform mutation
      if (Math.random() < geneMutationProbability) {
        const appropriateRooms = this.getAppropriateRooms(
          mutatedIndividual.disciplineClassesAssigned[i],
          mutatedIndividual.schedulerParams,
        );

        while (appropriateRooms.length) {
          // Remove random Class from the array and return it
          const [randomAppropriateRoom] = appropriateRooms.splice(
            Math.floor(Math.random() * appropriateRooms.length),
            1
          );

          const availability = getAvailabilityIntersection([
            mutatedIndividual.getRoomAvailability(randomAppropriateRoom),
            mutatedIndividual.getDisciplineClassAssignedAvailability(
              mutatedIndividual.disciplineClassesAssigned[i]
            ),
          ]);

          // Enough mutual availability between the room and discipline class assigned
          if (availability.length >= mutatedIndividual.disciplineClassesAssigned[i].classesPerCycle) {
            const classes = [
              ...Array(mutatedIndividual.disciplineClassesAssigned[i].classesPerCycle).keys()
            ].map(() => {
              // Remove random Class from the array and return it
              const [randomClass] = availability.splice(Math.floor(Math.random() * availability.length), 1);
      
              return randomClass;
            });
  
            // Perform mutation & break from the loop
            mutatedIndividual.roomIds[i] = randomAppropriateRoom.id;
            mutatedIndividual.classes[i] = classes;

            break;
          }
        }
      }
    }

    return mutatedIndividual;
  }

  private static getAppropriateRooms(
    disciplineClassAssigned: DisciplineClassAssigned,
    schedulerParams: GeneticAlgorithmSchedulerParams,
  ): Array<_Room> {
    return Array.from(schedulerParams.rooms.values()).filter(
      (room) =>
        disciplineClassAssigned.appropriateRoomTypeIds.includes(room.typeId)
        && room.capacityGroups >= disciplineClassAssigned.groupIds.length
        && (!room.facultyId || disciplineClassAssigned.facultyId === room.facultyId)
        && (!room.facultyDepartmentId || disciplineClassAssigned.facultyDepartmentId === room.facultyDepartmentId)
    );
  }
};

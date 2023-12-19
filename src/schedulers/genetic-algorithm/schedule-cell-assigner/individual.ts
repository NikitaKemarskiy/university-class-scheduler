import { ImpossibleToGenerateScheduleError } from "../../../errors";
import { getUniqueScheduleCells } from "../../../helpers";
import { ScheduleCell, AssignedScheduleCell } from "../../../types";
import { getAvailabilityDifference, getAvailabilityIntersection } from "../helpers";
import { Availability, DisciplineClassAssigned, GeneticAlgorithmSchedulerParams, _Room } from "../types";

export class Individual {
  public disciplineClassesAssigned: Array<DisciplineClassAssigned>;
  public roomIds: Array<number>;
  public scheduleCells: Array<Array<ScheduleCell>>;
  private schedulerParams: GeneticAlgorithmSchedulerParams;

  constructor(params: {
    disciplineClassesAssigned: Array<DisciplineClassAssigned>,
    roomIds: Array<number>,
    scheduleCells: Array<Array<ScheduleCell>>,
    schedulerParams: GeneticAlgorithmSchedulerParams,
  }) {
    this.disciplineClassesAssigned = params.disciplineClassesAssigned;
    this.roomIds = params.roomIds;
    this.scheduleCells = params.scheduleCells;
    this.schedulerParams = params.schedulerParams;
  }

  isAppropriate(): boolean {
    return ![
      // Перевірка "накладок" та дотримання ліміту занять на день у груп
      Array.from(this.schedulerParams.groups.keys()).some((groupId: number) => {
        const group = this.schedulerParams.groups.get(groupId)!;
        const groupType = this.schedulerParams.groupTypes.get(group.typeId)!;

        const groupScheduleCells: Array<ScheduleCell> = this.disciplineClassesAssigned.flatMap(
          ({ groupIds }, index) => groupIds.includes(groupId)
            ? this.scheduleCells[index]
            : []
        );

        // Присутня "накладка" у групи
        if (getUniqueScheduleCells(groupScheduleCells).length !== groupScheduleCells.length) {
          // console.log(`Присутня "накладка" у групи: ${JSON.stringify({ group, groupScheduleCells })}`);
          return true;
        }

        const groupScheduleCellsByDays: Array<Array<ScheduleCell>> = Array.from(
          groupScheduleCells
            .reduce((accum: Map<string, Array<ScheduleCell>>, scheduleCell: ScheduleCell) => {
              const key = `${scheduleCell.workingDay}-${scheduleCell.weekNumber}`;
              const existingScheduleCellsByDay = accum.get(key);

              if (existingScheduleCellsByDay) {
                accum.set(key, [...existingScheduleCellsByDay, scheduleCell]);
              } else {
                accum.set(key, [scheduleCell]);
              }

              return accum;
            }, new Map())
            .values()
        );

        // Кількість занять на день більша за ліміт
        groupScheduleCellsByDays.forEach((groupScheduleCellsByDay) => {
          if (groupScheduleCellsByDay.length > groupType.maxAssignedScheduleCellsPerDay) {
            // console.log(`Кількість занять на день більша за ліміт: ${JSON.stringify({ group, groupScheduleCellsByDay })}`);
            return true;
          }
        })
      }),
      // Перевірка "накладок" та доступності аудиторій
      Array.from(this.schedulerParams.rooms.keys()).some((roomId: number) => {
        const roomScheduleCells: Array<ScheduleCell> = this.disciplineClassesAssigned.flatMap(
          (_, index) => this.roomIds[index] === roomId
            ? this.scheduleCells[index]
            : []
        );

        // Присутня "накладка" у аудиторії
        if (getUniqueScheduleCells(roomScheduleCells).length !== roomScheduleCells.length) {
          // console.log(`Присутня "накладка" у аудиторії: ${JSON.stringify({ roomId, roomScheduleCells })}`);
          return true;
        }

        const room = this.schedulerParams.rooms.get(roomId)!;

        // Аудиторія недоступна в назначений час
        if (
          getAvailabilityIntersection([
            room.availability,
            roomScheduleCells,
          ]).length !== roomScheduleCells.length
        ) {
          // console.log(`Аудиторія недоступна в назначений час: ${JSON.stringify({ roomId, roomScheduleCells, roomAvailability: room.availability, })}`);
          return true;
        }
      }),
      // Перевірка "накладок" у викладачів
      Array.from(this.schedulerParams.lecturers.keys()).some((lecturerId: number) => {
        const lecturerScheduleCells: Array<ScheduleCell> = this.disciplineClassesAssigned.flatMap(
          ({ lecturerIds }, index) => lecturerIds.includes(lecturerId)
            ? this.scheduleCells[index]
            : []
        );

        // Присутня "накладка" у викладача
        if (getUniqueScheduleCells(lecturerScheduleCells).length !== lecturerScheduleCells.length) {
          // console.log(`Присутня "накладка" у викладача: ${JSON.stringify({ lecturerId, lecturerScheduleCells })}`);
          return true;
        }
      }),
      // Перевірка обсягу проведених занять та вимог до аудиторій
      this.disciplineClassesAssigned.some((disciplineClassAssigned, index) => {
        if (this.scheduleCells[index].length !== disciplineClassAssigned.assignedScheduleCellsPerCycle) {
          // console.log(`Перевірка обсягу проведених занять та вимог до аудиторій: ${JSON.stringify({ disciplineClassAssigned })}`);
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
            room.facultyId
            && room.facultyId !== disciplineClassAssigned.facultyId
          )
          // Аудиторія привʼязана до іншої кафедри, аніж дисципліна
          || (
            room.facultyDepartmentId
            && room.facultyDepartmentId !== disciplineClassAssigned.facultyDepartmentId
          )
        ) {
          // console.log(`Інші перевірки: ${JSON.stringify({ disciplineClassAssigned })}`);
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
      scheduleCells: [...this.scheduleCells],
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
        if (availability.length >= crossoverIndividual.disciplineClassesAssigned[i].assignedScheduleCellsPerCycle) {
          const scheduleCells = [
            ...Array(crossoverIndividual.disciplineClassesAssigned[i].assignedScheduleCellsPerCycle).keys()
          ].map(() => {
            // Remove random Class from the array and return it
            const [randomScheduleCell] = availability.splice(Math.floor(Math.random() * availability.length), 1);
    
            return randomScheduleCell;
          });

          // Perform mutation & break from the loop
          crossoverIndividual.roomIds[i] = secondaryParent.roomIds[i];
          crossoverIndividual.scheduleCells[i] = scheduleCells;

          break;
        }
      }
    }

    return crossoverIndividual;
  }

  getAssignedScheduleCells(): Array<AssignedScheduleCell> {
    const assignedScheduleCells: Array<AssignedScheduleCell> = [];

    for (let i = 0; i < this.disciplineClassesAssigned.length; i++) {
      assignedScheduleCells.push(...this.scheduleCells[i].map((scheduleCell: ScheduleCell) => ({
        scheduleCell,
        disciplineClassId: this.disciplineClassesAssigned[i].disciplineClassId,
        online: this.disciplineClassesAssigned[i].online,
        lecturerIds: this.disciplineClassesAssigned[i].lecturerIds,
        groupIds: this.disciplineClassesAssigned[i].groupIds,
        roomId: this.roomIds[i],
      })))
    }

    return assignedScheduleCells;
  }

  static getRandomIndividual(
    disciplineClassesAssigned: Array<DisciplineClassAssigned>,
    schedulerParams: GeneticAlgorithmSchedulerParams,
  ): Individual {
    // Initialize empty individual
    const randomIndividual = new Individual({
      disciplineClassesAssigned,
      roomIds: new Array(disciplineClassesAssigned.length).fill(null),
      scheduleCells: new Array(disciplineClassesAssigned.length).fill([]),
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
        if (availability.length >= disciplineClassAssigned.assignedScheduleCellsPerCycle) {
          const scheduleCells = [
            ...Array(disciplineClassAssigned.assignedScheduleCellsPerCycle).keys()
          ].map(() => {
            // Remove random Class from the array and return it
            const [randomScheduleCell] = availability.splice(Math.floor(Math.random() * availability.length), 1);
    
            return randomScheduleCell;
          });
  
          // Save solution into random individual & break from the loop
          randomIndividual.roomIds[i] = randomAppropriateRoom.id;
          randomIndividual.scheduleCells[i] = scheduleCells;

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
      scheduleCells: [...parent.scheduleCells],
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
          if (availability.length >= mutatedIndividual.disciplineClassesAssigned[i].assignedScheduleCellsPerCycle) {
            const scheduleCells = [
              ...Array(mutatedIndividual.disciplineClassesAssigned[i].assignedScheduleCellsPerCycle).keys()
            ].map(() => {
              // Remove random ScheduleCell from the array and return it
              const [randomScheduleCell] = availability.splice(Math.floor(Math.random() * availability.length), 1);
      
              return randomScheduleCell;
            });
  
            // Perform mutation & break from the loop
            mutatedIndividual.roomIds[i] = randomAppropriateRoom.id;
            mutatedIndividual.scheduleCells[i] = scheduleCells;

            break;
          }
        }
      }
    }

    return mutatedIndividual;
  }

  private getRoomAvailability(room: _Room): Availability {
    const roomScheduleCells = this.disciplineClassesAssigned.flatMap(
      (_, index) => this.roomIds[index] === room.id
        ? this.scheduleCells[index]
        : []
    );

    return getAvailabilityDifference([
      room.availability,
      roomScheduleCells,
    ]);
  }

  private getDisciplineClassAssignedAvailability(disciplineClassAssigned: DisciplineClassAssigned): Availability {
    // Get lecturers availabilites intersection
    const lecturersAvailability: Availability = getAvailabilityIntersection(disciplineClassAssigned.lecturerIds.map((lecturerId) => {
      const lecturerScheduleCells = this.disciplineClassesAssigned.flatMap(
        (_, index) => this.disciplineClassesAssigned[index].lecturerIds.includes(lecturerId)
          ? this.scheduleCells[index]
          : []
      );
      return getAvailabilityDifference([
        this.schedulerParams.lecturers.get(lecturerId)!.availability,
        lecturerScheduleCells,
      ]);
    }));
  
    // Get groups availabilites intersection
    const groupsAvailability: Availability = getAvailabilityIntersection(disciplineClassAssigned.groupIds.map(groupId => {
      const groupScheduleCells = this.disciplineClassesAssigned.flatMap(
        (_, index) => this.disciplineClassesAssigned[index].groupIds.includes(groupId)
          ? this.scheduleCells[index]
          : []
      );
      return getAvailabilityDifference([
        this.schedulerParams.groupTypes.get(this.schedulerParams.groups.get(groupId)!.typeId)!.availability,
        groupScheduleCells,
      ]);
    }));
  
    // Return lecturers and groups availabilites intersection
    return getAvailabilityIntersection([
      lecturersAvailability,
      groupsAvailability,
    ]);
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

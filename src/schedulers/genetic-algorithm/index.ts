import { Class, DayOfWeek, DisciplineClass, Group, GroupType, Lecturer, Room, Schedule, Scheduler, SchedulerParams, WeeklyAvailableClasses } from "../..";
import { ImpossibleToGenerateScheduleError } from "../../errors";
import { getUniqueClasses } from "../../helpers";

// disciplineClassesAssigned dataset is used to implement the second subtask solution first, because it's more important
// and it has ready-to-use genetic algorithm tips.
// TODO: Implement another method to calculate disciplineClassAssigned: Z[] array
// (i.e. to solve the first subtask).
import { disciplineClassesAssignedPartial } from './test-data/disciplineClassAssigned';
import { DisciplineClassAssigned, GeneticAlgorithmParams, Individual } from "./types";

export class GeneticAlgorithmScheduler extends Scheduler {
  constructor(
    params: SchedulerParams,
    private readonly geneticAlgorithmParams: GeneticAlgorithmParams
  ) {
    super(params);

    this.validateGeneticAlgorithmParamsOrThrow();
  }

  generateSchedule(): Schedule {
    const disciplineClassesAssigned: DisciplineClassAssigned[] = disciplineClassesAssignedPartial
      .map((disciplineClassAssigned) => {
        const discipline: DisciplineClass | undefined = this.disciplineClasses.get(disciplineClassAssigned.disciplineId);
        
        if (!discipline) {
          throw new Error(`Discipline with ID ${disciplineClassAssigned.disciplineId} not found`);
        }

        const lecturers: Lecturer[] = disciplineClassAssigned.lecturerIds.map((lecturerId) => {
          const lecturer = this.lecturers.get(lecturerId);

          if (!lecturer) {
            throw new Error(`Lecturer with ID ${disciplineClassAssigned.disciplineId} not found`);
          }

          return lecturer;
        });
        
        const groups: Group[] = disciplineClassAssigned.groupIds.map((groupId) => {
          const group = this.groups.get(groupId);

          if (!group) {
            throw new Error(`Group with ID ${disciplineClassAssigned.disciplineId} not found`);
          }

          return group;
        });
        
        return {
          disciplineId: disciplineClassAssigned.disciplineId,
          lecturerIds: disciplineClassAssigned.lecturerIds,
          groupIds: disciplineClassAssigned.groupIds,
          classesPerCycle: discipline.classesPerWeek * this.options.weeksPerCycle,
          online: discipline.online,
          appropriateRoomTypeIds: discipline.appropriateRoomTypeIds,
          availability: this.getAvailabilityIntersection(
            [
              ...lecturers,
              ...groups.map((group) => {
                const groupType = this.groupTypes.get(group.typeId);

                if (!groupType) {
                  throw new Error(`Group type with ID ${group.typeId} not found`);
                }

                return groupType;
              })
            ].map(({ weeklyAvailableClasses }) =>
              this.convertWeeklyAvailableClassesToAvailability(weeklyAvailableClasses)
            ),
          ),
          facultyId: discipline.facultyId,
          facultyDepartmentId: discipline.facultyDepartmentId,
        };
      });

    let population: Individual[] | undefined;
    
    for (let i = 0; i < this.geneticAlgorithmParams.maxIterations; i++) {
      if (population) {
        population = this.getNextPopulation(disciplineClassesAssigned, population);
      } else {
        population = this.generateInitialPopulation(disciplineClassesAssigned);

        console.log(`Initial population generated. First item: ${JSON.stringify(population[0])}`);
      }

      // Log to get insight into the process of algorithm execution
      if (i % 50 === 0) {
        console.dir({
          iteration: i,
          timestamp: Date.now(),
          topIndividuals: [...population]
            .map((individual) => ({
              individual,
              fitnessFunctionValue: this.fitnessFunction(disciplineClassesAssigned, individual),
            }))
            .sort((i1, i2) => i1.fitnessFunctionValue - i2.fitnessFunctionValue)
            .splice(0, 3),
        });
      }
    }

    return new Schedule([]);
  }

  private getAvailabilityIntersection(availabilities: Array<Array<Class>>): Array<Class> {
    if (availabilities.length === 0) {
      return [];
    }
  
    const intersection = availabilities.reduce((acc, availability) => {
      const availabilitySet = new Set(
        availability.map((cls) => `${cls.workingDay}-${cls.classNumber}-${cls.weekNumber}`)
      );
  
      return acc.filter((cls) =>
        availabilitySet.has(`${cls.workingDay}-${cls.classNumber}-${cls.weekNumber}`)
      );
    }, availabilities[0]);
  
    return intersection;
  }

  private convertWeeklyAvailableClassesToAvailability(
    weeklyAvailableClasses: WeeklyAvailableClasses
  ): Array<Class> {
    return Object.entries(weeklyAvailableClasses).flatMap((entry: [string, Array<number>]) => {
      const [workingDay, availableClassNumbers] = entry;

      return availableClassNumbers.flatMap((availableClassNumber: number) =>
        [...Array(this.options.weeksPerCycle).keys()].flatMap(
          (weekNumber: number) => ({
            classNumber: availableClassNumber,
            workingDay: workingDay as DayOfWeek,
            weekNumber,
          })
        )
      );
    });
  }

  // Checks if individual meets all the requirements
  private isIndividualAppropriate(
    disciplineClassesAssigned: DisciplineClassAssigned[],
    individual: Individual
  ): boolean {
    return ![
      // Перевірка "накладок" та дотримання ліміту занять на день у груп
      Array.from(this.groups.keys()).some((groupId: number) => {
        const group: Group | undefined = this.groups.get(groupId);
        
        if (!group) {
          throw new Error(`Group with ID ${groupId} not found`);
        }

        const groupType: GroupType | undefined = this.groupTypes.get(group.typeId);

        if (!groupType) {
          throw new Error(`Group type with ID ${group.typeId} not found`);
        }

        const groupClasses: Array<Class> = disciplineClassesAssigned.flatMap(
          ({ groupIds }, index) => groupIds.includes(groupId)
            ? individual.classes[index]
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
      Array.from(this.rooms.keys()).some((roomId: number) => {
        const roomClasses: Array<Class> = disciplineClassesAssigned.flatMap(
          (_, index) => individual.roomIds[index] === roomId
            ? individual.classes[index]
            : []
        );

        // Присутня "накладка" у аудиторії
        if (getUniqueClasses(roomClasses).length !== roomClasses.length) {
          return true;
        }

        const room: Room | undefined = this.rooms.get(roomId);

        if (!room) {
          throw new Error(`Room with ID ${roomId} not found`);
        }

        // Аудиторія недоступна в назначений час
        if (
          this.getAvailabilityIntersection([
            this.convertWeeklyAvailableClassesToAvailability(room.weeklyAvailableClasses),
            roomClasses,
          ]).length !== roomClasses.length
        ) {
          return true;
        }
      }),
      // Перевірка "накладок" у викладачів
      Array.from(this.lecturers.keys()).some((lecturerId: number) => {
        const lecturerClasses: Array<Class> = disciplineClassesAssigned.flatMap(
          ({ lecturerIds }, index) => lecturerIds.includes(lecturerId)
            ? individual.classes[index]
            : []
        );

        // Присутня "накладка" у викладача
        if (getUniqueClasses(lecturerClasses).length !== lecturerClasses.length) {
          return true;
        }
      }),
      // Перевірка обсягу проведених занять та вимог до аудиторій
      disciplineClassesAssigned.some((disciplineClassAssigned, index) => {
        if (individual.classes[index].length !== disciplineClassAssigned.classesPerCycle) {
          return true;
        }

        const room: Room | undefined = this.rooms.get(individual.roomIds[index]);

        if (!room) {
          throw new Error(`Room with ID ${individual.roomIds[index]} not found`);
        }

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

  private generateInitialPopulation(disciplineClassesAssigned: DisciplineClassAssigned[]): Individual[] {
    return [...Array(this.geneticAlgorithmParams.populationSize).keys()].map((_, index) => {
      let individual: Individual | null = null;

      do {
        if (individual) {
          console.log(`Individual ${index} in initial population is not appropriate. Generating one more time`);
        }

        individual = {
          roomIds: disciplineClassesAssigned.map(
            (disciplineClassAssigned) => this.getRandomAppropriateRoomId(disciplineClassAssigned),
          ),
          classes: disciplineClassesAssigned.map(
            (disciplineClassAssigned) => this.getRandomClasses(disciplineClassAssigned),
          ),
        };
      } while (!this.isIndividualAppropriate(disciplineClassesAssigned, individual));

      return individual;
    });
  }

  private getRandomAppropriateRoomId(disciplineClassAssigned: DisciplineClassAssigned): number {
    const appropriateRooms: Room[] = Array.from(this.rooms.values()).filter(
      (room: Room) => disciplineClassAssigned.appropriateRoomTypeIds.includes(room.typeId),
    );

    if (!appropriateRooms.length) {
      throw new ImpossibleToGenerateScheduleError(
        `No appropriate room (types ${disciplineClassAssigned.appropriateRoomTypeIds.join(', ')} ` +
        'are appropriate) found'
      );
    }
    
    const randomAppropriateRoom = appropriateRooms[Math.floor(Math.random() * appropriateRooms.length)];

    return randomAppropriateRoom.id;
  }

  private getRandomClasses(disciplineClassAssigned: DisciplineClassAssigned): Array<Class> {
    // Create a copy of Availability array not to affect an original array with mutations
    // (we will remove used Classes from the array)
    const availability = [...disciplineClassAssigned.availability];

    return [...Array(disciplineClassAssigned.classesPerCycle).keys()].map(() => {
      if (!availability.length) {
        throw new ImpossibleToGenerateScheduleError(
          `No available class found, discipline class assigned: ${JSON.stringify(disciplineClassAssigned)}`
        );
      }

      // Remove random Class from the array and return it
      const [randomClass] = availability.splice(Math.floor(Math.random() * availability.length), 1);

      return randomClass;
    });
  }

  private getNextPopulation(
    disciplineClassesAssigned: DisciplineClassAssigned[],
    population: Individual[]
  ): Individual[] {
    const eliteIndividuals: Individual[] = [...population]
      .sort((i1, i2) =>
        this.fitnessFunction(disciplineClassesAssigned, i1) -
        this.fitnessFunction(disciplineClassesAssigned, i2)
      )
      .splice(0, this.geneticAlgorithmParams.eliteIndividualsCount);

    const crossoverIndividualsCount = Math.round(this.geneticAlgorithmParams.crossoverIndividualsFraction * (
      this.geneticAlgorithmParams.populationSize - this.geneticAlgorithmParams.eliteIndividualsCount
    ));
    const mutationIndividualsCount =
      this.geneticAlgorithmParams.populationSize
      - this.geneticAlgorithmParams.eliteIndividualsCount
      - crossoverIndividualsCount;

    const crossoverIndividuals: Individual[] = [...Array(crossoverIndividualsCount).keys()].map(() => {
      const eliteIndividualsToChooseParents: Individual[] = [...eliteIndividuals];

      const [parent1] = eliteIndividualsToChooseParents.splice(Math.floor(Math.random() * eliteIndividualsToChooseParents.length), 1);
      const [parent2] = eliteIndividualsToChooseParents.splice(Math.floor(Math.random() * eliteIndividualsToChooseParents.length), 1);

      let individual: Individual | null = null;

      do {
        // if (individual) {
        //   console.log('Crossover individual is not appropriate. Generating one more time');
        // }

        individual = {
          roomIds: disciplineClassesAssigned.map(
            (_, index) => [parent1, parent2][Math.floor(Math.random() * 2)].roomIds[index],
          ),
          classes: disciplineClassesAssigned.map(
            (_, index) => [parent1, parent2][Math.floor(Math.random() * 2)].classes[index],
          ),
        };
      } while (!this.isIndividualAppropriate(disciplineClassesAssigned, individual));

      return individual;
    });
    const mutationIndividuals: Individual[] = [...Array(mutationIndividualsCount).keys()].map(() => {
      const [parent] = population.splice(Math.floor(Math.random() * population.length), 1);

      let individual: Individual | null = null;

      do {
        // if (individual) {
        //   console.log('Mutation individual is not appropriate. Generating one more time');
        // }

        individual = {
          roomIds: parent.roomIds.map(
            (parentRoomId, index) => Math.random() < this.geneticAlgorithmParams.geneMutationProbability
              ? this.getRandomAppropriateRoomId(disciplineClassesAssigned[index])
              : parentRoomId
          ),
          classes: parent.classes.map(
            (parentClasses, index) =>  Math.random() < this.geneticAlgorithmParams.geneMutationProbability
              ? this.getRandomClasses(disciplineClassesAssigned[index])
              : parentClasses
          ),
        };
      } while (!this.isIndividualAppropriate(disciplineClassesAssigned, individual));

      return individual;
    });

    return [
      ...eliteIndividuals,
      ...crossoverIndividuals,
      ...mutationIndividuals,
    ];
  }

  private fitnessFunction(
    disciplineClassesAssigned: DisciplineClassAssigned[],
    individual: Individual
  ): number {
    const groupIds: number[] = Array.from(this.groups.keys());
    const lecturerIds: number[] = Array.from(this.lecturers.keys());

    const averagenessOfClassesNonFulfillmentDegree = groupIds.reduce((accum: number, groupId: number) => {
      const group: Group | undefined = this.groups.get(groupId);
      
      if (!group) {
        throw new Error(`Group with ID ${groupId} not found`);
      }

      const groupType: GroupType | undefined = this.groupTypes.get(group.typeId);

      if (!groupType) {
        throw new Error(`Group type with ID ${group.typeId} not found`);
      }

      const groupClasses: Array<Class> = disciplineClassesAssigned.flatMap(
        ({ groupIds }, index) => groupIds.includes(groupId)
          ? individual.classes[index]
          : []
      );

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

      const averageClassesPerDay = Math.ceil(groupType.maxClassesPerDay / 2);

      return accum + groupClassesByDays.reduce((accum: number, groupClassesByDay: Array<Class>) => {
        const actualClassesByDay = groupClassesByDay.length;
        
        return accum + Math.abs(averageClassesPerDay - actualClassesByDay) / averageClassesPerDay;
      }, 0) / (groupClassesByDays.length || 1);
    }, 0) / (groupIds.length || 1);
    const groupWindowsAbsenceNonFulfillmentDegree = groupIds.reduce((accum: number, groupId: number) => {
      const groupClasses: Array<Class> = disciplineClassesAssigned.flatMap(
        ({ groupIds }, index) => groupIds.includes(groupId)
          ? individual.classes[index]
          : []
      );

      const groupClassesByDays: Array<Array<Class>> = this.getClassesByDays(groupClasses);

      return accum + this.getWindowsAbsenceNonFulfillmentDegree(groupClassesByDays);
    }, 0) / (groupIds.length || 1);
    const lecturerWindowsAbsenceNonFulfillmentDegree = lecturerIds.reduce((accum: number, lecturerId: number) => {
      const lecturerClasses: Array<Class> = disciplineClassesAssigned.flatMap(
        ({ lecturerIds }, index) => lecturerIds.includes(lecturerId)
          ? individual.classes[index]
          : []
      );

      const lecturerClassesByDays: Array<Array<Class>> = this.getClassesByDays(lecturerClasses);

      return accum + this.getWindowsAbsenceNonFulfillmentDegree(lecturerClassesByDays);
    }, 0) / (lecturerIds.length || 1);
    // TODO
    // const groupTransitionBetweenBuildingsAbsenceNonFulfillmentDegree = groupIds.reduce((accum: number, groupId: number) => {
    //   const groupClasses: Array<Class> = disciplineClassesAssigned.flatMap(
    //     ({ groupIds }, index) => groupIds.includes(groupId)
    //       ? individual.classes[index]
    //       : []
    //   );

    //   const groupClassesByDays: Array<Array<Class>> = this.getClassesByDays(groupClasses);
    // });

    return [
      averagenessOfClassesNonFulfillmentDegree * 0.5,
      groupWindowsAbsenceNonFulfillmentDegree * 1,
      lecturerWindowsAbsenceNonFulfillmentDegree * 0.75,
    ].reduce((accum, item) => accum + item);
  }
  
  private getWindowsAbsenceNonFulfillmentDegree(classesByDays: Array<Array<Class>>): number {
    return classesByDays.reduce((accum: number, classesByDay: Array<Class>) => {
      const maxPossibleWindowsPerDay = classesByDay.length - 1;

      // No windows per day possible
      if (!maxPossibleWindowsPerDay) {
        return accum;
      }
      
      let windowsPerDay = 0;
      let classesByDaySorted = [...classesByDay].sort(
        (class1: Class, class2: Class) => class1.classNumber - class2.classNumber
      );

      for (let i = 1; i < classesByDaySorted.length; i++) {
        const windowSize: number =
          classesByDaySorted[i].classNumber - classesByDaySorted[i - 1].classNumber - 1;
          
        // Currently it doesn't matter what size (in classes) the window is
        if (windowSize) {
          windowsPerDay++;
        }
      }

      return accum + (maxPossibleWindowsPerDay - windowsPerDay) / maxPossibleWindowsPerDay;
    }, 0) / (classesByDays.length || 1);
  }

  private getClassesByDays(classes: Array<Class>): Array<Array<Class>> {
    return Array.from(
      classes
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
  }

  private validateGeneticAlgorithmParamsOrThrow(): void {
    if (
      this.geneticAlgorithmParams.eliteIndividualsCount >= this.geneticAlgorithmParams.populationSize
    ) {
      throw new Error('Elite individuals count should be less than population size');
    }

    [
      this.geneticAlgorithmParams.crossoverIndividualsFraction,
      this.geneticAlgorithmParams.geneMutationProbability,
    ].forEach((item: number) => {
      if (item < 0 || item > 1) {
        throw new Error('Crossover individuals fraction should be between 0 and 1 inclusively');
      }
    });
  }
}

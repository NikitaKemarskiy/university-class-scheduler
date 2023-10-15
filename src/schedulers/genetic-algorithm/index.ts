import { Class, DayOfWeek, DisciplineClass, Group, Lecturer, Room, Schedule, Scheduler, SchedulerParams, WeeklyAvailableClasses } from "../..";
import { ImpossibleToGenerateScheduleError } from "../../errors";

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

        if (!discipline) {
          throw new Error(`Discipline with ID ${disciplineClassAssigned.disciplineId} not found`);
        }
        
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

    let population: Individual[] = this.generateInitialPopulation(disciplineClassesAssigned);

    for (let i = 0; i < this.geneticAlgorithmParams.maxIterations; i++) {
      // Log to get insight into the process of algorithm execution
      if (i % 50 === 0) {
        console.dir({
          iteration: i,
          topIndividuals: [...population]
            .map((individual) => ({
              individual,
              fitnessFunctionValue: this.fitnessFunction(disciplineClassesAssigned, individual),
            }))
            .sort((i1, i2) => i1.fitnessFunctionValue - i2.fitnessFunctionValue)
            .splice(0, 3),
        });
      }

      population = this.getNextPopulation(disciplineClassesAssigned, population);
    }

    return new Schedule([]);
  }

  private getAvailabilityIntersection(availabilities: Array<Array<Class>>): Array<Class> {
    if (availabilities.length === 0) {
      return [];
    }
  
    const intersection = availabilities.reduce((acc, availability) => {
      const availabilitySet = new Set(
        availability.map(cls => `${cls.workingDay}-${cls.classNumber}-${cls.weekNumber}`)
      );
  
      return acc.filter(cls =>
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

  private generateInitialPopulation(disciplineClassesAssigned: DisciplineClassAssigned[]): Individual[] {
    return [...Array(this.geneticAlgorithmParams.populationSize).keys()].map(() => ({
      roomIds: disciplineClassesAssigned.map(
        (disciplineClassAssigned) => this.getRandomAppropriateRoomId(disciplineClassAssigned),
      ),
      classes: disciplineClassesAssigned.map(
        (disciplineClassAssigned) => this.getRandomClasses(disciplineClassAssigned),
      ),
    }));
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
      
      return {
        roomIds: disciplineClassesAssigned.map(
          (_, index) => [parent1, parent2][Math.floor(Math.random() * 2)].roomIds[index],
        ),
        classes: disciplineClassesAssigned.map(
          (_, index) => [parent1, parent2][Math.floor(Math.random() * 2)].classes[index],
        ),
      };
    });
    const mutationIndividuals: Individual[] = [...Array(mutationIndividualsCount).keys()].map(() => {
      const [parent] = population.splice(Math.floor(Math.random() * population.length), 1);

      return {
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
    });

    return [
      ...eliteIndividuals,
      ...crossoverIndividuals,
      ...mutationIndividuals,
    ];
  }

  private fitnessFunction(
    disciplineClassAssigned: DisciplineClassAssigned[],
    individual: Individual
  ): number {
    return 0;
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

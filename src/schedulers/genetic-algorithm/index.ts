import {
  Class,
  DisciplineClass,
  Group,
  Lecturer,
  Schedule,
  Scheduler,
  SchedulerParams,
} from "../..";
import { getUniqueClasses } from "../../helpers";

// disciplineClassesAssigned dataset is used to implement the second subtask solution first, because it's more important
// and it has ready-to-use genetic algorithm tips.
// TODO: Implement another method to calculate disciplineClassAssigned: Z[] array
// (i.e. to solve the first subtask).
import { disciplineClassesAssignedPartial } from './test-data/disciplineClassAssignedPartial';
import { Individual } from "./individual";
import { DisciplineClassAssigned, GeneticAlgorithmParams, GeneticAlgorithmSchedulerParams } from "./types";
import {
  convertEntityArrayToMap,
  convertWeeklyAvailableClassesToAvailability,
  getAvailabilityIntersection,
  getClassesByDays,
} from "./helpers";

export class GeneticAlgorithmScheduler extends Scheduler {
  private readonly params: GeneticAlgorithmSchedulerParams;

  constructor(
    params: SchedulerParams,
    private readonly geneticAlgorithmParams: GeneticAlgorithmParams
  ) {
    super(params);

    this.params = {
      options: params.options,
      groups: convertEntityArrayToMap(params.groups),
      groupTypes: convertEntityArrayToMap(
        params.groupTypes.map((groupType) => ({
          ...groupType,
          availability: convertWeeklyAvailableClassesToAvailability(
            groupType.weeklyAvailableClasses,
            params.options.weeksPerCycle,
          ),
        }))
      ),
      buildings: convertEntityArrayToMap(params.buildings),
      faculties: convertEntityArrayToMap(params.faculties),
      facultyDepartments: convertEntityArrayToMap(params.facultyDepartments),
      rooms: convertEntityArrayToMap(
        params.rooms.map((room) => ({
          ...room,
          availability: convertWeeklyAvailableClassesToAvailability(
            room.weeklyAvailableClasses,
            params.options.weeksPerCycle,
          ),
        }))
      ),
      roomTypes: convertEntityArrayToMap(params.roomTypes),
      disciplineClassTypes: convertEntityArrayToMap(params.disciplineClassTypes),
      disciplineClasses: convertEntityArrayToMap(params.disciplineClasses),
      lecturers: convertEntityArrayToMap(
        params.lecturers.map((lecturer) => ({
          ...lecturer,
          availability: convertWeeklyAvailableClassesToAvailability(
            lecturer.weeklyAvailableClasses,
            params.options.weeksPerCycle,
          ),
        }))
      ),
    }
    this.validateGeneticAlgorithmParamsOrThrow();
  }

  generateSchedule(): Schedule {
    const disciplineClassesAssigned: Array<DisciplineClassAssigned> = disciplineClassesAssignedPartial
      .map((disciplineClassAssigned) => {
        const discipline: DisciplineClass = this.params.disciplineClasses.get(disciplineClassAssigned.disciplineId)!;
        
        return {
          disciplineId: disciplineClassAssigned.disciplineId,
          lecturerIds: disciplineClassAssigned.lecturerIds,
          groupIds: disciplineClassAssigned.groupIds,
          classesPerCycle: discipline.classesPerWeek * this.params.options.weeksPerCycle,
          online: discipline.online,
          appropriateRoomTypeIds: discipline.appropriateRoomTypeIds,
          facultyId: discipline.facultyId,
          facultyDepartmentId: discipline.facultyDepartmentId,
        };
      });

    let population: Array<Individual> | undefined;
    
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

  private generateInitialPopulation(disciplineClassesAssigned: Array<DisciplineClassAssigned>): Array<Individual> {
    return [...Array(this.geneticAlgorithmParams.populationSize).keys()].map((_, index) => {
      let individual: Individual | null = null;

      do {
        // Generally that should not happen because algorithm guarantees that all individuals are
        // appropriate, so this check is added rather for debugging.
        if (individual) {
          console.log(`Individual ${index} in initial population is not appropriate. Generating one more time`);
        }

        individual = Individual.getRandomIndividual(disciplineClassesAssigned, this.params);
      } while (!individual.isAppropriate());

      return individual;
    });
  }

  private getNextPopulation(
    disciplineClassesAssigned: Array<DisciplineClassAssigned>,
    population: Array<Individual>
  ): Array<Individual> {
    const eliteIndividuals: Array<Individual> = [...population]
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

    const crossoverIndividuals: Array<Individual> = [...Array(crossoverIndividualsCount).keys()].map(() => {
      const eliteIndividualsToChooseParents: Array<Individual> = [...eliteIndividuals];

      const [parent1] = eliteIndividualsToChooseParents.splice(Math.floor(Math.random() * eliteIndividualsToChooseParents.length), 1);
      const [parent2] = eliteIndividualsToChooseParents.splice(Math.floor(Math.random() * eliteIndividualsToChooseParents.length), 1);

      let individual: Individual | null = null;

      do {
        if (individual) {
          console.log('Crossover individual is not appropriate. Generating one more time');
        }

        const parentGeneIndices: number[] = [...Array(disciplineClassesAssigned.length)].map(
          () => Math.floor(Math.random() * 2),
        );

        individual = new Individual({
          disciplineClassesAssigned,
          roomIds: disciplineClassesAssigned.map(
            (_, index) => [parent1, parent2][parentGeneIndices[index]].roomIds[index],
          ),
          classes: disciplineClassesAssigned.map(
            (_, index) => [parent1, parent2][parentGeneIndices[index]].classes[index],
          ),
          schedulerParams: this.params,
        });
      } while (!individual.isAppropriate());

      return individual;
    });
    const mutationIndividuals: Array<Individual> = [...Array(mutationIndividualsCount).keys()].map(() => {
      const [parent] = population.splice(Math.floor(Math.random() * population.length), 1);

      let individual: Individual | null = null;

      do {
        // Generally that should not happen because algorithm guarantees that all individuals are
        // appropriate, so this check is added rather for debugging.
        if (individual) {
          console.log('Mutation individual is not appropriate. Generating one more time');
        }

        individual = Individual.getMutatedIndividual(parent, this.geneticAlgorithmParams.geneMutationProbability);
      } while (!individual.isAppropriate());

      return individual;
    });

    return [
      ...eliteIndividuals,
      ...crossoverIndividuals,
      ...mutationIndividuals,
    ];
  }

  private fitnessFunction(
    disciplineClassesAssigned: Array<DisciplineClassAssigned>,
    individual: Individual
  ): number {
    const groups = Array.from(this.params.groups.values());
    const lecturers = Array.from(this.params.lecturers.values());

    const averagenessOfClassesNonFulfillmentDegree = groups.reduce((accum: number, group: Group) => {
      const groupType = this.params.groupTypes.get(group.typeId)!;

      const groupClasses: Array<Class> = disciplineClassesAssigned.flatMap(
        ({ groupIds }, index) => groupIds.includes(group.id)
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
    }, 0) / (groups.length || 1);
    const groupWindowsAbsenceNonFulfillmentDegree = groups.reduce((accum: number, group: Group) => {
      const groupClasses: Array<Class> = disciplineClassesAssigned.flatMap(
        (disciplineClassAssigned, index) => disciplineClassAssigned.groupIds.includes(group.id)
          ? individual.classes[index]
          : []
      );

      const groupClassesByDays: Array<Array<Class>> = getClassesByDays(groupClasses);

      return accum + this.getWindowsAbsenceNonFulfillmentDegree(groupClassesByDays);
    }, 0) / (groups.length || 1);
    const lecturerWindowsAbsenceNonFulfillmentDegree = lecturers.reduce((accum: number, lecturer: Lecturer) => {
      const lecturerClasses: Array<Class> = disciplineClassesAssigned.flatMap(
        (disciplineClassAssigned, index) => disciplineClassAssigned.lecturerIds.includes(lecturer.id)
          ? individual.classes[index]
          : []
      );

      const lecturerClassesByDays: Array<Array<Class>> = getClassesByDays(lecturerClasses);

      return accum + this.getWindowsAbsenceNonFulfillmentDegree(lecturerClassesByDays);
    }, 0) / (lecturers.length || 1);

    const lectionsClasses: Array<Class> = disciplineClassesAssigned.flatMap(
      ({ disciplineId }, index) => {
        const disciplineClass = this.params.disciplineClasses.get(disciplineId);

        return disciplineClass?.typeId === 1
          ? individual.classes[index]
          : []
      }
    );
    const lectionsAtBeginningOfDayNonFulfillmentDegree = lectionsClasses.reduce(
      (accum: number, cls: Class) => accum + cls.classNumber / this.params.options.lastClassNumber,
      0
    ) / (lectionsClasses.length || 1);
    
    // TODO: Додати кількість переходів між корпусами для груп та викладачів

    return [
      averagenessOfClassesNonFulfillmentDegree * 0.5,
      groupWindowsAbsenceNonFulfillmentDegree * 1,
      lecturerWindowsAbsenceNonFulfillmentDegree * 0.75,
      lectionsAtBeginningOfDayNonFulfillmentDegree * 0.5,
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

      return accum + windowsPerDay / maxPossibleWindowsPerDay;
    }, 0) / (classesByDays.length || 1);
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

import {
  AssignedScheduleCell,
  Group,
  Lecturer,
  Schedule,
  ScheduleCell,
} from "../../..";
import { Individual } from "./individual";
import { DisciplineClassAssigned, GeneticAlgorithmParams, GeneticAlgorithmSchedulerParams } from "../types";
import { getAssignedScheduleCellsByDays } from "../helpers";

export class ScheduleCellAssigner {
  constructor(
    private readonly params: GeneticAlgorithmSchedulerParams,
    private readonly geneticAlgorithmParams: GeneticAlgorithmParams,
  ) {}

  assignScheduleCells(disciplineClassesAssigned: Array<DisciplineClassAssigned>): Schedule {
    let population: Array<Individual> | undefined;
    
    for (let i = 0; i < this.geneticAlgorithmParams.maxIterations; i++) {
      if (population) {
        population = this.getNextPopulation(population);
      } else {
        population = this.generateInitialPopulation(disciplineClassesAssigned);

        // console.log(`Initial population generated. First item: ${JSON.stringify(population[0])}`);
      }

      // Log to get insight into the process of algorithm execution
      if (i % 50 === 0 || i === this.geneticAlgorithmParams.maxIterations - 1) {
        console.dir({
          iteration: i,
          timestamp: Date.now(),
          topIndividuals: [...population]
            .map((individual) => ({
              individual,
              fitnessFunctionValue: this.fitnessFunction(individual),
            }))
            .sort((i1, i2) => i1.fitnessFunctionValue - i2.fitnessFunctionValue)
            .splice(0, 3),
        });
      }
    }

    if (!population) {
      throw new Error('No solution found');
    }

    const [topIndividual] = [...population]
      .map((individual) => ({
        individual,
        fitnessFunctionValue: this.fitnessFunction(individual),
      }))
      .sort((i1, i2) => i1.fitnessFunctionValue - i2.fitnessFunctionValue)
      .splice(0, 1)
      .map(({ individual }) => individual);

    return new Schedule(topIndividual.getAssignedScheduleCells());
  }

  private generateInitialPopulation(disciplineClassesAssigned: Array<DisciplineClassAssigned>): Array<Individual> {
    return [...Array(this.geneticAlgorithmParams.populationSize).keys()].map((_, index) => {
      let individual: Individual | null = null;

      do {
        // It's unlikely that this condition is true
        // (according to random individual generation logic)
        if (individual) {
          console.log(`Individual ${index} in initial population is not appropriate. Generating one more time`);
        }

        individual = Individual.getRandomIndividual(disciplineClassesAssigned, this.params);
      } while (!individual.isAppropriate());

      return individual;
    });
  }

  private getNextPopulation(population: Array<Individual>): Array<Individual> {
    const eliteIndividuals: Array<Individual> = [...population]
      .sort((i1, i2) =>
        this.fitnessFunction(i1) -
        this.fitnessFunction(i2)
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
      let individual: Individual | null = null;

      do {
        // This condition should not be true because algorithm guarantees that all individuals are
        // appropriate, so this check is added rather for debugging.
        if (individual) {
          console.log('Crossover individual is not appropriate. Generating one more time');
        }

        const mainParent = eliteIndividuals[Math.floor(Math.random() * eliteIndividuals.length)];
        const secondaryParent = eliteIndividuals[Math.floor(Math.random() * eliteIndividuals.length)];

        individual = mainParent.getCrossoverIndividual(secondaryParent);
      } while (!individual.isAppropriate());

      return individual;
    });
    const mutationIndividuals: Array<Individual> = [...Array(mutationIndividualsCount).keys()].map(() => {
      const [parent] = population.splice(Math.floor(Math.random() * population.length), 1);

      let individual: Individual | null = null;

      do {
        // This condition should not be true because algorithm guarantees that all individuals are
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

  private fitnessFunction(individual: Individual): number {
    const schedule = new Schedule(individual.getAssignedScheduleCells());

    const groups = Array.from(this.params.groups.values());
    const lecturers = Array.from(this.params.lecturers.values());

    const averagenessOfScheduleCellsNonFulfillmentDegree = groups.reduce((accum: number, group: Group) => {
      const groupType = this.params.groupTypes.get(group.typeId)!;

      const groupScheduleCells: Array<ScheduleCell> = individual.disciplineClassesAssigned.flatMap(
        ({ groupIds }, index) => groupIds.includes(group.id)
          ? individual.scheduleCells[index]
          : []
      );

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

      const averageAssignedScheduleCellsPerDay = Math.ceil(groupType.maxAssignedScheduleCellsPerDay / 2);

      return accum + groupScheduleCellsByDays.reduce((accum: number, groupScheduleCellsByDay: Array<ScheduleCell>) => {
        const actualAssignedScheduleCellsByDay = groupScheduleCellsByDay.length;
        
        return accum + Math.abs(averageAssignedScheduleCellsPerDay - actualAssignedScheduleCellsByDay) / averageAssignedScheduleCellsPerDay;
      }, 0) / (groupScheduleCellsByDays.length || 1);
    }, 0) / (groups.length || 1);

    const lectionsScheduleCells: Array<ScheduleCell> = individual.disciplineClassesAssigned.flatMap(
      ({ disciplineClassId }, index) => {
        const disciplineClass = this.params.disciplineClasses.get(disciplineClassId);

        return disciplineClass?.typeId === 1
          ? individual.scheduleCells[index]
          : []
      }
    );

    const lectionsAtBeginningOfDayNonFulfillmentDegree = lectionsScheduleCells.reduce(
      (accum: number, scheduleCell: ScheduleCell) => accum + scheduleCell.classNumber / this.params.options.lastClassNumber,
      0
    ) / (lectionsScheduleCells.length || 1);

    const lecturerBuldingsTransitionsAbsenceNonFulfillmentDegree = lecturers
      .reduce((accum: number, lecturer: Lecturer) => {
        const lecturerAssignedScheduleCellsByDays: Array<Array<AssignedScheduleCell>> = getAssignedScheduleCellsByDays(
          schedule.getAssignedScheduleCells({ lecturerId: lecturer.id })
        );

        return accum + this.getBuldingsTransitionsAbsenceNonFulfillmentDegree(
          lecturerAssignedScheduleCellsByDays
        );
      }, 0) / (lecturers.length || 1);

    const groupBuldingsTransitionsAbsenceNonFulfillmentDegree = groups
      .reduce((accum: number, group: Group) => {
        const groupAssignedScheduleCellsByDays: Array<Array<AssignedScheduleCell>> = getAssignedScheduleCellsByDays(
          schedule.getAssignedScheduleCells({ groupId: group.id })
        );

        return accum + this.getBuldingsTransitionsAbsenceNonFulfillmentDegree(
          groupAssignedScheduleCellsByDays
        );
      }, 0) / (groups.length || 1);

    const lecturerWindowsAbsenceNonFulfillmentDegree = lecturers.reduce((accum: number, lecturer: Lecturer) => {
      const lecturerAssignedScheduleCellsByDays: Array<Array<AssignedScheduleCell>>= getAssignedScheduleCellsByDays(
        schedule.getAssignedScheduleCells({ lecturerId: lecturer.id })
      );

      return accum + this.getWindowsAbsenceNonFulfillmentDegree(lecturerAssignedScheduleCellsByDays);
    }, 0) / (lecturers.length || 1);

    const groupWindowsAbsenceNonFulfillmentDegree = groups.reduce((accum: number, group: Group) => {
      const groupAssignedScheduleCellsByDays: Array<Array<AssignedScheduleCell>> = getAssignedScheduleCellsByDays(
        schedule.getAssignedScheduleCells({ groupId: group.id })
      );

      return accum + this.getWindowsAbsenceNonFulfillmentDegree(groupAssignedScheduleCellsByDays);
    }, 0) / (groups.length || 1);

    // if (Math.random() < 0.00005) {
    //   console.dir({
    //     averagenessOfScheduleCellsNonFulfillmentDegree,
    //     lectionsAtBeginningOfDayNonFulfillmentDegree,
    //     lecturerBuldingsTransitionsAbsenceNonFulfillmentDegree,
    //     groupBuldingsTransitionsAbsenceNonFulfillmentDegree,
    //     lecturerWindowsAbsenceNonFulfillmentDegree,
    //     groupWindowsAbsenceNonFulfillmentDegree,
    //   });
    // }

    return [
      averagenessOfScheduleCellsNonFulfillmentDegree * 0.5,
      lectionsAtBeginningOfDayNonFulfillmentDegree * 0.5,
      lecturerBuldingsTransitionsAbsenceNonFulfillmentDegree * 0.75,
      groupBuldingsTransitionsAbsenceNonFulfillmentDegree * 1,
      lecturerWindowsAbsenceNonFulfillmentDegree * 0.75,
      groupWindowsAbsenceNonFulfillmentDegree * 1,
    ].reduce((accum, item) => accum + item);
  }

  private getBuldingsTransitionsAbsenceNonFulfillmentDegree(
    assignedScheduleCellsByDays: Array<Array<AssignedScheduleCell>>
  ): number {
    return assignedScheduleCellsByDays.reduce((accum: number, assignedScheduleCellsByDay: Array<AssignedScheduleCell>) => {
      const maxPossibleTransitionsPerDay = assignedScheduleCellsByDay.length - 1;

      // No transitions per day possible
      if (!maxPossibleTransitionsPerDay) {
        return accum;
      }
      
      let transitionsPerDay = 0;
      let assignedScheduleCellsByDaySorted = [...assignedScheduleCellsByDay].sort(
        (assignedScheduleCell1: AssignedScheduleCell, assignedScheduleCell2: AssignedScheduleCell) =>
          assignedScheduleCell1.scheduleCell.classNumber - assignedScheduleCell2.scheduleCell.classNumber
      );

      for (let i = 1; i < assignedScheduleCellsByDaySorted.length; i++) {
        const currentAssignedScheduleCell = assignedScheduleCellsByDaySorted[i];
        const prevAssignedScheduleCell = assignedScheduleCellsByDaySorted[i - 1];

        if (
          currentAssignedScheduleCell.online !== prevAssignedScheduleCell.online
          || (
            !currentAssignedScheduleCell.online
            && !prevAssignedScheduleCell.online
            && this.params.rooms.get(currentAssignedScheduleCell.roomId)?.buildingId
              !== this.params.rooms.get(prevAssignedScheduleCell.roomId)?.buildingId
          )
        ) {
          transitionsPerDay++;
        }
      }

      return accum + transitionsPerDay / maxPossibleTransitionsPerDay;
    }, 0) / (assignedScheduleCellsByDays.length || 1);
  }
  
  private getWindowsAbsenceNonFulfillmentDegree(
    assignedScheduleCellsByDays: Array<Array<AssignedScheduleCell>>
  ): number {
    return assignedScheduleCellsByDays.reduce((accum: number, assignedScheduleCellsByDay: Array<AssignedScheduleCell>) => {
      const maxPossibleWindowsPerDay = assignedScheduleCellsByDay.length - 1;

      // No windows per day possible
      if (!maxPossibleWindowsPerDay) {
        return accum;
      }
      
      let windowsPerDay = 0;
      let assignedScheduleCellsByDaySorted = [...assignedScheduleCellsByDay].sort(
        (assignedScheduleCell1: AssignedScheduleCell, assignedScheduleCell2: AssignedScheduleCell) =>
          assignedScheduleCell1.scheduleCell.classNumber - assignedScheduleCell2.scheduleCell.classNumber
      );

      for (let i = 1; i < assignedScheduleCellsByDaySorted.length; i++) {
        const windowSize: number =
          assignedScheduleCellsByDaySorted[i].scheduleCell.classNumber
          - assignedScheduleCellsByDaySorted[i - 1].scheduleCell.classNumber
          - 1;
          
        // Currently it doesn't matter what size (in classes) the window is
        if (windowSize) {
          windowsPerDay++;
        }
      }

      return accum + windowsPerDay / maxPossibleWindowsPerDay;
    }, 0) / (assignedScheduleCellsByDays.length || 1);
  }
}

import {
  DisciplineClass,
  Schedule,
  Scheduler,
  SchedulerParams,
} from "../..";

// disciplineClassesAssigned dataset is used to implement the second subtask solution first, because it's more important
// and it has ready-to-use genetic algorithm tips.
// TODO: Implement another method to calculate disciplineClassAssigned: DisciplineClassAssigned[] array
// (i.e. to solve the first subtask).
import { disciplineClassesAssignedPartial } from './test-data/disciplineClassAssignedPartial';
import { DisciplineClassAssigned, GeneticAlgorithmParams, GeneticAlgorithmSchedulerParams } from "./types";
import {
  convertEntityArrayToMap,
  convertWeeklyAvailableScheduleCellsToAvailability,
} from "./helpers";
import { ScheduleCellAssigner } from "./schedule-cell-assigner";

export class GeneticAlgorithmScheduler extends Scheduler {
  private readonly params: GeneticAlgorithmSchedulerParams;
  private readonly scheduleCellAssigner: ScheduleCellAssigner;

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
          availability: convertWeeklyAvailableScheduleCellsToAvailability(
            groupType.weeklyAvailableScheduleCells,
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
          availability: convertWeeklyAvailableScheduleCellsToAvailability(
            room.weeklyAvailableScheduleCells,
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
          availability: convertWeeklyAvailableScheduleCellsToAvailability(
            lecturer.weeklyAvailableScheduleCells,
            params.options.weeksPerCycle,
          ),
        }))
      ),
    }
    this.validateGeneticAlgorithmParamsOrThrow();

    this.scheduleCellAssigner = new ScheduleCellAssigner(this.params, this.geneticAlgorithmParams);
  }

  generateSchedule(): Schedule {
    const disciplineClassesAssigned: Array<DisciplineClassAssigned> = disciplineClassesAssignedPartial
      .map((disciplineClassAssigned) => {
        const discipline: DisciplineClass = this.params.disciplineClasses.get(disciplineClassAssigned.disciplineId)!;
        
        return {
          disciplineId: disciplineClassAssigned.disciplineId,
          lecturerIds: disciplineClassAssigned.lecturerIds,
          groupIds: disciplineClassAssigned.groupIds,
          assignedScheduleCellsPerCycle: discipline.assignedScheduleCellsPerWeek * this.params.options.weeksPerCycle,
          online: discipline.online,
          appropriateRoomTypeIds: discipline.appropriateRoomTypeIds,
          facultyId: discipline.facultyId,
          facultyDepartmentId: discipline.facultyDepartmentId,
        };
      });

    return this.scheduleCellAssigner.assignAssignedScheduleCells(disciplineClassesAssigned);
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

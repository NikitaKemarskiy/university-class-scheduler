import {
  Building,
  DayOfWeek,
  Discipline,
  DisciplineClass,
  DisciplineClassType,
  Faculty,
  FacultyDepartment,
  Group,
  Lecturer,
  Room,
  Schedule,
  ScheduleCell,
  ScheduleOptions
} from "./types";

export * from "./types";

export abstract class Scheduler {
  constructor(
    // Meta
    protected readonly options: ScheduleOptions,
    
    // Groups
    protected readonly groups: Set<Group>,
    
    // Institutions
    protected readonly buildings: Set<Building>,
    protected readonly faculties: Set<Faculty>,
    protected readonly facultyDepartments: Set<FacultyDepartment>,
    protected readonly rooms: Set<Room>,
    
    // Disciplines & lecturers
    protected readonly disciplines: Set<Discipline>,
    protected readonly disciplineClassTypes: Set<DisciplineClassType>,
    protected readonly disciplineClasses: Set<DisciplineClass>,
    protected readonly lecturers: Set<Lecturer>,
  ) {}

  abstract generateSchedule(): Schedule;
}

export class GeneticAlgorithmScheduler extends Scheduler {
  generateSchedule(): Schedule {
    // TODO: Add implementation

    return [{
      [DayOfWeek.MONDAY]: new Set<ScheduleCell>(),
      [DayOfWeek.TUESDAY]: new Set<ScheduleCell>(),
      [DayOfWeek.WEDNESDAY]: new Set<ScheduleCell>(),
      [DayOfWeek.THURSDAY]: new Set<ScheduleCell>(),
      [DayOfWeek.FRIDAY]: new Set<ScheduleCell>(),
      [DayOfWeek.SATURDAY]: new Set<ScheduleCell>(),
      [DayOfWeek.SUNDAY]: new Set<ScheduleCell>(),
    }];
  }
}

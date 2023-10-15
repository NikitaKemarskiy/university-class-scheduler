import {
  Building,
  DisciplineClass,
  DisciplineClassType,
  Faculty,
  FacultyDepartment,
  Group,
  GroupType,
  Lecturer,
  Room,
  RoomType,
  ScheduleCell,
  ScheduleOptions
} from "./types";

export * from "./types";

export type SchedulerParams = {
  // Meta
  options: ScheduleOptions,
  // Groups
  groups: Array<Group>,
  groupTypes: Array<GroupType>,
  // Institutions
  buildings: Array<Building>,
  faculties: Array<Faculty>,
  facultyDepartments: Array<FacultyDepartment>,
  rooms: Array<Room>,
  roomTypes: Array<RoomType>,
  // Disciplines & lecturers
  disciplineClassTypes: Array<DisciplineClassType>,
  disciplineClasses: Array<DisciplineClass>,
  lecturers: Array<Lecturer>,
};

export class Schedule {
  constructor(private readonly scheduleCells: Array<ScheduleCell>) {}

  // TODO: Implement these filters in more general way (likely with abstraction - implementation)
  getLecturerScheduleCells(lecturerId: number): Array<ScheduleCell> {
    // TODO: Add implementation
    return [];
  }

  getGroupScheduleCells(groupId: number): Array<ScheduleCell> {
    // TODO: Add implementation
    return [];
  }

  getRoomScheduleCells(roomId: number): Array<ScheduleCell> {
    // TODO: Add implementation
    return [];
  }
}

export abstract class Scheduler {
  // Meta
  protected options: ScheduleOptions;
  // Groups
  protected groups: Map<number, Group>;
  protected groupTypes: Map<number, GroupType>;
  // Institutions
  protected buildings: Map<number, Building>;
  protected faculties: Map<number, Faculty>;
  protected facultyDepartments: Map<number, FacultyDepartment>;
  protected rooms: Map<number, Room>;
  protected roomTypes: Map<number, RoomType>;
  // Disciplines & lecturers
  protected disciplineClassTypes: Map<number, DisciplineClassType>;
  protected disciplineClasses: Map<number, DisciplineClass>;
  protected lecturers: Map<number, Lecturer>;

  constructor(params: SchedulerParams) {
    this.validateParamsOrThrow(params);

    this.options = params.options;
    this.groups = this.convertEntityArrayToMap(params.groups);
    this.groupTypes = this.convertEntityArrayToMap(params.groupTypes);
    this.buildings = this.convertEntityArrayToMap(params.buildings);
    this.faculties = this.convertEntityArrayToMap(params.faculties);
    this.facultyDepartments = this.convertEntityArrayToMap(params.facultyDepartments);
    this.rooms = this.convertEntityArrayToMap(params.rooms);
    this.roomTypes = this.convertEntityArrayToMap(params.roomTypes);
    this.disciplineClassTypes = this.convertEntityArrayToMap(params.disciplineClassTypes);
    this.disciplineClasses = this.convertEntityArrayToMap(params.disciplineClasses);
    this.lecturers = this.convertEntityArrayToMap(params.lecturers);
  }

  abstract generateSchedule(): Schedule;

  private validateParamsOrThrow(params: SchedulerParams): void {
    [
      params.groups,
      params.buildings,
      params.faculties,
      params.facultyDepartments,
      params.rooms,
      params.roomTypes,
      params.disciplineClassTypes,
      params.disciplineClasses,
      params.lecturers,
    ].forEach((items: Array<{ id: number }>) => items.forEach((item) => {
      if (items.filter(({ id }) => item.id === id).length > 1) {
        throw new Error(`ID duplicate found: ${item.id}`);
      }
    }));
  }

  private convertEntityArrayToMap<T extends { id: number; }>(items: Array<T>): Map<number, T> {
    return new Map(
      items.map(item => [item.id, item]),
    );
  }
}

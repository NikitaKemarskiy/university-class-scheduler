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
  constructor(params: SchedulerParams) {
    this.validateParamsOrThrow(params);
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
}

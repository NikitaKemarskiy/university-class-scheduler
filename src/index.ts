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
  AssignedScheduleCell,
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
  constructor(private readonly assignedScheduleCells: Array<AssignedScheduleCell>) {}

  getScheduleCells(filter: {
    lecturerId?: number,
    groupId?: number,
    roomId?: number,
  } = {}): Array<AssignedScheduleCell> {
    let filteredAssignedScheduleCells = this.assignedScheduleCells;

    if (filter.lecturerId) {
      filteredAssignedScheduleCells = filteredAssignedScheduleCells.filter(
        (assignedScheduleCell) => assignedScheduleCell.lecturerIds.includes(filter.lecturerId as number)
      );
    }

    if (filter.groupId) {
      filteredAssignedScheduleCells = filteredAssignedScheduleCells.filter(
        (assignedScheduleCell) => assignedScheduleCell.groupIds.includes(filter.groupId as number)
      );
    }

    if (filter.roomId) {
      filteredAssignedScheduleCells = filteredAssignedScheduleCells.filter(
        (assignedScheduleCell) => assignedScheduleCell.roomId === filter.roomId as number
      );
    }

    return filteredAssignedScheduleCells;
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

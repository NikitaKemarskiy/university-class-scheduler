import { DisciplineClass, Lecturer } from "./discipline";
import { Group } from "./group";
import { Room } from "./institution";
import { DayOfWeek, TimePeriod } from "./meta";

export enum ScheduleType {
  CYCLIC_ONE_WEEK,
  CYCLIC_TWO_WEEK,
}

export type AcademicSemester = {
  startDate: Date;
  endDate: Date;
}

export type ScheduleOptions = {
  type: ScheduleType;
  academicSemester: AcademicSemester;
  classesSchedule: TimePeriod[];
  workingDays: DayOfWeek[];
  maxClassesPerDay: number;
}

export type ScheduleCell = {
  classNumber: number;
  disciplineClass: DisciplineClass;
  lecturers: Lecturer[];
  room: Room;
  groups: Group[];
}

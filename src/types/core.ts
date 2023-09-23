import { DisciplineClass, Lecturer } from "./discipline";
import { Group } from "./group";
import { Room } from "./institution";
import { DayOfWeek, TimePeriod } from "./meta";

export enum ScheduleType {
  CYCLIC_ONE_WEEK, // Циклічний розклад з однотижневим повтором (кожен тиждень одні й ті самі пари)
  CYCLIC_TWO_WEEK, // Циклічний розклад з двотижневим повтором
}

export type AcademicSemester = {
  startDate: Date; // 01.09.2018
  endDate: Date; // 18.01.2019
}

export type ScheduleOptions = {
  type: ScheduleType;
  academicSemester: AcademicSemester;
  classesSchedule: TimePeriod[]; // Розклад дзвінків: 0-й елемент це 1-ша пара, 1-й елемент це 2-га пара і т.д.
  workingDays: DayOfWeek[]; // Робочі дні у тижні, наприклад, Понеділок-Пʼятниця
  maxClassesPerDay: number; // Макс. кількість пар на день у конкретної групи
}

// "Комірка" розкладу. Приклад: Математичний аналіз на першій парі
export type ScheduleCell = {
  disciplineClass: DisciplineClass;
  lecturers: Lecturer[]; // Може бути кілька викладачів на одній парі одночасно
  room: Room; // Аудиторія
  groups: Group[]; // Кілька груп може бути в одній аудиторії
}

export type WeeklySchedule = Record<DayOfWeek, Set<ScheduleCell>>

export type Schedule = Array<WeeklySchedule>

import { DayOfWeek } from "./meta";

export type ScheduleOptions = {
  weeksPerCycle: number; // Кількість тижнів у циклі розкладу
  workingDays: Array<DayOfWeek>; // Робочі дні у тижні, наприклад, Понеділок-Пʼятниця
}

export type Class = {
  classNumber: number; // Номер заняття
  workingDay: DayOfWeek;
  weekNumber: number; // Номер тижня (в циклі розкладу)
}

// "Комірка" розкладу. Приклад: Математичний аналіз лекція на першому занятті
export type ScheduleCell = {
  class: Class;
  disciplineClassId: number;
  online: boolean;
  lecturerIds: Array<number>; // Може бути кілька викладачів на одному занятті одночасно
  // Якщо потребується кілька груп для проведення одного заняття – це різні комірки розкладу
  // (з різними викладачами та аудиторіями, проте з одними групами)
  roomId: number;
  groupIds: Array<number>; // Може бути кілька груп (потік) в одній аудиторії
}

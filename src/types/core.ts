import { DayOfWeek } from "./meta";

export type ScheduleOptions = {
  weeksPerCycle: number; // Кількість тижнів у циклі розкладу
  workingDays: Array<DayOfWeek>; // Робочі дні у тижні, наприклад, Понеділок-Пʼятниця
  lastClassNumber: number; // Номер останньої пари
}

export type ScheduleCell = {
  classNumber: number; // Номер заняття
  workingDay: DayOfWeek;
  weekNumber: number; // Номер тижня (в циклі розкладу)
}

// "Комірка" розкладу. Приклад: Математичний аналіз лекція на першому занятті
export type AssignedScheduleCell = {
  scheduleCell: ScheduleCell;
  disciplineClassId: number;
  lecturerIds: Array<number>; // Може бути кілька викладачів на одному занятті одночасно
  groupIds: Array<number>; // Може бути кілька груп (потік) в одній аудиторії
} & ({
  online: false; // Офлайн заняття
  roomId: number;
} | {
  online: true; // Онлайн заняття
})

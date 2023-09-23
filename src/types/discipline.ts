import { RoomType } from "./institution";
import { WeeklyAvailabilitySchedule } from "./meta";

// Дисципліна. Приклад: "Математичний аналіз"
export type Discipline = {
  shortName: string; // "Мат. анал."
  fullName: string; // "Математичний аналіз"
  isSelective: boolean; // Чи є дисципліна вибірковою
}

// Тип заняття. Приклад: "Лекційне заняття"
export type DisciplineClassType = {
  shortName: string; // "Лек"
  fullName: string; // "Лекційне заняття", "Практичне заняття", "Лабораторне заняття", "Лекційне заняття online", "Практичне заняття online", "Лабораторне заняття online"
}

// Заняття певного типу з дисципліни та вимоги до його проведення.
// Приклад: "Лекційне заняття з математичного аналізу"
export type DisciplineClass = {
  discipline: Discipline;
  type: DisciplineClassType;
  roomTypesAppropriate: RoomType[];
  numberOfRoomsRequired: number; // Кількість аудиторій, що потребується для проведення однієї пари
  numberOfLecturersPerRoomRequired: number; // Кількість викладачів, що потребується для проведення однієї пари (може бути кілька викладачів на одній парі одночасно)
}

// Викладач
export type Lecturer = {
  // Графік доступності викладача протягом тижня (розклад часу, коли викладач доступний для роботи)
  weeklyAvailabilitySchedule: WeeklyAvailabilitySchedule;
  disciplineClasses: DisciplineClass[]; // Заняття, які може проводити викладач
}

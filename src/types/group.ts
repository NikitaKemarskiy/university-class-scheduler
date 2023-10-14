import { WeeklyAvailableClasses } from "./meta";

export enum AcademicDegree {
  BACHELOR = "BACHELOR",
  MASTER = "MASTER",
}

// Тип групи: "Денна", "Заочна" тощо
export type GroupType = {
  id: number;
  name: string; // "Денна", "Заочна", "Вечірня"
  maxClassesPerDay: number; // Макс. кількість занять на день у конкретної групи
  // Графік доступності групи протягом тижня (пари, на яких групі можна ставити заняття)
  weeklyAvailableClasses: WeeklyAvailableClasses;
}

// Група. Приклад: "ІП-22мп"
export type Group = {
  id: number;
  name: string; // "ІП-22мп"
  degree: AcademicDegree;
  typeId: number;
  normativeDisciplineClassIds: Array<number>; // Нормативні дисципліни
  facultyId: number;
  facultyDepartmentId?: number;
}

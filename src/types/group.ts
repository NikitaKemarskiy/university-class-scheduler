import { Discipline } from "./discipline";

export enum AcademicDegree {
  BACHELOR,
  MASTER,
}

// Тип групи: "Денна", "Заочна" тощо
export type GroupType = {
  name: string; // "Денна", "Заочна", "Вечірня"
  classNumberStartOfStudies: number; // Номер крайньої пари (початок занять)
  classNumberEndOfStudies: number; // Номер крайньої пари (кінець занять)
}

// Група. Приклад: "ІП-22мп"
export type Group = {
  name: string; // "ІП-22мп"
  degree: AcademicDegree;
  type: GroupType;
  startDate: Date; // 01.09.2018
  endDate: Date; // 30.06.2022
  normativeDisciplines: Discipline[]; // Нормативні дисципліни
}

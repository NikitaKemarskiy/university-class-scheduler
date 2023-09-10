import { Discipline } from "./discipline";

export enum AcademicDegree {
  BACHELOR,
  MASTER,
}

export type GroupType = {
  name: string;
  classNumberStartOfStudies: number;
  classNumberEndOfStudies: number;
}

export type Group = {
  name: string;
  degree: AcademicDegree;
  type: GroupType;
  startDate: Date;
  endDate: Date;
  normativeDisciplines: Discipline[];
}

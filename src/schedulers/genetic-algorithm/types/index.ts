import { Class } from "../../../types";

export type DisciplineClassAssigned = {
  disciplineId: number;
  lecturerIds: Array<number>;
  groupIds: Array<number>;
  classesPerCycle: number;
  online: boolean;
  appropriateRoomTypeIds: Array<number>;
  availability: Array<Class>;
  facultyId?: number;
  facultyDepartmentId?: number;
}

// Genetic algorithm types
export type Individual = {
  roomIds: Array<number>;
  classes: Array<Array<Class>>;
};

import { DisciplineClassAssigned } from "../types";

export const disciplineClassesAssignedPartial: Array<{
  disciplineId: number;
  lecturerIds: Array<number>;
  groupIds: Array<number>;
}> = [{
  disciplineId: 1,
  lecturerIds: [1],
  groupIds: [1,2,3,4],
}, {
  disciplineId: 2,
  lecturerIds: [2],
  groupIds: [1],
}, {
  disciplineId: 2,
  lecturerIds: [2],
  groupIds: [2],
}, {
  disciplineId: 2,
  lecturerIds: [2],
  groupIds: [3],
}, {
  disciplineId: 2,
  lecturerIds: [2],
  groupIds: [4],
}, {
  disciplineId: 3,
  lecturerIds: [3],
  groupIds: [1,2,3,4],
}, {
  disciplineId: 4,
  lecturerIds: [3],
  groupIds: [1],
}, {
  disciplineId: 4,
  lecturerIds: [3],
  groupIds: [2],
}, {
  disciplineId: 4,
  lecturerIds: [3],
  groupIds: [3],
}, {
  disciplineId: 4,
  lecturerIds: [3],
  groupIds: [4],
}];
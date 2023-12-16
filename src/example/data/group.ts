import { AcademicDegree, Group, GroupType } from "../../types";

export const groupTypes: Array<GroupType> = [
  {
    id: 1,
    name: "Денна",
    maxAssignedScheduleCellsPerDay: 5,
    weeklyAvailableScheduleCells: {
      MONDAY: [1,2,3,4,5,6],
      TUESDAY: [1,2,3,4,5,6],
      WEDNESDAY: [1,2,3,4,5,6],
      THURSDAY: [1,2,3,4,5,6],
      FRIDAY: [1,2,3,4,5,6],
      SATURDAY: [],
      SUNDAY: [],
    },
  },
  {
    id: 2,
    name: "Заочна",
    maxAssignedScheduleCellsPerDay: 2,
    weeklyAvailableScheduleCells: {
      MONDAY: [1,2,3,4,5,6],
      TUESDAY: [1,2,3,4,5,6],
      WEDNESDAY: [1,2,3,4,5,6],
      THURSDAY: [1,2,3,4,5,6],
      FRIDAY: [1,2,3,4,5,6],
      SATURDAY: [],
      SUNDAY: [],
    },
  }
];

export const groups: Array<Group> = [
  {
    id: 1,
    name: "ІП-31",
    degree: AcademicDegree.BACHELOR,
    typeId: 1,
    normativeDisciplineClassIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    facultyId: 1,
    facultyDepartmentId: 1
  },
  {
    id: 2,
    name: "ІП-32",
    degree: AcademicDegree.BACHELOR,
    typeId: 1,
    normativeDisciplineClassIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    facultyId: 1,
    facultyDepartmentId: 1
  },
  {
    id: 3,
    name: "ІС-31",
    degree: AcademicDegree.BACHELOR,
    typeId: 1,
    normativeDisciplineClassIds: [1, 2, 3, 4, 14, 15, 16, 17],
    facultyId: 1,
    facultyDepartmentId: 2
  },
  {
    id: 4,
    name: "ІС-32",
    degree: AcademicDegree.BACHELOR,
    typeId: 1,
    normativeDisciplineClassIds: [1, 2, 3, 4, 14, 15, 16, 17],
    facultyId: 1,
    facultyDepartmentId: 2
  },
];

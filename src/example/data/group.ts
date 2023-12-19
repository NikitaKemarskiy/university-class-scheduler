import { AcademicDegree, DayOfWeek, Group, GroupType } from "../../types";

export const groupTypes: Array<GroupType> = [
  {
    id: 1,
    name: "Денна",
    maxAssignedScheduleCellsPerDay: 5,
    weeklyAvailableScheduleCells: {
      [DayOfWeek.MONDAY]: [1,2,3,4,5,6],
      [DayOfWeek.TUESDAY]: [1,2,3,4,5,6],
      [DayOfWeek.WEDNESDAY]: [1,2,3,4,5,6],
      [DayOfWeek.THURSDAY]: [1,2,3,4,5,6],
      [DayOfWeek.FRIDAY]: [1,2,3,4,5,6],
      [DayOfWeek.SATURDAY]: [],
      [DayOfWeek.SUNDAY]: [],
    },
  },
  {
    id: 2,
    name: "Заочна",
    maxAssignedScheduleCellsPerDay: 2,
    weeklyAvailableScheduleCells: {
      [DayOfWeek.MONDAY]: [1,2,3,4,5,6],
      [DayOfWeek.TUESDAY]: [1,2,3,4,5,6],
      [DayOfWeek.WEDNESDAY]: [1,2,3,4,5,6],
      [DayOfWeek.THURSDAY]: [1,2,3,4,5,6],
      [DayOfWeek.FRIDAY]: [1,2,3,4,5,6],
      [DayOfWeek.SATURDAY]: [],
      [DayOfWeek.SUNDAY]: [],
    },
  }
];

export const groups: Array<Group> = [
  {
    id: 1,
    name: "ІП-31",
    degree: AcademicDegree.BACHELOR,
    typeId: 1,
    normativeDisciplineClassIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17],
    facultyId: 1,
    facultyDepartmentId: 1
  },
  {
    id: 2,
    name: "ІП-32",
    degree: AcademicDegree.BACHELOR,
    typeId: 1,
    normativeDisciplineClassIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17],
    facultyId: 1,
    facultyDepartmentId: 1
  },
  {
    id: 3,
    name: "ІС-31",
    degree: AcademicDegree.BACHELOR,
    typeId: 1,
    normativeDisciplineClassIds: [5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 30, 31],
    facultyId: 1,
    facultyDepartmentId: 2
  },
  {
    id: 4,
    name: "ІС-32",
    degree: AcademicDegree.BACHELOR,
    typeId: 1,
    normativeDisciplineClassIds: [5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 30, 31],
    facultyId: 1,
    facultyDepartmentId: 2
  },
  {
    id: 5,
    name: "ІК-31",
    degree: AcademicDegree.BACHELOR,
    typeId: 1,
    normativeDisciplineClassIds: [5, 6, 7, 8, 9, 10, 11, 12, 13, 30, 31],
    facultyId: 1,
    facultyDepartmentId: 2
  },
  {
    id: 6,
    name: "ІК-32",
    degree: AcademicDegree.BACHELOR,
    typeId: 1,
    normativeDisciplineClassIds: [5, 6, 7, 8, 9, 10, 11, 12, 13, 30, 31],
    facultyId: 1,
    facultyDepartmentId: 2
  },
  {
    id: 7,
    name: "ІК-31",
    degree: AcademicDegree.BACHELOR,
    typeId: 1,
    normativeDisciplineClassIds: [11, 12, 13, 18, 19, 20, 21, 22, 23, 30, 31],
    facultyId: 1,
    facultyDepartmentId: 1
  },
  {
    id: 8,
    name: "ІК-32",
    degree: AcademicDegree.BACHELOR,
    typeId: 1,
    normativeDisciplineClassIds: [11, 12, 13, 18, 19, 20, 21, 22, 23, 30, 31],
    facultyId: 1,
    facultyDepartmentId: 1
  },
  {
    id: 9,
    name: "ПМ-31",
    degree: AcademicDegree.BACHELOR,
    typeId: 1,
    normativeDisciplineClassIds: [7, 8, 14, 15, 24, 25, 26, 27, 28, 29, 30, 31],
    facultyId: 2,
    facultyDepartmentId: 1
  },
  {
    id: 10,
    name: "ПМ-32",
    degree: AcademicDegree.BACHELOR,
    typeId: 1,
    normativeDisciplineClassIds: [7, 8, 14, 15, 24, 25, 26, 27, 28, 29, 30, 31],
    facultyId: 2,
    facultyDepartmentId: 1
  },
];

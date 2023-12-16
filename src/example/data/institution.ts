import { Building, DayOfWeek, Faculty, FacultyDepartment, Room, RoomType } from "../../types";

export const buildings: Array<Building> = [
  {
    id: 1,
    address: "Корпус № 18, Київ, вул. Політехнічна, 41",
    distant: false
  },
  {
    id: 2,
    address: "Корпус № 7, Київ, проспект Берестейський, 37-к",
    distant: false
  },
];

export const faculties: Array<Faculty> = [
  {
    id: 1,
    shortName: "ФІОТ",
    fullName: "Факультет інформаційних технологій"
  }
];

export const facultyDepartments: Array<FacultyDepartment> = [
  {
    id: 1,
    shortName: "ІПІ",
    fullName: "Кафедра інформатики та програмної інженерії",
    facultyId: 1
  },
  {
    id: 2,
    shortName: "ОТ",
    fullName: "Кафедра обчислювальних технологій",
    facultyId: 1
  }
];

export const roomTypes: Array<RoomType> = [
  {
    id: 1,
    name: "Мала лекційна"
  },
  {
    id: 2,
    name: "Велика лекційна"
  },
  {
    id: 3,
    name: "Практичний клас"
  },
  {
    id: 4,
    name: "Компʼютерний клас"
  }
];

export const rooms: Array<Room> = [
  {
    id: 1,
    name: '202',
    typeId: 2,
    buildingId: 1,
    facultyId: 1,
    capacityGroups: 5,
    weeklyAvailableScheduleCells: {
      [DayOfWeek.MONDAY]: [1,2,3,4,5],
      [DayOfWeek.TUESDAY]: [1,2,3],
      [DayOfWeek.WEDNESDAY]: [1,2,3,4,5],
      [DayOfWeek.THURSDAY]: [1,2,3],
      [DayOfWeek.FRIDAY]: [1,2,3,4,5],
      [DayOfWeek.SATURDAY]: [],
      [DayOfWeek.SUNDAY]: []
    }
  },
  {
    id: 2,
    name: '211',
    typeId: 1,
    buildingId: 1,
    facultyId: 1,
    capacityGroups: 2,
    weeklyAvailableScheduleCells: {
      [DayOfWeek.MONDAY]: [1,2,3,4,5],
      [DayOfWeek.TUESDAY]: [1,2,3],
      [DayOfWeek.WEDNESDAY]: [1,2,3,4,5],
      [DayOfWeek.THURSDAY]: [1,2,3],
      [DayOfWeek.FRIDAY]: [1,2,3,4,5],
      [DayOfWeek.SATURDAY]: [],
      [DayOfWeek.SUNDAY]: []
    }
  },
  {
    id: 3,
    name: '321',
    typeId: 3,
    buildingId: 2,
    facultyId: 1,
    capacityGroups: 1,
    weeklyAvailableScheduleCells: {
      [DayOfWeek.MONDAY]: [1,2,3,4,5],
      [DayOfWeek.TUESDAY]: [1,2,3],
      [DayOfWeek.WEDNESDAY]: [1,2,3,4,5],
      [DayOfWeek.THURSDAY]: [1,2,3],
      [DayOfWeek.FRIDAY]: [1,2,3,4,5],
      [DayOfWeek.SATURDAY]: [],
      [DayOfWeek.SUNDAY]: []
    }
  },
  {
    id: 4,
    name: '322',
    typeId: 3,
    buildingId: 2,
    facultyId: 1,
    capacityGroups: 2,
    weeklyAvailableScheduleCells: {
      [DayOfWeek.MONDAY]: [1,2,3,4,5],
      [DayOfWeek.TUESDAY]: [1,2,3],
      [DayOfWeek.WEDNESDAY]: [1,2,3,4,5],
      [DayOfWeek.THURSDAY]: [1,2,3],
      [DayOfWeek.FRIDAY]: [1,2,3,4,5],
      [DayOfWeek.SATURDAY]: [],
      [DayOfWeek.SUNDAY]: []
    }
  },
  {
    id: 5,
    name: '335',
    typeId: 4,
    buildingId: 1,
    facultyId: 1,
    capacityGroups: 1,
    weeklyAvailableScheduleCells: {
      [DayOfWeek.MONDAY]: [1,2,3,4,5],
      [DayOfWeek.TUESDAY]: [1,2,3],
      [DayOfWeek.WEDNESDAY]: [1,2,3,4,5],
      [DayOfWeek.THURSDAY]: [1,2,3],
      [DayOfWeek.FRIDAY]: [1,2,3,4,5],
      [DayOfWeek.SATURDAY]: [],
      [DayOfWeek.SUNDAY]: []
    }
  },
];

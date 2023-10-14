import { WeeklyAvailableClasses } from "./meta";

// Корпус
export type Building = {
  id: number;
  address: string;
  distant: boolean;
}

// Факультет
export type Faculty = {
  id: number;
  shortName: string; // "ФІОТ"
  fullName: string;
}

// Кафедра
export type FacultyDepartment = {
  id: number;
  shortName: string; // "ІПІ"
  fullName: string;
  facultyId: number;
}

// Тип аудиторії. Приклад: "Мала лекційна"
export type RoomType = {
  id: number;
  name: string; // "Мала лекційна", "Хімічна лабораторія"
}

// Аудиторія
export type Room = {
  id: number;
  name: string;
  typeId: number;
  buildingId: number; // Корпус, в якому знаходиться аудиторія
  facultyId?: number; // Опціонально, так як є аудиторії, що не привʼязані до жодного факультету
  facultyDepartmentId?: number; // Опціонально, так як є аудиторії, що не привʼязані до жодної кафедри
  weeklyAvailableClasses: WeeklyAvailableClasses; // Графік доступності аудиторії протягом тижня
  capacityGroups: number // Місткість аудиторії в групах. Загалом 1 група = 35 люд.
}

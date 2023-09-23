import { WeeklyAvailabilitySchedule } from "./meta";

// Корпус
export type Building = {
  address: string;
  distant: boolean;
}

// Факультет
export type Faculty = {
  shortName: string; // "ФІОТ"
  fullName: string;
}

// Кафедра
export type FacultyDepartment = {
  shortName: string; // "ІПІ"
  fullName: string;
}

// Тип аудиторії. Приклад: "Мала лекційна"
export type RoomType = {
  name: string; // "Мала лекційна", "Хімічна лабораторія"
}

// Аудиторія
export type Room = {
  type: RoomType;
  building: Building; // Корпус, в якому знаходиться аудиторія
  faculty?: Faculty; // Опціонально, так як є аудиторії, що не привʼязані до жодного факультету
  facultyDepartment?: FacultyDepartment; // Опціонально, так як є аудиторії, що не привʼязані до жодної кафедри
  forbiddenGroupsFromOtherFaculties: boolean; // Чи заборонено назначати пари групам з інших факультетів. Якщо не заборонено – групи з приʼязаного факультету пріоритезуються
  forbiddenGroupsFromOtherFacultyDepartments: boolean; // Чи заборонено назначати пари групам з інших кафедр. Якщо не заборонено – групи з приʼязаної кафедри пріоритезуються
  weeklyAvailabilitySchedule: WeeklyAvailabilitySchedule; // Графік доступності аудиторії протягом тижня
}

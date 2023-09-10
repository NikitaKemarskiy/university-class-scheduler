import { AvailabilitySchedule } from "./meta";

export type Building = {
  address: string;
  distant: boolean;
}

export type Faculty = {
  shortName: string;
  fullName: string;
}

export type FacultyDepartment = {
  shortName: string;
  fullName: string;
}

export type RoomType = {
  name: string;
}

export type Room = {
  type: RoomType;
  building: Building;
  faculty?: Faculty;
  facultyDepartment?: FacultyDepartment;
  forbiddenGroupsFromOtherFaculties: boolean;
  forbiddenGroupsFromOtherFacultyDepartments: boolean;
  availabilitySchedule: AvailabilitySchedule;
}

import { RoomType } from "./institution";
import { AvailabilitySchedule } from "./meta";

export type Discipline = {
  shortName: string;
  fullName: string;
  isSelective: boolean;
}

export type DisciplineClassType = {
  shortName: string;
  fullName: string;
}

export type DisciplineClass = {
  discipline: Discipline;
  type: DisciplineClassType;
  roomTypesAppropriate: RoomType[];
  numberOfRoomsRequired: number;
  numberOfLecturersPerRoomRequired: number;
}

export type Lecturer = {
  availabilitySchedule: AvailabilitySchedule;
  disciplineClasses: DisciplineClass[];
}

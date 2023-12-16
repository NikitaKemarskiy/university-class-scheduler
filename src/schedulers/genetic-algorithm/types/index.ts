import {
  Building,
  DisciplineClass,
  DisciplineClassType,
  Faculty,
  FacultyDepartment,
  Group,
  GroupType,
  Lecturer,
  Room,
  RoomType,
  ScheduleCell,
  ScheduleOptions,
} from "../../..";

export type Availability = Array<ScheduleCell>;

export type _GroupType = GroupType & {
  availability: Availability;
};

export type _Room = Room & {
  availability: Availability;
};

export type _Lecturer = Lecturer & {
  availability: Availability;
};

// Map is used instead of Array
export type GeneticAlgorithmSchedulerParams = {
  // Meta
  options: ScheduleOptions;
  // Groups
  groups: Map<number, Group>;
  groupTypes: Map<number, _GroupType>;
  // Institutions
  buildings: Map<number, Building>;
  faculties: Map<number, Faculty>;
  facultyDepartments: Map<number, FacultyDepartment>;
  rooms: Map<number, _Room>;
  roomTypes: Map<number, RoomType>;
  // Disciplines & lecturers
  disciplineClassTypes: Map<number, DisciplineClassType>;
  disciplineClasses: Map<number, DisciplineClass>;
  lecturers: Map<number, _Lecturer>;
};

export type DisciplineClassAssigned = {
  disciplineId: number;
  lecturerIds: Array<number>;
  groupIds: Array<number>;
  assignedScheduleCellsPerCycle: number;
  online: boolean;
  appropriateRoomTypeIds: Array<number>;
  facultyId?: number;
  facultyDepartmentId?: number;
}

// Genetic algorithm types
export type GeneticAlgorithmParams = {
  populationSize: number;
  eliteIndividualsCount: number; // Кількість "елітних" особин що переходять в нову популяцію без змін
  // Відсоток особин що отримуються шляхом кросинговеру (з особин що залишились окрім "елітних")
  crossoverIndividualsFraction: number;
  // Шанс того що ген буде замінено в процесі мутації
  geneMutationProbability: number;
  maxIterations: number;
};

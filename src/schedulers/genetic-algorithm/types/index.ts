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
export type GeneticAlgorithmParams = {
  populationSize: number;
  eliteIndividualsCount: number; // Кількість "елітних" особин що переходять в нову популяцію без змін
  // Відсоток особин що отримуються шляхом кросинговеру (з особин що залишились окрім "елітних")
  crossoverIndividualsFraction: number;
  // Шанс того що ген буде замінено в процесі мутації
  geneMutationProbability: number;
  maxIterations: number;
};

export type Individual = {
  roomIds: Array<number>;
  classes: Array<Array<Class>>;
};

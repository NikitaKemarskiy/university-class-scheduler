import { GeneticAlgorithmScheduler } from "../schedulers/genetic-algorithm";
import { DisciplineClass, Schedule } from "..";

// Dataset
import { scheduleOptions } from './data/core';
import { groups, groupTypes } from './data/group';
import { buildings, faculties, facultyDepartments, rooms, roomTypes } from './data/institution';
import { disciplineClassTypes, disciplineClasses, lecturers } from './data/discipline';

// disciplineClassesAssigned dataset is used to implement the second subtask solution first, because it's more important
// and it has ready-to-use genetic algorithm tips.
// TODO: Implement another method to calculate disciplineClassAssigned: DisciplineClassAssigned[] array
// (i.e. to solve the first subtask).
import { disciplineClassesAssignedPartial } from './data/disciplineClassAssignedPartial';

const params = {
  // Meta
  options: scheduleOptions,
  // Groups
  groups,
  groupTypes,
  // Institutions
  buildings,
  faculties,
  facultyDepartments,
  rooms,
  roomTypes,
  // Disciplines & lecturers
  disciplineClassTypes,
  disciplineClasses,
  lecturers,
};

const disciplineClassesAssigned = disciplineClassesAssignedPartial.map((disciplineClassAssigned) => {
  const discipline: DisciplineClass = params.disciplineClasses.find(
    (disciplineClass) => disciplineClass.id === disciplineClassAssigned.disciplineClassId
  )!;
  
  return {
    disciplineClassId: disciplineClassAssigned.disciplineClassId,
    lecturerIds: disciplineClassAssigned.lecturerIds,
    groupIds: disciplineClassAssigned.groupIds,
    assignedScheduleCellsPerCycle: discipline.assignedScheduleCellsPerWeek * params.options.weeksPerCycle,
    online: discipline.online,
    appropriateRoomTypeIds: discipline.appropriateRoomTypeIds,
    facultyId: discipline.facultyId,
    facultyDepartmentId: discipline.facultyDepartmentId,
  };
});

const geneticAlgorithmParams = {
  populationSize: 50,
  eliteIndividualsCount: 20,
  crossoverIndividualsFraction: 0.8,
  geneMutationProbability: 0.2,
  maxIterations: 800,
};

const scheduler = new GeneticAlgorithmScheduler(params, disciplineClassesAssigned, geneticAlgorithmParams);

const schedule: Schedule = scheduler.generateSchedule();

console.dir({
  schedule,
  lecturerScheduleCells_Id2: schedule.getScheduleCells({ lecturerId: 2 }),
  groupScheduleCells_Id4: schedule.getScheduleCells({ groupId: 4 }),
  groupScheduleCells_Id5: schedule.getScheduleCells({ groupId: 5 }),
  lecturerGroupScheduleCells_Id2_Id4: schedule.getScheduleCells({ lecturerId: 2, groupId: 4 }),
}, { depth: 4 });

import { GeneticAlgorithmScheduler } from "../schedulers/genetic-algorithm";
import { Schedule } from "..";

// Dataset
import { scheduleOptions } from './data/core';
import { groups, groupTypes } from './data/group';
import { buildings, faculties, facultyDepartments, rooms, roomTypes } from './data/institution';
import { disciplineClassTypes, disciplineClasses, lecturers } from './data/discipline';

const scheduler = new GeneticAlgorithmScheduler({
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
}, {
  populationSize: 50,
  eliteIndividualsCount: 20,
  crossoverIndividualsFraction: 0.8,
  geneMutationProbability: 0.2,
  maxIterations: 10_000,
});

const schedule: Schedule = scheduler.generateSchedule();

console.dir(schedule);

import { Class, DayOfWeek, DisciplineClass, Group, Lecturer, Schedule, Scheduler, WeeklyAvailableClasses } from "../..";

// disciplineClassesAssigned dataset is used to implement the second subtask solution first, because it's more important
// and it has ready-to-use genetic algorithm tips.
// TODO: Implement another method to calculate disciplineClassAssigned: Z[] array
// (i.e. to solve the first subtask).
import { disciplineClassesAssignedPartial } from './test-data/disciplineClassAssigned';
import { DisciplineClassAssigned } from "./types";

export class GeneticAlgorithmScheduler extends Scheduler {
  generateSchedule(): Schedule {
    const disciplineClassesAssigned: DisciplineClassAssigned[] = disciplineClassesAssignedPartial
      .map((disciplineClassAssigned) => {
        const discipline: DisciplineClass | undefined = this.disciplineClasses.get(disciplineClassAssigned.disciplineId);
        const lecturers: Lecturer[] = disciplineClassAssigned.lecturerIds.map((lecturerId) => {
          const lecturer = this.lecturers.get(lecturerId);

          if (!lecturer) {
            throw new Error(`Lecturer with ID ${disciplineClassAssigned.disciplineId} not found`);
          }

          return lecturer;
        });
        const groups: Group[] = disciplineClassAssigned.groupIds.map((groupId) => {
          const group = this.groups.get(groupId);

          if (!group) {
            throw new Error(`Group with ID ${disciplineClassAssigned.disciplineId} not found`);
          }

          return group;
        });

        if (!discipline) {
          throw new Error(`Discipline with ID ${disciplineClassAssigned.disciplineId} not found`);
        }
        
        return {
          disciplineId: disciplineClassAssigned.disciplineId,
          lecturerIds: disciplineClassAssigned.lecturerIds,
          groupIds: disciplineClassAssigned.groupIds,
          classesPerCycle: discipline.classesPerWeek * this.options.weeksPerCycle,
          online: discipline.online,
          appropriateRoomTypeIds: discipline.appropriateRoomTypeIds,
          availability: this.getAvailabilityIntersection(
            [
              ...lecturers,
              ...groups.map((group) => {
                const groupType = this.groupTypes.get(group.typeId);

                if (!groupType) {
                  throw new Error(`Group type with ID ${group.typeId} not found`);
                }

                return groupType;
              })
            ].map(({ weeklyAvailableClasses }) =>
              this.convertWeeklyAvailableClassesToAvailability(weeklyAvailableClasses)
            ),
          ),
          facultyId: discipline.facultyId,
          facultyDepartmentId: discipline.facultyDepartmentId,
        };
      });

    return new Schedule([]);
  }

  private getAvailabilityIntersection(availabilities: Array<Array<Class>>): Array<Class> {
    if (availabilities.length === 0) {
      return [];
    }
  
    const intersection = availabilities.reduce((acc, availability) => {
      const availabilitySet = new Set(
        availability.map(cls => `${cls.workingDay}-${cls.classNumber}-${cls.weekNumber}`)
      );
  
      return acc.filter(cls =>
        availabilitySet.has(`${cls.workingDay}-${cls.classNumber}-${cls.weekNumber}`)
      );
    }, availabilities[0]);
  
    return intersection;
  }

  private convertWeeklyAvailableClassesToAvailability(
    weeklyAvailableClasses: WeeklyAvailableClasses
  ): Array<Class> {
    return Object.entries(weeklyAvailableClasses).flatMap((entry: [string, Array<number>]) => {
      const [workingDay, availableClassNumbers] = entry;

      return availableClassNumbers.flatMap((availableClassNumber: number) =>
        [...Array(this.options.weeksPerCycle).keys()].flatMap(
          (weekNumber: number) => ({
            classNumber: availableClassNumber,
            workingDay: workingDay as DayOfWeek,
            weekNumber,
          })
        )
      );
    });
  }
}

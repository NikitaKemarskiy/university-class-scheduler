import { DayOfWeek, WeeklyAvailableScheduleCells, AssignedScheduleCell } from "../../../types";
import { Availability } from "../types";

export function convertEntityArrayToMap<T extends { id: number; }>(items: Array<T>): Map<number, T> {
  return new Map(
    items.map(item => [item.id, item]),
  );
}

export function convertWeeklyAvailableScheduleCellsToAvailability(
  weeklyAvailableScheduleCells: WeeklyAvailableScheduleCells,
  weeksPerCycle: number,
): Availability {
  return Object.entries(weeklyAvailableScheduleCells).flatMap((entry: [string, Array<number>]) => {
    const [workingDay, availableClassNumbers] = entry;

    return availableClassNumbers.flatMap((availableClassNumber: number) =>
      [...Array(weeksPerCycle).keys()].flatMap(
        (weekNumber: number) => ({
          classNumber: availableClassNumber,
          workingDay: workingDay as DayOfWeek,
          weekNumber,
        })
      )
    );
  });
}

export function getAssignedScheduleCellsByDays(assignedScheduleCells: Array<AssignedScheduleCell>): Array<Array<AssignedScheduleCell>> {
  return Array.from(
    assignedScheduleCells
      .reduce((accum: Map<string, Array<AssignedScheduleCell>>, assignedScheduleCells: AssignedScheduleCell) => {
        const key = `${assignedScheduleCells.scheduleCell.workingDay}-${assignedScheduleCells.scheduleCell.weekNumber}`;
        const existingAssignedScheduleCellsByDay = accum.get(key);

        if (existingAssignedScheduleCellsByDay) {
          accum.set(key, [...existingAssignedScheduleCellsByDay, assignedScheduleCells]);
        } else {
          accum.set(key, [assignedScheduleCells]);
        }

        return accum;
      }, new Map())
      .values()
  );
}

export function getAvailabilityIntersection(availabilities: Array<Availability>): Availability {
  if (availabilities.length === 0) {
    return [];
  }

  const intersection = availabilities.reduce((acc, availability) => {
    const availabilitySet = new Set(
      availability.map((scheduleCell) => `${scheduleCell.workingDay}-${scheduleCell.classNumber}-${scheduleCell.weekNumber}`)
    );

    return acc.filter((scheduleCell) =>
      availabilitySet.has(`${scheduleCell.workingDay}-${scheduleCell.classNumber}-${scheduleCell.weekNumber}`)
    );
  });

  return intersection;
}

export function getAvailabilityDifference(availabilities: Array<Availability>): Availability {
  const availabilityOccurences = availabilities.reduce((acc, availability) => {
    availability.forEach((scheduleCell) => {
      const key = `${scheduleCell.workingDay}-${scheduleCell.classNumber}-${scheduleCell.weekNumber}`;
      const occurences = acc.get(key) || 0;

      acc.set(key, occurences + 1);
    });

    return acc;
  }, new Map<string, number>());

  return availabilities.flat().filter(
    (scheduleCell) => availabilityOccurences.get(`${scheduleCell.workingDay}-${scheduleCell.classNumber}-${scheduleCell.weekNumber}`) === 1
  );
}

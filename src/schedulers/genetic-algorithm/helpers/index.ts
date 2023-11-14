import { Class, DayOfWeek, WeeklyAvailableClasses } from "../../../types";
import { Availability } from "../types";

export function convertEntityArrayToMap<T extends { id: number; }>(items: Array<T>): Map<number, T> {
  return new Map(
    items.map(item => [item.id, item]),
  );
}

export function convertWeeklyAvailableClassesToAvailability(
  weeklyAvailableClasses: WeeklyAvailableClasses,
  weeksPerCycle: number,
): Availability {
  return Object.entries(weeklyAvailableClasses).flatMap((entry: [string, Array<number>]) => {
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

export function getClassesByDays(classes: Array<Class>): Array<Array<Class>> {
  return Array.from(
    classes
      .reduce((accum: Map<string, Array<Class>>, cls: Class) => {
        const key = `${cls.workingDay}-${cls.weekNumber}`;
        const existingClassesByDay = accum.get(key);

        if (existingClassesByDay) {
          accum.set(key, [...existingClassesByDay, cls]);
        } else {
          accum.set(key, [cls]);
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
      availability.map((cls) => `${cls.workingDay}-${cls.classNumber}-${cls.weekNumber}`)
    );

    return acc.filter((cls) =>
      availabilitySet.has(`${cls.workingDay}-${cls.classNumber}-${cls.weekNumber}`)
    );
  });

  return intersection;
}

export function getAvailabilityDifference(availabilities: Array<Availability>): Availability {
  const availabilityOccurences = availabilities.reduce((acc, availability) => {
    availability.forEach((cls) => {
      const key = `${cls.workingDay}-${cls.classNumber}-${cls.weekNumber}`;
      const occurences = acc.get(key) || 0;

      acc.set(key, occurences + 1);
    });

    return acc;
  }, new Map<string, number>());

  return availabilities.flat().filter(
    (cls) => availabilityOccurences.get(`${cls.workingDay}-${cls.classNumber}-${cls.weekNumber}`) === 1
  );
}

import { Class } from "../types";

export function getUniqueClasses(classes: Array<Class>): Array<Class> {
  const seenClasses = new Set<string>();
  
  return classes.filter((cls) => {
    const classKey = `${cls.workingDay}-${cls.classNumber}-${cls.weekNumber}`;
    if (!seenClasses.has(classKey)) {
      seenClasses.add(classKey);
      return true;
    }
    return false;
  });
}

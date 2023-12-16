import { ScheduleCell } from "../types";

export function getUniqueScheduleCells(scheduleCells: Array<ScheduleCell>): Array<ScheduleCell> {
  const seenScheduleCells = new Set<string>();
  
  return scheduleCells.filter((scheduleCell) => {
    const scheduleCellKey = `${scheduleCell.workingDay}-${scheduleCell.classNumber}-${scheduleCell.weekNumber}`;
    
    if (!seenScheduleCells.has(scheduleCellKey)) {
      seenScheduleCells.add(scheduleCellKey);
      
      return true;
    }

    return false;
  });
}

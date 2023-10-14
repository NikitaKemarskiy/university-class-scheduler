import { DayOfWeek, ScheduleOptions } from "../../types";

export const scheduleOptions: ScheduleOptions = {
  weeksPerCycle: 2,
  workingDays: [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
  ],
};

export enum DayOfWeek {
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday
}

export type TimePeriod = {
  startTime: Time;
  endTime: Time;
}

export type AvailabilitySchedule = {
  availableTimePeriodsByDaysOfWeek: Record<DayOfWeek, TimePeriod[]>;
}

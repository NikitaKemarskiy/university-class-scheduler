export enum DayOfWeek {
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
  SUNDAY,
}

// Вірогідно, тимчасове рішення.
// Час є рядком з 24-годинним форматом часу. Приклад: "08:20", "15:40"
export type Time = string;

// Період часу. Приклад: з 08:20 по 10:05
export type TimePeriod = {
  startTime: Time;
  endTime: Time;
}

// Графік доступності (якогось ресурсу) протягом тижня.
export type WeeklyAvailabilitySchedule = Record<DayOfWeek, TimePeriod[]>

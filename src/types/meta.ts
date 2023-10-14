export enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

// Графік доступності (якогось ресурсу) протягом тижня (в парах).
// Наприклад: викладач доступний в понеділок та вівторок з першої по третю пару
export type WeeklyAvailableClasses = Record<DayOfWeek, Array<number>>

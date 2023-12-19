export enum DayOfWeek {
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
  SUNDAY,
}

// Графік доступності (якогось ресурсу) протягом тижня (в парах).
// Наприклад: викладач доступний в понеділок та вівторок з першої по третю пару
export type WeeklyAvailableScheduleCells = Record<DayOfWeek, Array<number>>

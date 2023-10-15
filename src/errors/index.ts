export class ImpossibleToGenerateScheduleError extends Error {
  constructor(msg: string) {
    super(`Impossible to generate schedule: ${msg}`);
  }
}

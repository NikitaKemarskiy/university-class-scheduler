# University class scheduler Javascript library

The library can be used to build class schedules for higher education institutions. It contains built-in Typescript declarations, so you can effectively use it with Typescript.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The library is intended to provide the universal abstract interface for building class schedules. The interface should be implementation-agnostic (algorithm / method used for building the actual schedule), and shouldn't impose specific formulation of the class scheduling problem (specific restrictions / recommendations of the desired schedule).

It also provides genetic algorithm implementation of the abstract interface. You can create, use & distribute your own implementations of the interface.

## Installation

Library can be installed using `NPM` package manager. Since library already contains built-in Typescript declarations, you don't need to install any separate type declaration packages.

Follow the following instructions to install the package:

1. Create a .npmrc file in the root of your project (if not created yet) and add the following line to it:
   ```sh
   @nikitakemarskiy:registry=https://npm.pkg.github.com
   ```
2. Install the library using NPM
   ```sh
   npm install @nikitakemarskiy/university-class-scheduler
   ```

## Usage

The library was is compiled to ES2016-compatible code, so you should be able to use it in any environment which supports ES2016. You can use either CommonJS or ESM.

### Abstract interface

First of all, we need to consider `Scheduler` abstract class, which acts as a main class of the library, used to build class schedules:
```typescript
abstract class Scheduler {
    constructor(params: SchedulerParams);
    abstract generateSchedule(): Schedule;
}
```

You can use it to create & distribute your own implementations of the class scheduler. Let's pay attention to the `abstract generateSchedule(): Schedule` method, and namely to its return type of `Schedule` class:
```typescript
class Schedule {
    constructor(assignedScheduleCells: Array<AssignedScheduleCell>);
    getAssignedScheduleCells(filter?: ScheduleCellFilter): Array<AssignedScheduleCell>;
    serializeToJSON(): string;
    static deserializeFromJSON(scheduleSerializedToJSON: string): Schedule;
}
```

`Schedule` class is used to encapsulate resulting schedule. It exposes `getAssignedScheduleCells(filter?: ScheduleCellFilter): Array<AssignedScheduleCell>` method, which returns schedule cells after applying the filters passed. It allows to get only needed part of the schedule, e.g. schedule of the specific group, lecturer etc:
```typescript
type ScheduleCellFilter = {
    lecturerId?: number;
    groupId?: number;
    roomId?: number;
    online?: boolean;
};
```

You can import everything related to the abstract interface as follows:
```typescript
import { Schedule, Scheduler, ScheduleCellFilter } from 'university-class-scheduler';
```

Library also provides genetic algorithm implementation of the `Scheduler` abstract class, named `GeneticAlgorithmScheduler`:
```typescript
import { GeneticAlgorithmScheduler } from 'university-class-scheduler/schedulers/genetic-algorithm';
```

It exposes extended constructor, which includes discipline classes assigned (to lecturers and groups) and genetic algorithm parameters:
```typescript
type DisciplineClassAssigned = {
    disciplineClassId: number;
    lecturerIds: Array<number>;
    groupIds: Array<number>;
    assignedScheduleCellsPerCycle: number;
    facultyId?: number;
    facultyDepartmentId?: number;
} & ({
    online: false;
    appropriateRoomTypeIds: Array<number>;
} | {
    online: true;
});

type GeneticAlgorithmParams = {
    populationSize: number;
    eliteIndividualsCount: number;
    crossoverIndividualsFraction: number;
    geneMutationProbability: number;
    maxIterations: number;
};

class GeneticAlgorithmScheduler extends Scheduler {
    constructor(
      params: SchedulerParams & { disciplineClassesAssigned: Array<DisciplineClassAssigned> },
      geneticAlgorithmParams: GeneticAlgorithmParams
    );
    generateSchedule(): Schedule;
}
```

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

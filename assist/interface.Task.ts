interface Task {

    type: TaskType;

    state: TaskState;

    source: string;

    invoke: Function;

    callback: Function;

    data: TaskData;

    scheduleFn: (task: Task) => void;

    cancelFn: (task: Task) => void;

    readonly zone: Zone;

runCount: number;

cancelScheduleRequest(): void;

}

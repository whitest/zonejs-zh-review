
interface Zone {
    parent: Zone;

    name: string;

    get(key: string): any;

    getZoneWith(key: string): Zone;

    fork(zoneSpec: ZoneSpec): Zone;

    wrap<F extends Function>(callback: F, source: string): F;

    run<T>(callback: Function, applyThis?: any, applyArgs?: any[], source?: string): T;

    runGuarded<T>(callback: Function, applyThis?: any, applyArgs?: any[], source?: string): T;

    runTask(task: Task, applyThis?: any, applyArgs?: any): any;

    scheduleMicroTask(
        source: string, callback: Function, data?: TaskData,
        customSchedule?: (task: Task) => void): MicroTask;

    scheduleMacroTask(
        source: string, callback: Function, data: TaskData, customSchedule: (task: Task) => void,
        customCancel: (task: Task) => void): MacroTask;

    scheduleEventTask(
        source: string, callback: Function, data: TaskData, customSchedule: (task: Task) => void,
        customCancel: (task: Task) => void): EventTask;

    scheduleTask<T extends Task>(task: T): T;

    cancelTask(task: Task): any;

}

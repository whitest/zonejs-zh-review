interface ZoneDelegate {
    zone: Zone;
    fork(targetZone: Zone, zoneSpec: ZoneSpec): Zone;
    intercept(targetZone: Zone, callback: Function, source: string): Function;
    invoke(targetZone: Zone, callback: Function, applyThis: any, applyArgs: any[], source: string):
        any;
    handleError(targetZone: Zone, error: any): boolean;
    scheduleTask(targetZone: Zone, task: Task): Task;
    invokeTask(targetZone: Zone, task: Task, applyThis: any, applyArgs: any): any;
    cancelTask(targetZone: Zone, task: Task): any;
    hasTask(targetZone: Zone, isEmpty: HasTaskState): void;
}

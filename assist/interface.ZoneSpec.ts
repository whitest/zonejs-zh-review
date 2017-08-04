interface ZoneSpec {

    name: string;

    properties?: { [key: string]: any };

    onFork?:
    (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
        zoneSpec: ZoneSpec) => Zone;

    onIntercept?:
    (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, delegate: Function,
        source: string) => Function;

    onInvoke?:
    (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, delegate: Function,
        applyThis: any, applyArgs: any[], source: string) => any;

    onHandleError?:
    (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
        error: any) => boolean;

    onScheduleTask?:
    (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task) => Task;

    onInvokeTask?:
    (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task,
        applyThis: any, applyArgs: any) => any;

    onCancelTask?:
    (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task) => any;

    onHasTask?:
    (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
        hasTaskState: HasTaskState) => void;

}

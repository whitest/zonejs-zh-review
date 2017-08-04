type _PatchFn = (global: Window, Zone: ZoneType, api: _ZonePrivate) => void;

type HasTaskState = {
    microTask: boolean; macroTask: boolean; eventTask: boolean; change: TaskType;
};

type TaskType = 'microTask' | 'macroTask' | 'eventTask';

type TaskState = 'notScheduled' | 'scheduling' | 'scheduled' | 'running' | 'canceling' | 'unknown';


type AmbientZone = Zone;


type AmbientZoneDelegate = ZoneDelegate;

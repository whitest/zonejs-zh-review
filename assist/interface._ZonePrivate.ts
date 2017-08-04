interface _ZonePrivate {
    currentZoneFrame: () => _ZoneFrame;

    symbol: (name: string) => string;

    scheduleMicroTask: (task?: MicroTask) => void;

    onUnhandledError: (error: Error) => void;

    microtaskDrainDone: () => void;

    showUncaughtError: () => boolean;

    patchEventTarget: (global: any, apis: any[], options?: any) => boolean[];

    patchOnProperties: (obj: any, properties: string[]) => void;

    patchMethod:
    (target: any, name: string,
        patchFn: (delegate: Function, delegateName: string, name: string) =>
            (self: any, args: any[]) => any) => Function;

}

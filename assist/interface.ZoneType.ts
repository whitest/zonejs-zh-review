interface ZoneType {

    current: Zone;

    currentTask: Task;

    assertZonePatched(): void;

    root: Zone;

    /** @internal */
    __load_patch(name: string, fn: _PatchFn): void;

    /** @internal */
    __symbol__(name: string): string;
}

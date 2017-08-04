interface TaskData {
    /**
     * A periodic [MacroTask] is such which get automatically rescheduled after it is executed.
     */
    isPeriodic?: boolean;

    /**
     * Delay in milliseconds when the Task will run.
     */
    delay?: number;

    /**
     * identifier returned by the native setTimeout.
     */
    handleId?: number;
}

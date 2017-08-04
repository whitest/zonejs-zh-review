/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*
 * Suppress closure compiler errors about unknown 'global' variable
 *
 * 请关闭编辑器对于 “global” 变量的错误提示
 *
 * @fileoverview
 * @suppress {undefinedVars}
 */

/**
 * Zone is a mechanism for intercepting and keeping track of asynchronous work.
 *
 * Zone是拦截和跟踪异步工作的机制
 *
 *
 * A Zone is a global object which is configured with rules about how to intercept and keep track
 * of the asynchronous callbacks. Zone has these responsibilities:
 *
 * Zone是一个全局对象，它配置有关于如何拦截和跟踪异步回调的规则。 Zone有这些功能：
 *
 *
 * 1. Intercept asynchronous task scheduling
 * 2. Wrap callbacks for error-handling and zone tracking across async operations.
 * 3. Provide a way to attach data to zones
 * 4. Provide a context specific last frame error handling
 * 5. (Intercept blocking methods)
 *
 * 1. 拦截异步任务调度
 * 2. 包裹异步操作中的错误处理和跟踪回调
 * 3. 提供一种将数据附加到Zone的方法
 * 4. 提供上下文特定的最后一帧错误处理
 * 5. 拦截阻断方法
 *
 *
 * A zone by itself does not do anything, instead it relies on some other code to route existing
 * platform API through it. (The zone library ships with code which monkey patches all of the
 * browsers's asynchronous API and redirects them through the zone for interception.)
 *
 * zone本身不会做任何事情，而是依靠一些其他代码来通过它来路由现有的平台API。
 * （zone库附带的代码，猴子补丁所有浏览器的异步API，并将其重定向到拦截的区域。）
 *
 * In its simplest form a zone allows one to intercept the scheduling and calling of asynchronous
 * operations, and execute additional code before as well as after the asynchronous task. The rules
 * of interception are configured using [ZoneConfig]. There can be many different zone instances in
 * a system, but only one zone is active at any given time which can be retrieved using
 * [Zone#current].
 *
 * 在最简单的形式中，一个zone允许拦截异步操作的调度和调用，并在异步任务之前和之后执行附加代码。
 * 拦截规则使用[ZoneConfig]进行配置。
 * 系统中可以有许多不同的zone实例，但是在任何给定的时间只有一个zone是活动的，可以使用[Zone＃current]来检索。
 *
 *
 * ## Callback Wrapping
 *
 * ## 包裹回调
 *
 * An important aspect of the zones is that they should persist across asynchronous operations. To
 * achieve this, when a future work is scheduled through async API, it is necessary to capture, and
 * subsequently restore the current zone. For example if a code is running in zone `b` and it
 * invokes `setTimeout` to scheduleTask work later, the `setTimeout` method needs to 1) capture the
 * current zone and 2) wrap the `wrapCallback` in code which will restore the current zone `b` once
 * the wrapCallback executes. In this way the rules which govern the current code are preserved in
 * all future asynchronous tasks. There could be a different zone `c` which has different rules and
 * is associated with different asynchronous tasks. As these tasks are processed, each asynchronous
 * wrapCallback correctly restores the correct zone, as well as preserves the zone for future
 * asynchronous callbacks.
 *
 * 这些区域的一个重要方面是它们应该跨异步操作。
 * 为了实现这一点，当通过异步API调度未来的工作时，有必要捕获并随后还原当前区域。
 * 例如，如果一个代码在区域`b`中运行，并且调用`setTimeout`以稍后调度任务，那么`setTimeout`方法需要：
 * 1）捕捉当前的区域，并且
 * 2）在代码中包装`wrapCallback` wrapCallback执行后的当前区域`b`。
 * 以这种方式，管理当前代码的规则将在以后的所有异步任务中保留。
 * 可能有一个不同的区域`c'，它具有不同的规则，并且与不同的异步任务相关联。
 * 在处理这些任务时，每个异步wrapCallback都会正确恢复正确的区域，并保留该区域以供将来的异步回调
 *
 *
 * Example: Suppose a browser page consist of application code as well as third-party
 * advertisement code. (These two code bases are independent, developed by different mutually
 * unaware developers.) The application code may be interested in doing global error handling and
 * so it configures the `app` zone to send all of the errors to the server for analysis, and then
 * executes the application in the `app` zone. The advertising code is interested in the same
 * error processing but it needs to send the errors to a different third-party. So it creates the
 * `ads` zone with a different error handler. Now both advertising as well as application code
 * create many asynchronous operations, but the [Zone] will ensure that all of the asynchronous
 * operations created from the application code will execute in `app` zone with its error
 * handler and all of the advertisement code will execute in the `ads` zone with its error handler.
 * This will not only work for the async operations created directly, but also for all subsequent
 * asynchronous operations.
 *
 * 例如：假设浏览器页面包含应用程序代码以及第三方广告代码。（这两个代码库是独立的，由不同的相互不知情的开发人员开发）
 * 应用程序代码获取到一个全局的错误事件并且对“app”区域设置了向服务器提交所有捕获的错误用于分析，然后在“app”区域执行一段代码。
 * 广告代码也会获取到那个错误事件，但需要将错误发送到不同的第三方。所以它创建了具有不同错误处理程序的“ads”区域。
 * 这时应用程序代码和广告代码创建了很多异步操作，但是[Zone]将保证“app”区域执行应用代码的回调操作，“ads”区域执行广告代码的回调操作。
 * 这不仅适用于直接创建的异步操作，而且适用于所有后续的异步操作。
 *
 *
 * If you think of chain of asynchronous operations as a thread of execution (bit of a stretch)
 * then [Zone#current] will act as a thread local variable.
 *
 * 如果您将异步操作链视为执行线程（位），则[Zone＃current]将作为线程局部变量。
 *
 *
 * ## Asynchronous operation scheduling
 *
 * ## 异步运行调度
 *
 *
 * In addition to wrapping the callbacks to restore the zone, all operations which cause a
 * scheduling of work for later are routed through the current zone which is allowed to intercept
 * them by adding work before or after the wrapCallback as well as using different means of
 * achieving the request. (Useful for unit testing, or tracking of requests). In some instances
 * such as `setTimeout` the wrapping of the wrapCallback and scheduling is done in the same
 * wrapCallback, but there are other examples such as `Promises` where the `then` wrapCallback is
 * wrapped, but the execution of `then` in triggered by `Promise` scheduling `resolve` work.
 *
 * 除了包裹回调来重新建立zone之外，导致后期工作调度的所有操作都将通过当前区域进行路由，
 * 该区域允许通过在wrapCallback之前或之后添加工作来截获它们，并使用不同的实现请求的方法。
 * （用于单元测试或跟踪请求）
 * 在一些如“setTimeout”的实例方法中，包裹的wrapCallback和调度在相同的wrapCallback中完成，
 * 但是像“Promises”的实例方法，“then”的wrapCallback被包裹，“then”中执行的代码，调度在“resolve”中
 *
 *
 * Fundamentally there are three kinds of tasks which can be scheduled:
 *
 * 从根本上说，有三种可以安排的任务：
 *
 *
 * 1. [MicroTask] used for doing work right after the current task. This is non-cancelable which is
 *    guaranteed to run exactly once and immediately.
 * 2. [MacroTask] used for doing work later. Such as `setTimeout`. This is typically cancelable
 *    which is guaranteed to execute at least once after some well understood delay.
 * 3. [EventTask] used for listening on some future event. This may execute zero or more times, with
 *    an unknown delay.
 *
 * 1. [MicroTask] 用于在当前任务之后work。 这是不可取消的，保证运行一次并立即
 * 2. [MacroTask] 用于延时的work。如`setTimeout`。 这通常是可取消的，这被保证在一些很好理解的延迟之后至少执行一次
 * 3. [EventTask] 监听一些未来的事件。这可能会执行零次或多次，未知的延迟
 *
 * Each asynchronous API is modeled and routed through one of these APIs.
 *
 * 每个异步API都通过其中一个API进行建模和路由
 *
 *
 * ### [MicroTask]
 *
 * [MicroTask]s represent work which will be done in current VM turn as soon as possible, before VM
 * yielding.
 *
 * [MicroTask]s 表示那些在VM执行前，很快就在当前VM运行完成的代码
 *
 * ### [TimerTask]
 *
 * [TimerTask]s represent work which will be done after some delay. (Sometimes the delay is
 * approximate such as on next available animation frame). Typically these methods include:
 * `setTimeout`, `setImmediate`, `setInterval`, `requestAnimationFrame`, and all browser specif
 * variants.
 *
 * [TimerTask]s 代表在一些延时之后，运行完成的代码（有时，延迟是近似值，例如下一个可用的动画业务）。
 * 通常这些方法包括：`setTimeout`, `setImmediate`, `setInterval`, `requestAnimationFrame` 和所有浏览器自己的前缀变种
 *
 *
 * ### [EventTask]
 *
 * [EventTask]s represent a request to create a listener on an event. Unlike the other task
 * events may never be executed, but typically execute more than once. There is no queue of
 * events, rather their callbacks are unpredictable both in order and time.
 *
 * [EventTask]s 表示在事件上创建侦听器的请求。与其他任务不同，事件可能永远不会被执行，但通常执行不止一次。
 * 没有事件排队，但是他们的回调在顺序和时间上是不可预测的
 *
 * ## Global Error Handling
 *
 * ## Global 错误处理
 *
 *
 * ## Composability
 *
 * ## 组合性
 *
 *
 * Zones can be composed together through [Zone.fork()]. A child zone may create its own set of
 * rules. A child zone is expected to either:
 *
 * Zones 可以通过 [Zone.fork()] 进行合并。子zone可以创建自己的一套规则。一个子zone将会执行下面其中一条：
 *
 *
 * 1. Delegate the interception to a parent zone, and optionally add before and after wrapCallback
 *    hook.s
 * 2) Or process the request itself without delegation.
 *
 * 1. 将拦截委托给父zone，并且可选地在wrapCallback hook.s之前和之后添加
 *
 * 2. 不委托父zone直接处理
 *
 * Composability allows zones to keep their concerns clean. For example a top most zone may chose
 * to handle error handling, while child zones may chose to do user action tracking.
 *
 * 可组合性允许zones互不干涉。 例如，最顶层的zone可能会选择处理错误处理，而子zone可能会选择进行用户操作跟踪
 *
 *
 * ## Root Zone
 *
 * ## 根Zone
 *
 *
 * At the start the browser will run in a special root zone, which is configure to behave exactly
 * like the platform, making any existing code which is not-zone aware behave as expected. All
 * zones are children of the root zone.
 *
 * 一开始，浏览器将运行在一个特殊的根zone，该zone被配置为与该平台完全相似，使任何不区分zone的现有代码的行为与预期的一致。 所有zone都是根zone的子zone。
 *
 */
interface Zone {
    /**
     *
     * @returns {Zone} The parent Zone.    父级zone
     */
    parent: Zone;
    /**
     * @returns {string} The Zone name (useful for debugging)      zone名，调试时候用
     */
    name: string;

    /**
     * Returns a value associated with the `key`.
     *
     * If the current zone does not have a key, the request is delegated to the parent zone. Use
     * [ZoneSpec.properties] to configure the set of properties associated with the current zone.
     *
     *
     * 返回 “key” 相关的 值。
     * 如果当前zone没有key，请求会委托给父级zone。
     * 用 [ZoneSpec.properties] 去配置与当前区域相关联的一组属性
     *
     * @param key The key to retrieve.
     * @returns {any} The value for the key, or `undefined` if not found.
     */
    get(key: string): any;
    /**
     * Returns a Zone which defines a `key`.
     *
     * Recursively search the parent Zone until a Zone which has a property `key` is found.
     *
     * 返回一个定义了“key”的zone
     * 递归搜索父zone，直到找到具有属性“key”的zone
     *
     * @param key The key to use for identification of the returned zone.
     * @returns {Zone} The Zone which defines the `key`, `null` if not found.
     */
    getZoneWith(key: string): Zone;
    /**
     * Used to create a child zone.
     *
     * 用来创建一个子zone
     *
     * @param zoneSpec A set of rules which the child zone should follow. 子zone的一些配置
     * @returns {Zone} A new child zone.
     */
    fork(zoneSpec: ZoneSpec): Zone;
    /**
     * Wraps a callback function in a new function which will properly restore the current zone upon
     * invocation.
     *
     * The wrapped function will properly forward `this` as well as `arguments` to the `callback`.
     *
     * Before the function is wrapped the zone can intercept the `callback` by declaring
     * [ZoneSpec.onIntercept].
     *
     *
     * 在一个新的函数中包装一个回调函数，它将在调用时正确恢复当前区域
     *
     * 包装的函数将正确地将`this`以及`arguments`传递到'callback'
     *
     * 在函数被包装之前，该zone可以通过声明[ZoneSpec.onIntercept]拦截`callback'
     *
     * @param callback the function which will be wrapped in the zone.    在zone中被包裹的回调函数
     * @param source A unique debug location of the API being wrapped.    被包裹的api的debug位置
     * @returns {function(): *} A function which will invoke the `callback` through [Zone.runGuarded].    通过[Zone.runGuarded]调用callback的函数
     */
    wrap<F extends Function>(callback: F, source: string): F;
    /**
     * Invokes a function in a given zone.
     *
     * The invocation of `callback` can be intercepted by declaring [ZoneSpec.onInvoke].
     *
     * 运行zone
     * `callback`的运行，可以通过声明[ZoneSpec.onInvoke]来拦截
     *
     * @param callback The function to invoke.
     * @param applyThis
     * @param applyArgs
     * @param source A unique debug location of the API being invoked.
     * @returns {any} Value from the `callback` function.
     */
    run<T>(callback: Function, applyThis?: any, applyArgs?: any[], source?: string): T;
    /**
     * Invokes a function in a given zone and catches any exceptions.
     *
     * Any exceptions thrown will be forwarded to [Zone.HandleError].
     *
     * The invocation of `callback` can be intercepted by declaring [ZoneSpec.onInvoke]. The
     * handling of exceptions can intercepted by declaring [ZoneSpec.handleError].
     *
     * @param callback The function to invoke.
     * @param applyThis
     * @param applyArgs
     * @param source A unique debug location of the API being invoked.
     * @returns {any} Value from the `callback` function.
     */
    runGuarded<T>(callback: Function, applyThis?: any, applyArgs?: any[], source?: string): T;
    /**
     * Execute the Task by restoring the [Zone.currentTask] in the Task's zone.
     *
     * @param task to run
     * @param applyThis
     * @param applyArgs
     * @returns {*}
     */
    runTask(task: Task, applyThis?: any, applyArgs?: any): any;

    /**
     * Schedule a MicroTask.
     *
     * @param source
     * @param callback
     * @param data
     * @param customSchedule
     */
    scheduleMicroTask(
        source: string, callback: Function, data?: TaskData,
        customSchedule?: (task: Task) => void): MicroTask;

    /**
     * Schedule a MacroTask.
     *
     * @param source
     * @param callback
     * @param data
     * @param customSchedule
     * @param customCancel
     */
    scheduleMacroTask(
        source: string, callback: Function, data: TaskData, customSchedule: (task: Task) => void,
        customCancel: (task: Task) => void): MacroTask;

    /**
     * Schedule an EventTask.
     *
     * @param source
     * @param callback
     * @param data
     * @param customSchedule
     * @param customCancel
     */
    scheduleEventTask(
        source: string, callback: Function, data: TaskData, customSchedule: (task: Task) => void,
        customCancel: (task: Task) => void): EventTask;

    /**
     * Schedule an existing Task.
     *
     * Useful for rescheduling a task which was already canceled.
     *
     * @param task
     */
    scheduleTask<T extends Task>(task: T): T;

    /**
     * Allows the zone to intercept canceling of scheduled Task.
     *
     * The interception is configured using [ZoneSpec.onCancelTask]. The default canceler invokes
     * the [Task.cancelFn].
     *
     * @param task
     * @returns {any}
     */
    cancelTask(task: Task): any;
}

interface ZoneType {
    /**
     * @returns {Zone} Returns the current [Zone]. Returns the current zone. The only way to change
     * the current zone is by invoking a run() method, which will update the current zone for the
     * duration of the run method callback.
     */
    current: Zone;
    /**
     * @returns {Task} The task associated with the current execution.
     */
    currentTask: Task;

    /**
     * Verify that Zone has been correctly patched. Specifically that Promise is zone aware.
     */
    assertZonePatched(): void;

    /**
     *  Return the root zone.
     */
    root: Zone;

    /** @internal */
    __load_patch(name: string, fn: _PatchFn): void;

    /** @internal */
    __symbol__(name: string): string;
}

/** @internal */
type _PatchFn = (global: Window, Zone: ZoneType, api: _ZonePrivate) => void;

/** @internal */
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

/** @internal */
interface _ZoneFrame {
    parent: _ZoneFrame;
    zone: Zone;
}

/**
 * Provides a way to configure the interception of zone events.
 *
 * Only the `name` property is required (all other are optional).
 */
interface ZoneSpec {
    /**
     * The name of the zone. Useful when debugging Zones.
     */
    name: string;

    /**
     * A set of properties to be associated with Zone. Use [Zone.get] to retrieve them.
     */
    properties?: { [key: string]: any };

    /**
     * Allows the interception of zone forking.
     *
     * When the zone is being forked, the request is forwarded to this method for interception.
     *
     * @param parentZoneDelegate Delegate which performs the parent [ZoneSpec] operation.
     * @param currentZone The current [Zone] where the current interceptor has been declared.
     * @param targetZone The [Zone] which originally received the request.
     * @param zoneSpec The argument passed into the `fork` method.
     */
    onFork?:
    (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
        zoneSpec: ZoneSpec) => Zone;

    /**
     * Allows interception of the wrapping of the callback.
     *
     * @param parentZoneDelegate Delegate which performs the parent [ZoneSpec] operation.
     * @param currentZone The current [Zone] where the current interceptor has been declared.
     * @param targetZone The [Zone] which originally received the request.
     * @param delegate The argument passed into the `warp` method.
     * @param source The argument passed into the `warp` method.
     */
    onIntercept?:
    (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, delegate: Function,
        source: string) => Function;

    /**
     * Allows interception of the callback invocation.
     *
     * @param parentZoneDelegate Delegate which performs the parent [ZoneSpec] operation.
     * @param currentZone The current [Zone] where the current interceptor has been declared.
     * @param targetZone The [Zone] which originally received the request.
     * @param delegate The argument passed into the `run` method.
     * @param applyThis The argument passed into the `run` method.
     * @param applyArgs The argument passed into the `run` method.
     * @param source The argument passed into the `run` method.
     */
    onInvoke?:
    (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, delegate: Function,
        applyThis: any, applyArgs: any[], source: string) => any;

    /**
     * Allows interception of the error handling.
     *
     * @param parentZoneDelegate Delegate which performs the parent [ZoneSpec] operation.
     * @param currentZone The current [Zone] where the current interceptor has been declared.
     * @param targetZone The [Zone] which originally received the request.
     * @param error The argument passed into the `handleError` method.
     */
    onHandleError?:
    (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
        error: any) => boolean;

    /**
     * Allows interception of task scheduling.
     *
     * @param parentZoneDelegate Delegate which performs the parent [ZoneSpec] operation.
     * @param currentZone The current [Zone] where the current interceptor has been declared.
     * @param targetZone The [Zone] which originally received the request.
     * @param task The argument passed into the `scheduleTask` method.
     */
    onScheduleTask?:
    (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task) => Task;

    onInvokeTask?:
    (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task,
        applyThis: any, applyArgs: any) => any;

    /**
     * Allows interception of task cancellation.
     *
     * @param parentZoneDelegate Delegate which performs the parent [ZoneSpec] operation.
     * @param currentZone The current [Zone] where the current interceptor has been declared.
     * @param targetZone The [Zone] which originally received the request.
     * @param task The argument passed into the `cancelTask` method.
     */
    onCancelTask?:
    (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task) => any;

    /**
     * Notifies of changes to the task queue empty status.
     *
     * @param parentZoneDelegate Delegate which performs the parent [ZoneSpec] operation.
     * @param currentZone The current [Zone] where the current interceptor has been declared.
     * @param targetZone The [Zone] which originally received the request.
     * @param hasTaskState
     */
    onHasTask?:
    (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
        hasTaskState: HasTaskState) => void;
}


/**
 *  A delegate when intercepting zone operations.
 *
 *  A ZoneDelegate is needed because a child zone can't simply invoke a method on a parent zone. For
 *  example a child zone wrap can't just call parent zone wrap. Doing so would create a callback
 *  which is bound to the parent zone. What we are interested is intercepting the callback before it
 *  is bound to any zone. Furthermore, we also need to pass the targetZone (zone which received the
 *  original request) to the delegate.
 *
 *  The ZoneDelegate methods mirror those of Zone with an addition of extra targetZone argument in
 *  the method signature. (The original Zone which received the request.) Some methods are renamed
 *  to prevent confusion, because they have slightly different semantics and arguments.
 *
 *  - `wrap` => `intercept`: The `wrap` method delegates to `intercept`. The `wrap` method returns
 *     a callback which will run in a given zone, where as intercept allows wrapping the callback
 *     so that additional code can be run before and after, but does not associated the callback
 *     with the zone.
 *  - `run` => `invoke`: The `run` method delegates to `invoke` to perform the actual execution of
 *     the callback. The `run` method switches to new zone; saves and restores the `Zone.current`;
 *     and optionally performs error handling. The invoke is not responsible for error handling,
 *     or zone management.
 *
 *  Not every method is usually overwritten in the child zone, for this reason the ZoneDelegate
 *  stores the closest zone which overwrites this behavior along with the closest ZoneSpec.
 *
 *  NOTE: We have tried to make this API analogous to Event bubbling with target and current
 *  properties.
 *
 *  Note: The ZoneDelegate treats ZoneSpec as class. This allows the ZoneSpec to use its `this` to
 *  store internal state.
 */
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

type HasTaskState = {
    microTask: boolean; macroTask: boolean; eventTask: boolean; change: TaskType;
};

/**
 * Task type: `microTask`, `macroTask`, `eventTask`.
 */
type TaskType = 'microTask' | 'macroTask' | 'eventTask';

/**
 * Task type: `notScheduled`, `scheduling`, `scheduled`, `running`, `canceling`, 'unknown'.
 */
type TaskState = 'notScheduled' | 'scheduling' | 'scheduled' | 'running' | 'canceling' | 'unknown';


/**
 */
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

/**
 * Represents work which is executed with a clean stack.
 *
 * 表示使用干净堆栈执行的工作
 *
 *
 * Tasks are used in Zones to mark work which is performed on clean stack frame. There are three
 * kinds of task. [MicroTask], [MacroTask], and [EventTask].
 *
 * A JS VM can be modeled as a [MicroTask] queue, [MacroTask] queue, and [EventTask] set.
 *
 * - [MicroTask] queue represents a set of tasks which are executing right after the current stack
 *   frame becomes clean and before a VM yield. All [MicroTask]s execute in order of insertion
 *   before VM yield and the next [MacroTask] is executed.
 * - [MacroTask] queue represents a set of tasks which are executed one at a time after each VM
 *   yield. The queue is order by time, and insertions can happen in any location.
 * - [EventTask] is a set of tasks which can at any time be inserted to the end of the [MacroTask]
 *   queue. This happens when the event fires.
 *
 */
interface Task {
    /**
     * Task type: `microTask`, `macroTask`, `eventTask`.
     */
    type: TaskType;

    /**
     * Task state: `notScheduled`, `scheduling`, `scheduled`, `running`, `canceling`, `unknown`.
     */
    state: TaskState;

    /**
     * Debug string representing the API which requested the scheduling of the task.
     */
    source: string;

    /**
     * The Function to be used by the VM on entering the [Task]. This function will delegate to
     * [Zone.runTask] and delegate to `callback`.
     */
    invoke: Function;

    /**
     * Function which needs to be executed by the Task after the [Zone.currentTask] has been set to
     * the current task.
     */
    callback: Function;

    /**
     * Task specific options associated with the current task. This is passed to the `scheduleFn`.
     */
    data: TaskData;

    /**
     * Represents the default work which needs to be done to schedule the Task by the VM.
     *
     * A zone may chose to intercept this function and perform its own scheduling.
     */
    scheduleFn: (task: Task) => void;

    /**
     * Represents the default work which needs to be done to un-schedule the Task from the VM. Not all
     * Tasks are cancelable, and therefore this method is optional.
     *
     * A zone may chose to intercept this function and perform its own scheduling.
     */
    cancelFn: (task: Task) => void;

    /**
     * @type {Zone} The zone which will be used to invoke the `callback`. The Zone is captured
     * at the time of Task creation.
     */
    readonly zone: Zone;

/**
 * Number of times the task has been executed, or -1 if canceled.
 */
runCount: number;

/**
 * Cancel the scheduling request. This method can be called from `ZoneSpec.onScheduleTask` to
 * cancel the current scheduling interception. Once canceled the task can be discarded or
 * rescheduled using `Zone.scheduleTask` on a different zone.
 */
cancelScheduleRequest(): void;
}

interface MicroTask extends Task {
    type: 'microTask';
}

interface MacroTask extends Task {
    type: 'macroTask';
}

interface EventTask extends Task {
    type: 'eventTask';
}

/** @internal */
type AmbientZone = Zone;
/** @internal */
type AmbientZoneDelegate = ZoneDelegate;

const Zone: ZoneType = (function(global: any) {
    const performance: { mark(name: string): void; measure(name: string, label: string): void; } =
        global['performance'];
    function mark(name: string) {
        performance && performance['mark'] && performance['mark'](name);
    }
    function performanceMeasure(name: string, label: string) {
        performance && performance['measure'] && performance['measure'](name, label);
    }
    mark('Zone');
    if (global['Zone']) {
        throw new Error('Zone already loaded.');
    }

    class Zone implements AmbientZone {
        static __symbol__: (name: string) => string = __symbol__;

        static assertZonePatched() {
            if (global['Promise'] !== patches['ZoneAwarePromise']) {
                throw new Error(
                    'Zone.js has detected that ZoneAwarePromise `(window|global).Promise` ' +
                    'has been overwritten.\n' +
                    'Most likely cause is that a Promise polyfill has been loaded ' +
                    'after Zone.js (Polyfilling Promise api is not necessary when zone.js is loaded. ' +
                    'If you must load one, do so before loading zone.js.)');
            }
        }

        /**
         * @desc 返回根root
         *
         * @desc 静态get写法
         *       等同于：
         *       Object.defineProperty(Zone, 'root', {
         *          get(){
         *              // ...
         *          },
         *          enumerable: true,
         *          configurable: true,
         *       });
         * @return {AmbientZone} [description]
         */
        static get root(): AmbientZone {
            let zone = Zone.current;
            while (zone.parent) {
                zone = zone.parent;
            }
            return zone;
        }

        /**
         * @desc 返回当前zone
         * @return {AmbientZone} [description]
         */
        static get current(): AmbientZone {
            return _currentZoneFrame.zone;
        };

        /**
         * @desc 返回当前task
         * @return {Task} [description]
         */
        static get currentTask(): Task {
            return _currentTask;
        };

        /**
         * @desc 往 patches 加方法
         * @param {string}   name [description]
         * @param {_PatchFn} fn   [description]
         */
        static __load_patch(name: string, fn: _PatchFn): void {
            if (patches.hasOwnProperty(name)) {
                throw Error('Already loaded patch: ' + name);
            } else if (!global['__Zone_disable_' + name]) {
                const perfName = 'Zone:' + name;
                mark(perfName);
                patches[name] = fn(global, Zone, _api);
                performanceMeasure(perfName, perfName);
            }
        }

        /**
         * @desc 获取 parent root
         * @return {AmbientZone} [description]
         */
        public get parent(): AmbientZone {
            return this._parent;
        };

        /**
         * @desc zone的name
         * @return {string} [description]
         */
        public get name(): string {
            return this._name;
        };


        private _parent: Zone;
        private _name: string;
        private _properties: { [key: string]: any } = null;
        private _zoneDelegate: ZoneDelegate;

        constructor(parent: Zone, zoneSpec: ZoneSpec) {
            this._parent = parent;
            this._name = zoneSpec ? zoneSpec.name || 'unnamed' : '<root>';
            this._properties = zoneSpec && zoneSpec.properties || {};
            this._zoneDelegate =
                new ZoneDelegate(this, this._parent && this._parent._zoneDelegate, zoneSpec);
        }

        public get(key: string): any {
            const zone: Zone = this.getZoneWith(key) as Zone;
            if (zone) return zone._properties[key];
        }


        /**
         * [getZoneWith description]
         * @desc 传入一个key，返回这个key所在的zone
         *
         * @param  {string}      key [description]
         * @return {AmbientZone}     [description]
         */
        public getZoneWith(key: string): AmbientZone {
            let current: Zone = this;
            while (current) {
                if (current._properties.hasOwnProperty(key)) {
                    return current;
                }
                current = current._parent;
            }
            return null;
        }

        /**
         * [fork description]
         * @desc 对 ZoneSpec 进行加载
         *       先去搞清楚 zoneDelegate
         * @param  {ZoneSpec}    zoneSpec [description]
         * @return {AmbientZone}          [description]
         */
        public fork(zoneSpec: ZoneSpec): AmbientZone {
            if (!zoneSpec) throw new Error('ZoneSpec required!');
            return this._zoneDelegate.fork(this, zoneSpec);
        }

        public wrap<T extends Function>(callback: T, source: string): T {
            if (typeof callback !== 'function') {
                throw new Error('Expecting function got: ' + callback);
            }
            const _callback = this._zoneDelegate.intercept(this, callback, source);
            const zone: Zone = this;
            return function() {
                return zone.runGuarded(_callback, this, <any>arguments, source);
            } as any as T;
        }

        public run(callback: Function, applyThis?: any, applyArgs?: any[], source?: string): any;
        public run<T>(
            callback: (...args: any[]) => T, applyThis: any = undefined, applyArgs: any[] = null,
            source: string = null): T {
            _currentZoneFrame = { parent: _currentZoneFrame, zone: this };
            try {
                return this._zoneDelegate.invoke(this, callback, applyThis, applyArgs, source);
            } finally {
                _currentZoneFrame = _currentZoneFrame.parent;
            }
        }

        public runGuarded(callback: Function, applyThis?: any, applyArgs?: any[], source?: string): any;
        public runGuarded<T>(
            callback: (...args: any[]) => T, applyThis: any = null, applyArgs: any[] = null,
            source: string = null) {
            _currentZoneFrame = { parent: _currentZoneFrame, zone: this };
            try {
                try {
                    return this._zoneDelegate.invoke(this, callback, applyThis, applyArgs, source);
                } catch (error) {
                    if (this._zoneDelegate.handleError(this, error)) {
                        throw error;
                    }
                }
            } finally {
                _currentZoneFrame = _currentZoneFrame.parent;
            }
        }


        runTask(task: Task, applyThis?: any, applyArgs?: any): any {
            if (task.zone != this) {
                throw new Error(
                    'A task can only be run in the zone of creation! (Creation: ' +
                    (task.zone || NO_ZONE).name + '; Execution: ' + this.name + ')');
            }
            // https://github.com/angular/zone.js/issues/778, sometimes eventTask
            // will run in notScheduled(canceled) state, we should not try to
            // run such kind of task but just return

            // we have to define an variable here, if not
            // typescript compiler will complain below
            const isNotScheduled = task.state === notScheduled;
            if (isNotScheduled && task.type === eventTask) {
                return;
            }

            const reEntryGuard = task.state != running;
            reEntryGuard && (task as ZoneTask<any>)._transitionTo(running, scheduled);
            task.runCount++;
            const previousTask = _currentTask;
            _currentTask = task;
            _currentZoneFrame = { parent: _currentZoneFrame, zone: this };
            try {
                if (task.type == macroTask && task.data && !task.data.isPeriodic) {
                    task.cancelFn = null;
                }
                try {
                    return this._zoneDelegate.invokeTask(this, task, applyThis, applyArgs);
                } catch (error) {
                    if (this._zoneDelegate.handleError(this, error)) {
                        throw error;
                    }
                }
            } finally {
                // if the task's state is notScheduled or unknown, then it has already been cancelled
                // we should not reset the state to scheduled
                if (task.state !== notScheduled && task.state !== unknown) {
                    if (task.type == eventTask || (task.data && task.data.isPeriodic)) {
                        reEntryGuard && (task as ZoneTask<any>)._transitionTo(scheduled, running);
                    } else {
                        task.runCount = 0;
                        this._updateTaskCount(task as ZoneTask<any>, -1);
                        reEntryGuard &&
                            (task as ZoneTask<any>)._transitionTo(notScheduled, running, notScheduled);
                    }
                }
                _currentZoneFrame = _currentZoneFrame.parent;
                _currentTask = previousTask;
            }
        }

        scheduleTask<T extends Task>(task: T): T {
            if (task.zone && task.zone !== this) {
                // check if the task was rescheduled, the newZone
                // should not be the children of the original zone
                let newZone: any = this;
                while (newZone) {
                    if (newZone === task.zone) {
                        throw Error(`can not reschedule task to ${this
                            .name} which is descendants of the original zone ${task.zone.name}`);
                    }
                    newZone = newZone.parent;
                }
            }
            (task as any as ZoneTask<any>)._transitionTo(scheduling, notScheduled);
            const zoneDelegates: ZoneDelegate[] = [];
            (task as any as ZoneTask<any>)._zoneDelegates = zoneDelegates;
            (task as any as ZoneTask<any>)._zone = this;
            try {
                task = this._zoneDelegate.scheduleTask(this, task) as T;
            } catch (err) {
                // should set task's state to unknown when scheduleTask throw error
                // because the err may from reschedule, so the fromState maybe notScheduled
                (task as any as ZoneTask<any>)._transitionTo(unknown, scheduling, notScheduled);
                // TODO: @JiaLiPassion, should we check the result from handleError?
                this._zoneDelegate.handleError(this, err);
                throw err;
            }
            if ((task as any as ZoneTask<any>)._zoneDelegates === zoneDelegates) {
                // we have to check because internally the delegate can reschedule the task.
                this._updateTaskCount(task as any as ZoneTask<any>, 1);
            }
            if ((task as any as ZoneTask<any>).state == scheduling) {
                (task as any as ZoneTask<any>)._transitionTo(scheduled, scheduling);
            }
            return task;
        }

        scheduleMicroTask(
            source: string, callback: Function, data?: TaskData,
            customSchedule?: (task: Task) => void): MicroTask {
            return this.scheduleTask(
                new ZoneTask(microTask, source, callback, data, customSchedule, null));
        }

        scheduleMacroTask(
            source: string, callback: Function, data: TaskData, customSchedule: (task: Task) => void,
            customCancel: (task: Task) => void): MacroTask {
            return this.scheduleTask(
                new ZoneTask(macroTask, source, callback, data, customSchedule, customCancel));
        }

        scheduleEventTask(
            source: string, callback: Function, data: TaskData, customSchedule: (task: Task) => void,
            customCancel: (task: Task) => void): EventTask {
            return this.scheduleTask(
                new ZoneTask(eventTask, source, callback, data, customSchedule, customCancel));
        }

        cancelTask(task: Task): any {
            if (task.zone != this)
                throw new Error(
                    'A task can only be cancelled in the zone of creation! (Creation: ' +
                    (task.zone || NO_ZONE).name + '; Execution: ' + this.name + ')');
            (task as ZoneTask<any>)._transitionTo(canceling, scheduled, running);
            try {
                this._zoneDelegate.cancelTask(this, task);
            } catch (err) {
                // if error occurs when cancelTask, transit the state to unknown
                (task as ZoneTask<any>)._transitionTo(unknown, canceling);
                this._zoneDelegate.handleError(this, err);
                throw err;
            }
            this._updateTaskCount(task as ZoneTask<any>, -1);
            (task as ZoneTask<any>)._transitionTo(notScheduled, canceling);
            task.runCount = 0;
            return task;
        }

        private _updateTaskCount(task: ZoneTask<any>, count: number) {
            const zoneDelegates = task._zoneDelegates;
            if (count == -1) {
                task._zoneDelegates = null;
            }
            for (let i = 0; i < zoneDelegates.length; i++) {
                zoneDelegates[i]._updateTaskCount(task.type, count);
            }
        }
    }

    const DELEGATE_ZS: ZoneSpec = {
        name: '',
        onHasTask: (delegate: ZoneDelegate, _: Zone, target: Zone, hasTaskState: HasTaskState): void =>
            delegate.hasTask(target, hasTaskState),
        onScheduleTask: (delegate: ZoneDelegate, _: Zone, target: Zone, task: Task): Task =>
            delegate.scheduleTask(target, task),
        onInvokeTask: (delegate: ZoneDelegate, _: Zone, target: Zone, task: Task, applyThis: any,
            applyArgs: any): any => delegate.invokeTask(target, task, applyThis, applyArgs),
        onCancelTask: (delegate: ZoneDelegate, _: Zone, target: Zone, task: Task): any =>
            delegate.cancelTask(target, task)
    };

    class ZoneDelegate implements AmbientZoneDelegate {
        public zone: Zone;

        private _taskCounts: {
            microTask: number,
            macroTask: number,
            eventTask: number
        } = { 'microTask': 0, 'macroTask': 0, 'eventTask': 0 };

        private _parentDelegate: ZoneDelegate;

        private _forkDlgt: ZoneDelegate;
        private _forkZS: ZoneSpec;
        private _forkCurrZone: Zone;

        private _interceptDlgt: ZoneDelegate;
        private _interceptZS: ZoneSpec;
        private _interceptCurrZone: Zone;

        private _invokeDlgt: ZoneDelegate;
        private _invokeZS: ZoneSpec;
        private _invokeCurrZone: Zone;

        private _handleErrorDlgt: ZoneDelegate;
        private _handleErrorZS: ZoneSpec;
        private _handleErrorCurrZone: Zone;

        private _scheduleTaskDlgt: ZoneDelegate;
        private _scheduleTaskZS: ZoneSpec;
        private _scheduleTaskCurrZone: Zone;

        private _invokeTaskDlgt: ZoneDelegate;
        private _invokeTaskZS: ZoneSpec;
        private _invokeTaskCurrZone: Zone;

        private _cancelTaskDlgt: ZoneDelegate;
        private _cancelTaskZS: ZoneSpec;
        private _cancelTaskCurrZone: Zone;

        private _hasTaskDlgt: ZoneDelegate;
        private _hasTaskDlgtOwner: ZoneDelegate;
        private _hasTaskZS: ZoneSpec;
        private _hasTaskCurrZone: Zone;

        constructor(zone: Zone, parentDelegate: ZoneDelegate, zoneSpec: ZoneSpec) {
            this.zone = zone;
            this._parentDelegate = parentDelegate;

            this._forkZS = zoneSpec && (zoneSpec && zoneSpec.onFork ? zoneSpec : parentDelegate._forkZS);
            this._forkDlgt = zoneSpec && (zoneSpec.onFork ? parentDelegate : parentDelegate._forkDlgt);
            this._forkCurrZone = zoneSpec && (zoneSpec.onFork ? this.zone : parentDelegate.zone);

            this._interceptZS =
                zoneSpec && (zoneSpec.onIntercept ? zoneSpec : parentDelegate._interceptZS);
            this._interceptDlgt =
                zoneSpec && (zoneSpec.onIntercept ? parentDelegate : parentDelegate._interceptDlgt);
            this._interceptCurrZone =
                zoneSpec && (zoneSpec.onIntercept ? this.zone : parentDelegate.zone);

            this._invokeZS = zoneSpec && (zoneSpec.onInvoke ? zoneSpec : parentDelegate._invokeZS);
            this._invokeDlgt =
                zoneSpec && (zoneSpec.onInvoke ? parentDelegate : parentDelegate._invokeDlgt);
            this._invokeCurrZone = zoneSpec && (zoneSpec.onInvoke ? this.zone : parentDelegate.zone);

            this._handleErrorZS =
                zoneSpec && (zoneSpec.onHandleError ? zoneSpec : parentDelegate._handleErrorZS);
            this._handleErrorDlgt =
                zoneSpec && (zoneSpec.onHandleError ? parentDelegate : parentDelegate._handleErrorDlgt);
            this._handleErrorCurrZone =
                zoneSpec && (zoneSpec.onHandleError ? this.zone : parentDelegate.zone);

            this._scheduleTaskZS =
                zoneSpec && (zoneSpec.onScheduleTask ? zoneSpec : parentDelegate._scheduleTaskZS);
            this._scheduleTaskDlgt =
                zoneSpec && (zoneSpec.onScheduleTask ? parentDelegate : parentDelegate._scheduleTaskDlgt);
            this._scheduleTaskCurrZone =
                zoneSpec && (zoneSpec.onScheduleTask ? this.zone : parentDelegate.zone);

            this._invokeTaskZS =
                zoneSpec && (zoneSpec.onInvokeTask ? zoneSpec : parentDelegate._invokeTaskZS);
            this._invokeTaskDlgt =
                zoneSpec && (zoneSpec.onInvokeTask ? parentDelegate : parentDelegate._invokeTaskDlgt);
            this._invokeTaskCurrZone =
                zoneSpec && (zoneSpec.onInvokeTask ? this.zone : parentDelegate.zone);

            this._cancelTaskZS =
                zoneSpec && (zoneSpec.onCancelTask ? zoneSpec : parentDelegate._cancelTaskZS);
            this._cancelTaskDlgt =
                zoneSpec && (zoneSpec.onCancelTask ? parentDelegate : parentDelegate._cancelTaskDlgt);
            this._cancelTaskCurrZone =
                zoneSpec && (zoneSpec.onCancelTask ? this.zone : parentDelegate.zone);

            this._hasTaskZS = null;
            this._hasTaskDlgt = null;
            this._hasTaskDlgtOwner = null;
            this._hasTaskCurrZone = null;

            const zoneSpecHasTask = zoneSpec && zoneSpec.onHasTask;
            const parentHasTask = parentDelegate && parentDelegate._hasTaskZS;
            if (zoneSpecHasTask || parentHasTask) {
                // If we need to report hasTask, than this ZS needs to do ref counting on tasks. In such
                // a case all task related interceptors must go through this ZD. We can't short circuit it.
                this._hasTaskZS = zoneSpecHasTask ? zoneSpec : DELEGATE_ZS;
                this._hasTaskDlgt = parentDelegate;
                this._hasTaskDlgtOwner = this;
                this._hasTaskCurrZone = zone;
                if (!zoneSpec.onScheduleTask) {
                    this._scheduleTaskZS = DELEGATE_ZS;
                    this._scheduleTaskDlgt = parentDelegate;
                    this._scheduleTaskCurrZone = this.zone;
                }
                if (!zoneSpec.onInvokeTask) {
                    this._invokeTaskZS = DELEGATE_ZS;
                    this._invokeTaskDlgt = parentDelegate;
                    this._invokeTaskCurrZone = this.zone;
                }
                if (!zoneSpec.onCancelTask) {
                    this._cancelTaskZS = DELEGATE_ZS;
                    this._cancelTaskDlgt = parentDelegate;
                    this._cancelTaskCurrZone = this.zone;
                }
            }
        }

        fork(targetZone: Zone, zoneSpec: ZoneSpec): AmbientZone {
            return this._forkZS ? this._forkZS.onFork(this._forkDlgt, this.zone, targetZone, zoneSpec) :
                new Zone(targetZone, zoneSpec);
        }

        intercept(targetZone: Zone, callback: Function, source: string): Function {
            return this._interceptZS ?
                this._interceptZS.onIntercept(
                    this._interceptDlgt, this._interceptCurrZone, targetZone, callback, source) :
                callback;
        }

        invoke(targetZone: Zone, callback: Function, applyThis: any, applyArgs: any[], source: string):
            any {
            return this._invokeZS ?
                this._invokeZS.onInvoke(
                    this._invokeDlgt, this._invokeCurrZone, targetZone, callback, applyThis, applyArgs,
                    source) :
                callback.apply(applyThis, applyArgs);
        }

        handleError(targetZone: Zone, error: any): boolean {
            return this._handleErrorZS ?
                this._handleErrorZS.onHandleError(
                    this._handleErrorDlgt, this._handleErrorCurrZone, targetZone, error) :
                true;
        }

        scheduleTask(targetZone: Zone, task: Task): Task {
            let returnTask: ZoneTask<any> = task as ZoneTask<any>;
            if (this._scheduleTaskZS) {
                if (this._hasTaskZS) {
                    returnTask._zoneDelegates.push(this._hasTaskDlgtOwner);
                }
                returnTask = this._scheduleTaskZS.onScheduleTask(
                    this._scheduleTaskDlgt, this._scheduleTaskCurrZone, targetZone, task) as ZoneTask<any>;
                if (!returnTask) returnTask = task as ZoneTask<any>;
            } else {
                if (task.scheduleFn) {
                    task.scheduleFn(task);
                } else if (task.type == microTask) {
                    scheduleMicroTask(<MicroTask>task);
                } else {
                    throw new Error('Task is missing scheduleFn.');
                }
            }
            return returnTask;
        }

        invokeTask(targetZone: Zone, task: Task, applyThis: any, applyArgs: any): any {
            return this._invokeTaskZS ?
                this._invokeTaskZS.onInvokeTask(
                    this._invokeTaskDlgt, this._invokeTaskCurrZone, targetZone, task, applyThis,
                    applyArgs) :
                task.callback.apply(applyThis, applyArgs);
        }

        cancelTask(targetZone: Zone, task: Task): any {
            let value: any;
            if (this._cancelTaskZS) {
                value = this._cancelTaskZS.onCancelTask(
                    this._cancelTaskDlgt, this._cancelTaskCurrZone, targetZone, task);
            } else {
                if (!task.cancelFn) {
                    throw Error('Task is not cancelable');
                }
                value = task.cancelFn(task);
            }
            return value;
        }

        hasTask(targetZone: Zone, isEmpty: HasTaskState) {
            // hasTask should not throw error so other ZoneDelegate
            // can still trigger hasTask callback
            try {
                return this._hasTaskZS &&
                    this._hasTaskZS.onHasTask(
                        this._hasTaskDlgt, this._hasTaskCurrZone, targetZone, isEmpty);
            } catch (err) {
                this.handleError(targetZone, err);
            }
        }

        _updateTaskCount(type: TaskType, count: number) {
            const counts = this._taskCounts;
            const prev = (counts as any)[type];
            const next = (counts as any)[type] = prev + count;
            if (next < 0) {
                throw new Error('More tasks executed then were scheduled.');
            }
            if (prev == 0 || next == 0) {
                const isEmpty: HasTaskState = {
                    microTask: counts.microTask > 0,
                    macroTask: counts.macroTask > 0,
                    eventTask: counts.eventTask > 0,
                    change: type
                };
                this.hasTask(this.zone, isEmpty);
            }
        }
    }

    class ZoneTask<T extends TaskType> implements Task {
        public type: T;
        public source: string;
        public invoke: Function;
        public callback: Function;
        public data: TaskData;
        public scheduleFn: (task: Task) => void;
        public cancelFn: (task: Task) => void;
        _zone: Zone = null;
        public runCount: number = 0;
        _zoneDelegates: ZoneDelegate[] = null;
        _state: TaskState = 'notScheduled';

        constructor(
            type: T, source: string, callback: Function, options: TaskData,
            scheduleFn: (task: Task) => void, cancelFn: (task: Task) => void) {
            this.type = type;
            this.source = source;
            this.data = options;
            this.scheduleFn = scheduleFn;
            this.cancelFn = cancelFn;
            this.callback = callback;
            const self = this;
            if (type === eventTask && options && (options as any).isUsingGlobalCallback) {
                this.invoke = ZoneTask.invokeTask;
            } else {
                this.invoke = function() {
                    return ZoneTask.invokeTask.apply(global, [self, this, <any>arguments]);
                };
            }
        }

        static invokeTask(task: any, target: any, args: any): any {
            if (!task) {
                task = this;
            }
            _numberOfNestedTaskFrames++;
            try {
                task.runCount++;
                return task.zone.runTask(task, target, args);
            } finally {
                if (_numberOfNestedTaskFrames == 1) {
                    drainMicroTaskQueue();
                }
                _numberOfNestedTaskFrames--;
            }
        }

        get zone(): Zone {
            return this._zone;
        }

        get state(): TaskState {
            return this._state;
        }

        public cancelScheduleRequest() {
            this._transitionTo(notScheduled, scheduling);
        }

        _transitionTo(toState: TaskState, fromState1: TaskState, fromState2?: TaskState) {
            if (this._state === fromState1 || this._state === fromState2) {
                this._state = toState;
                if (toState == notScheduled) {
                    this._zoneDelegates = null;
                }
            } else {
                throw new Error(
                    `${this.type} '${this.source}': can not transition to '${toState
                    }', expecting state '${fromState1}'${fromState2 ?
                        ' or \'' + fromState2 + '\'' :
                        ''
                    }, was '${this._state}'.`);
            }
        }

        public toString() {
            if (this.data && typeof this.data.handleId !== 'undefined') {
                return this.data.handleId;
            } else {
                return Object.prototype.toString.call(this);
            }
        }

        // add toJSON method to prevent cyclic error when
        // call JSON.stringify(zoneTask)
        public toJSON() {
            return {
                type: this.type,
                state: this.state,
                source: this.source,
                zone: this.zone.name,
                invoke: this.invoke,
                scheduleFn: this.scheduleFn,
                cancelFn: this.cancelFn,
                runCount: this.runCount,
                callback: this.callback
            };
        }
    }

    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    ///  MICROTASK QUEUE
    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    const symbolSetTimeout = __symbol__('setTimeout');
    const symbolPromise = __symbol__('Promise');
    const symbolThen = __symbol__('then');
    let _microTaskQueue: Task[] = [];
    let _isDrainingMicrotaskQueue: boolean = false;

    function scheduleMicroTask(task?: MicroTask) {
        // if we are not running in any task, and there has not been anything scheduled
        // we must bootstrap the initial task creation by manually scheduling the drain
        if (_numberOfNestedTaskFrames === 0 && _microTaskQueue.length === 0) {
            // We are not running in Task, so we need to kickstart the microtask queue.
            if (global[symbolPromise]) {
                global[symbolPromise].resolve(0)[symbolThen](drainMicroTaskQueue);
            } else {
                global[symbolSetTimeout](drainMicroTaskQueue, 0);
            }
        }
        task && _microTaskQueue.push(task);
    }

    function drainMicroTaskQueue() {
        if (!_isDrainingMicrotaskQueue) {
            _isDrainingMicrotaskQueue = true;
            while (_microTaskQueue.length) {
                const queue = _microTaskQueue;
                _microTaskQueue = [];
                for (let i = 0; i < queue.length; i++) {
                    const task = queue[i];
                    try {
                        task.zone.runTask(task, null, null);
                    } catch (error) {
                        _api.onUnhandledError(error);
                    }
                }
            }
            const showError: boolean = !(Zone as any)[__symbol__('ignoreConsoleErrorUncaughtError')];
            _api.microtaskDrainDone();
            _isDrainingMicrotaskQueue = false;
        }
    }

    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    ///  BOOTSTRAP
    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////


    const NO_ZONE = { name: 'NO ZONE' };
    const notScheduled: 'notScheduled' = 'notScheduled', scheduling: 'scheduling' = 'scheduling',
        scheduled: 'scheduled' = 'scheduled', running: 'running' = 'running',
        canceling: 'canceling' = 'canceling', unknown: 'unknown' = 'unknown';
    const microTask: 'microTask' = 'microTask', macroTask: 'macroTask' = 'macroTask',
        eventTask: 'eventTask' = 'eventTask';

    const patches: { [key: string]: any } = {};
    const _api: _ZonePrivate = {
        symbol: __symbol__,
        currentZoneFrame: () => _currentZoneFrame,
        onUnhandledError: noop,
        microtaskDrainDone: noop,
        scheduleMicroTask: scheduleMicroTask,
        showUncaughtError: () => !(Zone as any)[__symbol__('ignoreConsoleErrorUncaughtError')],
        patchEventTarget: () => [],
        patchOnProperties: noop,
        patchMethod: () => noop,
    };
    let _currentZoneFrame: _ZoneFrame = { parent: null, zone: new Zone(null, null) };
    let _currentTask: Task = null;
    let _numberOfNestedTaskFrames = 0;

    function noop() { }

    function __symbol__(name: string) {
        return '__zone_symbol__' + name;
    }


    performanceMeasure('Zone', 'Zone');
    return global['Zone'] = Zone;
})(typeof window !== 'undefined' && window || typeof self !== 'undefined' && self || global);

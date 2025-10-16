var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
var init_utils = __esm({
  "node_modules/unenv/dist/runtime/_internal/utils.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(createNotImplementedError, "createNotImplementedError");
    __name(notImplemented, "notImplemented");
    __name(notImplementedClass, "notImplementedClass");
  }
});

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin, _performanceNow, nodeTiming, PerformanceEntry, PerformanceMark, PerformanceMeasure, PerformanceResourceTiming, PerformanceObserverEntryList, Performance, PerformanceObserver, performance;
var init_performance = __esm({
  "node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_utils();
    _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
    _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
    nodeTiming = {
      name: "node",
      entryType: "node",
      startTime: 0,
      duration: 0,
      nodeStart: 0,
      v8Start: 0,
      bootstrapComplete: 0,
      environment: 0,
      loopStart: 0,
      loopExit: 0,
      idleTime: 0,
      uvMetricsInfo: {
        loopCount: 0,
        events: 0,
        eventsWaiting: 0
      },
      detail: void 0,
      toJSON() {
        return this;
      }
    };
    PerformanceEntry = class {
      static {
        __name(this, "PerformanceEntry");
      }
      __unenv__ = true;
      detail;
      entryType = "event";
      name;
      startTime;
      constructor(name, options) {
        this.name = name;
        this.startTime = options?.startTime || _performanceNow();
        this.detail = options?.detail;
      }
      get duration() {
        return _performanceNow() - this.startTime;
      }
      toJSON() {
        return {
          name: this.name,
          entryType: this.entryType,
          startTime: this.startTime,
          duration: this.duration,
          detail: this.detail
        };
      }
    };
    PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
      static {
        __name(this, "PerformanceMark");
      }
      entryType = "mark";
      constructor() {
        super(...arguments);
      }
      get duration() {
        return 0;
      }
    };
    PerformanceMeasure = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceMeasure");
      }
      entryType = "measure";
    };
    PerformanceResourceTiming = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceResourceTiming");
      }
      entryType = "resource";
      serverTiming = [];
      connectEnd = 0;
      connectStart = 0;
      decodedBodySize = 0;
      domainLookupEnd = 0;
      domainLookupStart = 0;
      encodedBodySize = 0;
      fetchStart = 0;
      initiatorType = "";
      name = "";
      nextHopProtocol = "";
      redirectEnd = 0;
      redirectStart = 0;
      requestStart = 0;
      responseEnd = 0;
      responseStart = 0;
      secureConnectionStart = 0;
      startTime = 0;
      transferSize = 0;
      workerStart = 0;
      responseStatus = 0;
    };
    PerformanceObserverEntryList = class {
      static {
        __name(this, "PerformanceObserverEntryList");
      }
      __unenv__ = true;
      getEntries() {
        return [];
      }
      getEntriesByName(_name, _type) {
        return [];
      }
      getEntriesByType(type) {
        return [];
      }
    };
    Performance = class {
      static {
        __name(this, "Performance");
      }
      __unenv__ = true;
      timeOrigin = _timeOrigin;
      eventCounts = /* @__PURE__ */ new Map();
      _entries = [];
      _resourceTimingBufferSize = 0;
      navigation = void 0;
      timing = void 0;
      timerify(_fn, _options) {
        throw createNotImplementedError("Performance.timerify");
      }
      get nodeTiming() {
        return nodeTiming;
      }
      eventLoopUtilization() {
        return {};
      }
      markResourceTiming() {
        return new PerformanceResourceTiming("");
      }
      onresourcetimingbufferfull = null;
      now() {
        if (this.timeOrigin === _timeOrigin) {
          return _performanceNow();
        }
        return Date.now() - this.timeOrigin;
      }
      clearMarks(markName) {
        this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
      }
      clearMeasures(measureName) {
        this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
      }
      clearResourceTimings() {
        this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
      }
      getEntries() {
        return this._entries;
      }
      getEntriesByName(name, type) {
        return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
      }
      getEntriesByType(type) {
        return this._entries.filter((e) => e.entryType === type);
      }
      mark(name, options) {
        const entry = new PerformanceMark(name, options);
        this._entries.push(entry);
        return entry;
      }
      measure(measureName, startOrMeasureOptions, endMark) {
        let start;
        let end;
        if (typeof startOrMeasureOptions === "string") {
          start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
          end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
        } else {
          start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
          end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
        }
        const entry = new PerformanceMeasure(measureName, {
          startTime: start,
          detail: {
            start,
            end
          }
        });
        this._entries.push(entry);
        return entry;
      }
      setResourceTimingBufferSize(maxSize) {
        this._resourceTimingBufferSize = maxSize;
      }
      addEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.addEventListener");
      }
      removeEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.removeEventListener");
      }
      dispatchEvent(event) {
        throw createNotImplementedError("Performance.dispatchEvent");
      }
      toJSON() {
        return this;
      }
    };
    PerformanceObserver = class {
      static {
        __name(this, "PerformanceObserver");
      }
      __unenv__ = true;
      static supportedEntryTypes = [];
      _callback = null;
      constructor(callback) {
        this._callback = callback;
      }
      takeRecords() {
        return [];
      }
      disconnect() {
        throw createNotImplementedError("PerformanceObserver.disconnect");
      }
      observe(options) {
        throw createNotImplementedError("PerformanceObserver.observe");
      }
      bind(fn) {
        return fn;
      }
      runInAsyncScope(fn, thisArg, ...args) {
        return fn.call(thisArg, ...args);
      }
      asyncId() {
        return 0;
      }
      triggerAsyncId() {
        return 0;
      }
      emitDestroy() {
        return this;
      }
    };
    performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
  }
});

// node_modules/unenv/dist/runtime/node/perf_hooks.mjs
var init_perf_hooks = __esm({
  "node_modules/unenv/dist/runtime/node/perf_hooks.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_performance();
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
var init_performance2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs"() {
    init_perf_hooks();
    globalThis.performance = performance;
    globalThis.Performance = Performance;
    globalThis.PerformanceEntry = PerformanceEntry;
    globalThis.PerformanceMark = PerformanceMark;
    globalThis.PerformanceMeasure = PerformanceMeasure;
    globalThis.PerformanceObserver = PerformanceObserver;
    globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
    globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
  }
});

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default;
var init_noop = __esm({
  "node_modules/unenv/dist/runtime/mock/noop.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    noop_default = Object.assign(() => {
    }, { __unenv__: true });
  }
});

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";
var _console, _ignoreErrors, _stderr, _stdout, log, info, trace, debug, table, error, warn, createTask, clear, count, countReset, dir, dirxml, group, groupEnd, groupCollapsed, profile, profileEnd, time, timeEnd, timeLog, timeStamp, Console, _times, _stdoutErrorHandler, _stderrErrorHandler;
var init_console = __esm({
  "node_modules/unenv/dist/runtime/node/console.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_noop();
    init_utils();
    _console = globalThis.console;
    _ignoreErrors = true;
    _stderr = new Writable();
    _stdout = new Writable();
    log = _console?.log ?? noop_default;
    info = _console?.info ?? log;
    trace = _console?.trace ?? info;
    debug = _console?.debug ?? log;
    table = _console?.table ?? log;
    error = _console?.error ?? log;
    warn = _console?.warn ?? error;
    createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
    clear = _console?.clear ?? noop_default;
    count = _console?.count ?? noop_default;
    countReset = _console?.countReset ?? noop_default;
    dir = _console?.dir ?? noop_default;
    dirxml = _console?.dirxml ?? noop_default;
    group = _console?.group ?? noop_default;
    groupEnd = _console?.groupEnd ?? noop_default;
    groupCollapsed = _console?.groupCollapsed ?? noop_default;
    profile = _console?.profile ?? noop_default;
    profileEnd = _console?.profileEnd ?? noop_default;
    time = _console?.time ?? noop_default;
    timeEnd = _console?.timeEnd ?? noop_default;
    timeLog = _console?.timeLog ?? noop_default;
    timeStamp = _console?.timeStamp ?? noop_default;
    Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
    _times = /* @__PURE__ */ new Map();
    _stdoutErrorHandler = noop_default;
    _stderrErrorHandler = noop_default;
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole, assert, clear2, context, count2, countReset2, createTask2, debug2, dir2, dirxml2, error2, group2, groupCollapsed2, groupEnd2, info2, log2, profile2, profileEnd2, table2, time2, timeEnd2, timeLog2, timeStamp2, trace2, warn2, console_default;
var init_console2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_console();
    workerdConsole = globalThis["console"];
    ({
      assert,
      clear: clear2,
      context: (
        // @ts-expect-error undocumented public API
        context
      ),
      count: count2,
      countReset: countReset2,
      createTask: (
        // @ts-expect-error undocumented public API
        createTask2
      ),
      debug: debug2,
      dir: dir2,
      dirxml: dirxml2,
      error: error2,
      group: group2,
      groupCollapsed: groupCollapsed2,
      groupEnd: groupEnd2,
      info: info2,
      log: log2,
      profile: profile2,
      profileEnd: profileEnd2,
      table: table2,
      time: time2,
      timeEnd: timeEnd2,
      timeLog: timeLog2,
      timeStamp: timeStamp2,
      trace: trace2,
      warn: warn2
    } = workerdConsole);
    Object.assign(workerdConsole, {
      Console,
      _ignoreErrors,
      _stderr,
      _stderrErrorHandler,
      _stdout,
      _stdoutErrorHandler,
      _times
    });
    console_default = workerdConsole;
  }
});

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console = __esm({
  "node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console"() {
    init_console2();
    globalThis.console = console_default;
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime;
var init_hrtime = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
      const now = Date.now();
      const seconds = Math.trunc(now / 1e3);
      const nanos = now % 1e3 * 1e6;
      if (startTime) {
        let diffSeconds = seconds - startTime[0];
        let diffNanos = nanos - startTime[0];
        if (diffNanos < 0) {
          diffSeconds = diffSeconds - 1;
          diffNanos = 1e9 + diffNanos;
        }
        return [diffSeconds, diffNanos];
      }
      return [seconds, nanos];
    }, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
      return BigInt(Date.now() * 1e6);
    }, "bigint") });
  }
});

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream;
var init_read_stream = __esm({
  "node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ReadStream = class {
      static {
        __name(this, "ReadStream");
      }
      fd;
      isRaw = false;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      setRawMode(mode) {
        this.isRaw = mode;
        return this;
      }
    };
  }
});

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream;
var init_write_stream = __esm({
  "node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    WriteStream = class {
      static {
        __name(this, "WriteStream");
      }
      fd;
      columns = 80;
      rows = 24;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      clearLine(dir3, callback) {
        callback && callback();
        return false;
      }
      clearScreenDown(callback) {
        callback && callback();
        return false;
      }
      cursorTo(x, y, callback) {
        callback && typeof callback === "function" && callback();
        return false;
      }
      moveCursor(dx, dy, callback) {
        callback && callback();
        return false;
      }
      getColorDepth(env2) {
        return 1;
      }
      hasColors(count3, env2) {
        return false;
      }
      getWindowSize() {
        return [this.columns, this.rows];
      }
      write(str, encoding, cb) {
        if (str instanceof Uint8Array) {
          str = new TextDecoder().decode(str);
        }
        try {
          console.log(str);
        } catch {
        }
        cb && typeof cb === "function" && cb();
        return false;
      }
    };
  }
});

// node_modules/unenv/dist/runtime/node/tty.mjs
var init_tty = __esm({
  "node_modules/unenv/dist/runtime/node/tty.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_read_stream();
    init_write_stream();
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION;
var init_node_version = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    NODE_VERSION = "22.14.0";
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";
var Process;
var init_process = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/process.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_tty();
    init_utils();
    init_node_version();
    Process = class _Process extends EventEmitter {
      static {
        __name(this, "Process");
      }
      env;
      hrtime;
      nextTick;
      constructor(impl) {
        super();
        this.env = impl.env;
        this.hrtime = impl.hrtime;
        this.nextTick = impl.nextTick;
        for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
          const value = this[prop];
          if (typeof value === "function") {
            this[prop] = value.bind(this);
          }
        }
      }
      // --- event emitter ---
      emitWarning(warning, type, code) {
        console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
      }
      emit(...args) {
        return super.emit(...args);
      }
      listeners(eventName) {
        return super.listeners(eventName);
      }
      // --- stdio (lazy initializers) ---
      #stdin;
      #stdout;
      #stderr;
      get stdin() {
        return this.#stdin ??= new ReadStream(0);
      }
      get stdout() {
        return this.#stdout ??= new WriteStream(1);
      }
      get stderr() {
        return this.#stderr ??= new WriteStream(2);
      }
      // --- cwd ---
      #cwd = "/";
      chdir(cwd2) {
        this.#cwd = cwd2;
      }
      cwd() {
        return this.#cwd;
      }
      // --- dummy props and getters ---
      arch = "";
      platform = "";
      argv = [];
      argv0 = "";
      execArgv = [];
      execPath = "";
      title = "";
      pid = 200;
      ppid = 100;
      get version() {
        return `v${NODE_VERSION}`;
      }
      get versions() {
        return { node: NODE_VERSION };
      }
      get allowedNodeEnvironmentFlags() {
        return /* @__PURE__ */ new Set();
      }
      get sourceMapsEnabled() {
        return false;
      }
      get debugPort() {
        return 0;
      }
      get throwDeprecation() {
        return false;
      }
      get traceDeprecation() {
        return false;
      }
      get features() {
        return {};
      }
      get release() {
        return {};
      }
      get connected() {
        return false;
      }
      get config() {
        return {};
      }
      get moduleLoadList() {
        return [];
      }
      constrainedMemory() {
        return 0;
      }
      availableMemory() {
        return 0;
      }
      uptime() {
        return 0;
      }
      resourceUsage() {
        return {};
      }
      // --- noop methods ---
      ref() {
      }
      unref() {
      }
      // --- unimplemented methods ---
      umask() {
        throw createNotImplementedError("process.umask");
      }
      getBuiltinModule() {
        return void 0;
      }
      getActiveResourcesInfo() {
        throw createNotImplementedError("process.getActiveResourcesInfo");
      }
      exit() {
        throw createNotImplementedError("process.exit");
      }
      reallyExit() {
        throw createNotImplementedError("process.reallyExit");
      }
      kill() {
        throw createNotImplementedError("process.kill");
      }
      abort() {
        throw createNotImplementedError("process.abort");
      }
      dlopen() {
        throw createNotImplementedError("process.dlopen");
      }
      setSourceMapsEnabled() {
        throw createNotImplementedError("process.setSourceMapsEnabled");
      }
      loadEnvFile() {
        throw createNotImplementedError("process.loadEnvFile");
      }
      disconnect() {
        throw createNotImplementedError("process.disconnect");
      }
      cpuUsage() {
        throw createNotImplementedError("process.cpuUsage");
      }
      setUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
      }
      hasUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
      }
      initgroups() {
        throw createNotImplementedError("process.initgroups");
      }
      openStdin() {
        throw createNotImplementedError("process.openStdin");
      }
      assert() {
        throw createNotImplementedError("process.assert");
      }
      binding() {
        throw createNotImplementedError("process.binding");
      }
      // --- attached interfaces ---
      permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
      report = {
        directory: "",
        filename: "",
        signal: "SIGUSR2",
        compact: false,
        reportOnFatalError: false,
        reportOnSignal: false,
        reportOnUncaughtException: false,
        getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
        writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
      };
      finalization = {
        register: /* @__PURE__ */ notImplemented("process.finalization.register"),
        unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
        registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
      };
      memoryUsage = Object.assign(() => ({
        arrayBuffers: 0,
        rss: 0,
        external: 0,
        heapTotal: 0,
        heapUsed: 0
      }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
      // --- undefined props ---
      mainModule = void 0;
      domain = void 0;
      // optional
      send = void 0;
      exitCode = void 0;
      channel = void 0;
      getegid = void 0;
      geteuid = void 0;
      getgid = void 0;
      getgroups = void 0;
      getuid = void 0;
      setegid = void 0;
      seteuid = void 0;
      setgid = void 0;
      setgroups = void 0;
      setuid = void 0;
      // internals
      _events = void 0;
      _eventsCount = void 0;
      _exiting = void 0;
      _maxListeners = void 0;
      _debugEnd = void 0;
      _debugProcess = void 0;
      _fatalException = void 0;
      _getActiveHandles = void 0;
      _getActiveRequests = void 0;
      _kill = void 0;
      _preload_modules = void 0;
      _rawDebug = void 0;
      _startProfilerIdleNotifier = void 0;
      _stopProfilerIdleNotifier = void 0;
      _tickCallback = void 0;
      _disconnect = void 0;
      _handleQueue = void 0;
      _pendingMessage = void 0;
      _channel = void 0;
      _send = void 0;
      _linkedBinding = void 0;
    };
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess, getBuiltinModule, workerdProcess, isWorkerdProcessV2, unenvProcess, exit, features, platform, env, hrtime3, nextTick, _channel, _disconnect, _events, _eventsCount, _handleQueue, _maxListeners, _pendingMessage, _send, assert2, disconnect, mainModule, _debugEnd, _debugProcess, _exiting, _fatalException, _getActiveHandles, _getActiveRequests, _kill, _linkedBinding, _preload_modules, _rawDebug, _startProfilerIdleNotifier, _stopProfilerIdleNotifier, _tickCallback, abort, addListener, allowedNodeEnvironmentFlags, arch, argv, argv0, availableMemory, binding, channel, chdir, config, connected, constrainedMemory, cpuUsage, cwd, debugPort, dlopen, domain, emit, emitWarning, eventNames, execArgv, execPath, exitCode, finalization, getActiveResourcesInfo, getegid, geteuid, getgid, getgroups, getMaxListeners, getuid, hasUncaughtExceptionCaptureCallback, initgroups, kill, listenerCount, listeners, loadEnvFile, memoryUsage, moduleLoadList, off, on, once, openStdin, permission, pid, ppid, prependListener, prependOnceListener, rawListeners, reallyExit, ref, release, removeAllListeners, removeListener, report, resourceUsage, send, setegid, seteuid, setgid, setgroups, setMaxListeners, setSourceMapsEnabled, setuid, setUncaughtExceptionCaptureCallback, sourceMapsEnabled, stderr, stdin, stdout, throwDeprecation, title, traceDeprecation, umask, unref, uptime, version, versions, _process, process_default;
var init_process2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_hrtime();
    init_process();
    globalProcess = globalThis["process"];
    getBuiltinModule = globalProcess.getBuiltinModule;
    workerdProcess = getBuiltinModule("node:process");
    isWorkerdProcessV2 = globalThis.Cloudflare.compatibilityFlags.enable_nodejs_process_v2;
    unenvProcess = new Process({
      env: globalProcess.env,
      // `hrtime` is only available from workerd process v2
      hrtime: isWorkerdProcessV2 ? workerdProcess.hrtime : hrtime,
      // `nextTick` is available from workerd process v1
      nextTick: workerdProcess.nextTick
    });
    ({ exit, features, platform } = workerdProcess);
    ({
      env: (
        // Always implemented by workerd
        env
      ),
      hrtime: (
        // Only implemented in workerd v2
        hrtime3
      ),
      nextTick: (
        // Always implemented by workerd
        nextTick
      )
    } = unenvProcess);
    ({
      _channel,
      _disconnect,
      _events,
      _eventsCount,
      _handleQueue,
      _maxListeners,
      _pendingMessage,
      _send,
      assert: assert2,
      disconnect,
      mainModule
    } = unenvProcess);
    ({
      _debugEnd: (
        // @ts-expect-error `_debugEnd` is missing typings
        _debugEnd
      ),
      _debugProcess: (
        // @ts-expect-error `_debugProcess` is missing typings
        _debugProcess
      ),
      _exiting: (
        // @ts-expect-error `_exiting` is missing typings
        _exiting
      ),
      _fatalException: (
        // @ts-expect-error `_fatalException` is missing typings
        _fatalException
      ),
      _getActiveHandles: (
        // @ts-expect-error `_getActiveHandles` is missing typings
        _getActiveHandles
      ),
      _getActiveRequests: (
        // @ts-expect-error `_getActiveRequests` is missing typings
        _getActiveRequests
      ),
      _kill: (
        // @ts-expect-error `_kill` is missing typings
        _kill
      ),
      _linkedBinding: (
        // @ts-expect-error `_linkedBinding` is missing typings
        _linkedBinding
      ),
      _preload_modules: (
        // @ts-expect-error `_preload_modules` is missing typings
        _preload_modules
      ),
      _rawDebug: (
        // @ts-expect-error `_rawDebug` is missing typings
        _rawDebug
      ),
      _startProfilerIdleNotifier: (
        // @ts-expect-error `_startProfilerIdleNotifier` is missing typings
        _startProfilerIdleNotifier
      ),
      _stopProfilerIdleNotifier: (
        // @ts-expect-error `_stopProfilerIdleNotifier` is missing typings
        _stopProfilerIdleNotifier
      ),
      _tickCallback: (
        // @ts-expect-error `_tickCallback` is missing typings
        _tickCallback
      ),
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      arch,
      argv,
      argv0,
      availableMemory,
      binding: (
        // @ts-expect-error `binding` is missing typings
        binding
      ),
      channel,
      chdir,
      config,
      connected,
      constrainedMemory,
      cpuUsage,
      cwd,
      debugPort,
      dlopen,
      domain: (
        // @ts-expect-error `domain` is missing typings
        domain
      ),
      emit,
      emitWarning,
      eventNames,
      execArgv,
      execPath,
      exitCode,
      finalization,
      getActiveResourcesInfo,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getMaxListeners,
      getuid,
      hasUncaughtExceptionCaptureCallback,
      initgroups: (
        // @ts-expect-error `initgroups` is missing typings
        initgroups
      ),
      kill,
      listenerCount,
      listeners,
      loadEnvFile,
      memoryUsage,
      moduleLoadList: (
        // @ts-expect-error `moduleLoadList` is missing typings
        moduleLoadList
      ),
      off,
      on,
      once,
      openStdin: (
        // @ts-expect-error `openStdin` is missing typings
        openStdin
      ),
      permission,
      pid,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      reallyExit: (
        // @ts-expect-error `reallyExit` is missing typings
        reallyExit
      ),
      ref,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      send,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setMaxListeners,
      setSourceMapsEnabled,
      setuid,
      setUncaughtExceptionCaptureCallback,
      sourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      throwDeprecation,
      title,
      traceDeprecation,
      umask,
      unref,
      uptime,
      version,
      versions
    } = isWorkerdProcessV2 ? workerdProcess : unenvProcess);
    _process = {
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      hasUncaughtExceptionCaptureCallback,
      setUncaughtExceptionCaptureCallback,
      loadEnvFile,
      sourceMapsEnabled,
      arch,
      argv,
      argv0,
      chdir,
      config,
      connected,
      constrainedMemory,
      availableMemory,
      cpuUsage,
      cwd,
      debugPort,
      dlopen,
      disconnect,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exit,
      finalization,
      features,
      getBuiltinModule,
      getActiveResourcesInfo,
      getMaxListeners,
      hrtime: hrtime3,
      kill,
      listeners,
      listenerCount,
      memoryUsage,
      nextTick,
      on,
      off,
      once,
      pid,
      platform,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      setMaxListeners,
      setSourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      title,
      throwDeprecation,
      traceDeprecation,
      umask,
      uptime,
      version,
      versions,
      // @ts-expect-error old API
      domain,
      initgroups,
      moduleLoadList,
      reallyExit,
      openStdin,
      assert: assert2,
      binding,
      send,
      exitCode,
      channel,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getuid,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setuid,
      permission,
      mainModule,
      _events,
      _eventsCount,
      _exiting,
      _maxListeners,
      _debugEnd,
      _debugProcess,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _kill,
      _preload_modules,
      _rawDebug,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      _disconnect,
      _handleQueue,
      _pendingMessage,
      _channel,
      _send,
      _linkedBinding
    };
    process_default = _process;
  }
});

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process = __esm({
  "node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process"() {
    init_process2();
    globalThis.process = process_default;
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
  }
});

// node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT;
var init_constants = __esm({
  "node_modules/hono/dist/request/constants.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    GET_MATCH_RESULT = Symbol();
  }
});

// node_modules/hono/dist/utils/body.js
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var parseBody, handleParsingAllValues, handleParsingNestedValues;
var init_body = __esm({
  "node_modules/hono/dist/utils/body.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_request();
    parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
      const { all = false, dot = false } = options;
      const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
      const contentType = headers.get("Content-Type");
      if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
        return parseFormData(request, { all, dot });
      }
      return {};
    }, "parseBody");
    __name(parseFormData, "parseFormData");
    __name(convertFormDataToBodyData, "convertFormDataToBodyData");
    handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
      if (form[key] !== void 0) {
        if (Array.isArray(form[key])) {
          ;
          form[key].push(value);
        } else {
          form[key] = [form[key], value];
        }
      } else {
        if (!key.endsWith("[]")) {
          form[key] = value;
        } else {
          form[key] = [value];
        }
      }
    }, "handleParsingAllValues");
    handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
      let nestedForm = form;
      const keys = key.split(".");
      keys.forEach((key2, index) => {
        if (index === keys.length - 1) {
          nestedForm[key2] = value;
        } else {
          if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
            nestedForm[key2] = /* @__PURE__ */ Object.create(null);
          }
          nestedForm = nestedForm[key2];
        }
      });
    }, "handleParsingNestedValues");
  }
});

// node_modules/hono/dist/utils/url.js
var splitPath, splitRoutingPath, extractGroupsFromPath, replaceGroupMarks, patternCache, getPattern, tryDecode, tryDecodeURI, getPath, getPathNoStrict, mergePath, checkOptionalParameter, _decodeURI, _getQueryParam, getQueryParam, getQueryParams, decodeURIComponent_;
var init_url = __esm({
  "node_modules/hono/dist/utils/url.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    splitPath = /* @__PURE__ */ __name((path) => {
      const paths = path.split("/");
      if (paths[0] === "") {
        paths.shift();
      }
      return paths;
    }, "splitPath");
    splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
      const { groups, path } = extractGroupsFromPath(routePath);
      const paths = splitPath(path);
      return replaceGroupMarks(paths, groups);
    }, "splitRoutingPath");
    extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
      const groups = [];
      path = path.replace(/\{[^}]+\}/g, (match, index) => {
        const mark = `@${index}`;
        groups.push([mark, match]);
        return mark;
      });
      return { groups, path };
    }, "extractGroupsFromPath");
    replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
      for (let i = groups.length - 1; i >= 0; i--) {
        const [mark] = groups[i];
        for (let j = paths.length - 1; j >= 0; j--) {
          if (paths[j].includes(mark)) {
            paths[j] = paths[j].replace(mark, groups[i][1]);
            break;
          }
        }
      }
      return paths;
    }, "replaceGroupMarks");
    patternCache = {};
    getPattern = /* @__PURE__ */ __name((label, next) => {
      if (label === "*") {
        return "*";
      }
      const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      if (match) {
        const cacheKey = `${label}#${next}`;
        if (!patternCache[cacheKey]) {
          if (match[2]) {
            patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match[1], new RegExp(`^${match[2]}(?=/${next})`)] : [label, match[1], new RegExp(`^${match[2]}$`)];
          } else {
            patternCache[cacheKey] = [label, match[1], true];
          }
        }
        return patternCache[cacheKey];
      }
      return null;
    }, "getPattern");
    tryDecode = /* @__PURE__ */ __name((str, decoder) => {
      try {
        return decoder(str);
      } catch {
        return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match) => {
          try {
            return decoder(match);
          } catch {
            return match;
          }
        });
      }
    }, "tryDecode");
    tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
    getPath = /* @__PURE__ */ __name((request) => {
      const url = request.url;
      const start = url.indexOf(
        "/",
        url.charCodeAt(9) === 58 ? 13 : 8
      );
      let i = start;
      for (; i < url.length; i++) {
        const charCode = url.charCodeAt(i);
        if (charCode === 37) {
          const queryIndex = url.indexOf("?", i);
          const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
          return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
        } else if (charCode === 63) {
          break;
        }
      }
      return url.slice(start, i);
    }, "getPath");
    getPathNoStrict = /* @__PURE__ */ __name((request) => {
      const result = getPath(request);
      return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
    }, "getPathNoStrict");
    mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
      if (rest.length) {
        sub = mergePath(sub, ...rest);
      }
      return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
    }, "mergePath");
    checkOptionalParameter = /* @__PURE__ */ __name((path) => {
      if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
        return null;
      }
      const segments = path.split("/");
      const results = [];
      let basePath = "";
      segments.forEach((segment) => {
        if (segment !== "" && !/\:/.test(segment)) {
          basePath += "/" + segment;
        } else if (/\:/.test(segment)) {
          if (/\?/.test(segment)) {
            if (results.length === 0 && basePath === "") {
              results.push("/");
            } else {
              results.push(basePath);
            }
            const optionalSegment = segment.replace("?", "");
            basePath += "/" + optionalSegment;
            results.push(basePath);
          } else {
            basePath += "/" + segment;
          }
        }
      });
      return results.filter((v, i, a) => a.indexOf(v) === i);
    }, "checkOptionalParameter");
    _decodeURI = /* @__PURE__ */ __name((value) => {
      if (!/[%+]/.test(value)) {
        return value;
      }
      if (value.indexOf("+") !== -1) {
        value = value.replace(/\+/g, " ");
      }
      return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
    }, "_decodeURI");
    _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
      let encoded;
      if (!multiple && key && !/[%+]/.test(key)) {
        let keyIndex2 = url.indexOf(`?${key}`, 8);
        if (keyIndex2 === -1) {
          keyIndex2 = url.indexOf(`&${key}`, 8);
        }
        while (keyIndex2 !== -1) {
          const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
          if (trailingKeyCode === 61) {
            const valueIndex = keyIndex2 + key.length + 2;
            const endIndex = url.indexOf("&", valueIndex);
            return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
          } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
            return "";
          }
          keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
        }
        encoded = /[%+]/.test(url);
        if (!encoded) {
          return void 0;
        }
      }
      const results = {};
      encoded ??= /[%+]/.test(url);
      let keyIndex = url.indexOf("?", 8);
      while (keyIndex !== -1) {
        const nextKeyIndex = url.indexOf("&", keyIndex + 1);
        let valueIndex = url.indexOf("=", keyIndex);
        if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
          valueIndex = -1;
        }
        let name = url.slice(
          keyIndex + 1,
          valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
        );
        if (encoded) {
          name = _decodeURI(name);
        }
        keyIndex = nextKeyIndex;
        if (name === "") {
          continue;
        }
        let value;
        if (valueIndex === -1) {
          value = "";
        } else {
          value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
          if (encoded) {
            value = _decodeURI(value);
          }
        }
        if (multiple) {
          if (!(results[name] && Array.isArray(results[name]))) {
            results[name] = [];
          }
          ;
          results[name].push(value);
        } else {
          results[name] ??= value;
        }
      }
      return key ? results[key] : results;
    }, "_getQueryParam");
    getQueryParam = _getQueryParam;
    getQueryParams = /* @__PURE__ */ __name((url, key) => {
      return _getQueryParam(url, key, true);
    }, "getQueryParams");
    decodeURIComponent_ = decodeURIComponent;
  }
});

// node_modules/hono/dist/request.js
var tryDecodeURIComponent, HonoRequest;
var init_request = __esm({
  "node_modules/hono/dist/request.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_constants();
    init_body();
    init_url();
    tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
    HonoRequest = class {
      static {
        __name(this, "HonoRequest");
      }
      raw;
      #validatedData;
      #matchResult;
      routeIndex = 0;
      path;
      bodyCache = {};
      constructor(request, path = "/", matchResult = [[]]) {
        this.raw = request;
        this.path = path;
        this.#matchResult = matchResult;
        this.#validatedData = {};
      }
      param(key) {
        return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
      }
      #getDecodedParam(key) {
        const paramKey = this.#matchResult[0][this.routeIndex][1][key];
        const param = this.#getParamValue(paramKey);
        return param ? /\%/.test(param) ? tryDecodeURIComponent(param) : param : void 0;
      }
      #getAllDecodedParams() {
        const decoded = {};
        const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
        for (const key of keys) {
          const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
          if (value && typeof value === "string") {
            decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
          }
        }
        return decoded;
      }
      #getParamValue(paramKey) {
        return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
      }
      query(key) {
        return getQueryParam(this.url, key);
      }
      queries(key) {
        return getQueryParams(this.url, key);
      }
      header(name) {
        if (name) {
          return this.raw.headers.get(name) ?? void 0;
        }
        const headerData = {};
        this.raw.headers.forEach((value, key) => {
          headerData[key] = value;
        });
        return headerData;
      }
      async parseBody(options) {
        return this.bodyCache.parsedBody ??= await parseBody(this, options);
      }
      #cachedBody = /* @__PURE__ */ __name((key) => {
        const { bodyCache, raw: raw2 } = this;
        const cachedBody = bodyCache[key];
        if (cachedBody) {
          return cachedBody;
        }
        const anyCachedKey = Object.keys(bodyCache)[0];
        if (anyCachedKey) {
          return bodyCache[anyCachedKey].then((body) => {
            if (anyCachedKey === "json") {
              body = JSON.stringify(body);
            }
            return new Response(body)[key]();
          });
        }
        return bodyCache[key] = raw2[key]();
      }, "#cachedBody");
      json() {
        return this.#cachedBody("text").then((text) => JSON.parse(text));
      }
      text() {
        return this.#cachedBody("text");
      }
      arrayBuffer() {
        return this.#cachedBody("arrayBuffer");
      }
      blob() {
        return this.#cachedBody("blob");
      }
      formData() {
        return this.#cachedBody("formData");
      }
      addValidatedData(target, data) {
        this.#validatedData[target] = data;
      }
      valid(target) {
        return this.#validatedData[target];
      }
      get url() {
        return this.raw.url;
      }
      get method() {
        return this.raw.method;
      }
      get [GET_MATCH_RESULT]() {
        return this.#matchResult;
      }
      get matchedRoutes() {
        return this.#matchResult[0].map(([[, route]]) => route);
      }
      get routePath() {
        return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
      }
    };
  }
});

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase, raw, resolveCallback;
var init_html = __esm({
  "node_modules/hono/dist/utils/html.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    HtmlEscapedCallbackPhase = {
      Stringify: 1,
      BeforeStream: 2,
      Stream: 3
    };
    raw = /* @__PURE__ */ __name((value, callbacks) => {
      const escapedString = new String(value);
      escapedString.isEscaped = true;
      escapedString.callbacks = callbacks;
      return escapedString;
    }, "raw");
    resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context2, buffer) => {
      if (typeof str === "object" && !(str instanceof String)) {
        if (!(str instanceof Promise)) {
          str = str.toString();
        }
        if (str instanceof Promise) {
          str = await str;
        }
      }
      const callbacks = str.callbacks;
      if (!callbacks?.length) {
        return Promise.resolve(str);
      }
      if (buffer) {
        buffer[0] += str;
      } else {
        buffer = [str];
      }
      const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context: context2 }))).then(
        (res) => Promise.all(
          res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context2, buffer))
        ).then(() => buffer[0])
      );
      if (preserveCallbacks) {
        return raw(await resStr, callbacks);
      } else {
        return resStr;
      }
    }, "resolveCallback");
  }
});

// node_modules/hono/dist/context.js
var TEXT_PLAIN, setDefaultContentType, Context;
var init_context = __esm({
  "node_modules/hono/dist/context.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_request();
    init_html();
    TEXT_PLAIN = "text/plain; charset=UTF-8";
    setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
      return {
        "Content-Type": contentType,
        ...headers
      };
    }, "setDefaultContentType");
    Context = class {
      static {
        __name(this, "Context");
      }
      #rawRequest;
      #req;
      env = {};
      #var;
      finalized = false;
      error;
      #status;
      #executionCtx;
      #res;
      #layout;
      #renderer;
      #notFoundHandler;
      #preparedHeaders;
      #matchResult;
      #path;
      constructor(req, options) {
        this.#rawRequest = req;
        if (options) {
          this.#executionCtx = options.executionCtx;
          this.env = options.env;
          this.#notFoundHandler = options.notFoundHandler;
          this.#path = options.path;
          this.#matchResult = options.matchResult;
        }
      }
      get req() {
        this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
        return this.#req;
      }
      get event() {
        if (this.#executionCtx && "respondWith" in this.#executionCtx) {
          return this.#executionCtx;
        } else {
          throw Error("This context has no FetchEvent");
        }
      }
      get executionCtx() {
        if (this.#executionCtx) {
          return this.#executionCtx;
        } else {
          throw Error("This context has no ExecutionContext");
        }
      }
      get res() {
        return this.#res ||= new Response(null, {
          headers: this.#preparedHeaders ??= new Headers()
        });
      }
      set res(_res) {
        if (this.#res && _res) {
          _res = new Response(_res.body, _res);
          for (const [k, v] of this.#res.headers.entries()) {
            if (k === "content-type") {
              continue;
            }
            if (k === "set-cookie") {
              const cookies = this.#res.headers.getSetCookie();
              _res.headers.delete("set-cookie");
              for (const cookie of cookies) {
                _res.headers.append("set-cookie", cookie);
              }
            } else {
              _res.headers.set(k, v);
            }
          }
        }
        this.#res = _res;
        this.finalized = true;
      }
      render = /* @__PURE__ */ __name((...args) => {
        this.#renderer ??= (content) => this.html(content);
        return this.#renderer(...args);
      }, "render");
      setLayout = /* @__PURE__ */ __name((layout) => this.#layout = layout, "setLayout");
      getLayout = /* @__PURE__ */ __name(() => this.#layout, "getLayout");
      setRenderer = /* @__PURE__ */ __name((renderer) => {
        this.#renderer = renderer;
      }, "setRenderer");
      header = /* @__PURE__ */ __name((name, value, options) => {
        if (this.finalized) {
          this.#res = new Response(this.#res.body, this.#res);
        }
        const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
        if (value === void 0) {
          headers.delete(name);
        } else if (options?.append) {
          headers.append(name, value);
        } else {
          headers.set(name, value);
        }
      }, "header");
      status = /* @__PURE__ */ __name((status) => {
        this.#status = status;
      }, "status");
      set = /* @__PURE__ */ __name((key, value) => {
        this.#var ??= /* @__PURE__ */ new Map();
        this.#var.set(key, value);
      }, "set");
      get = /* @__PURE__ */ __name((key) => {
        return this.#var ? this.#var.get(key) : void 0;
      }, "get");
      get var() {
        if (!this.#var) {
          return {};
        }
        return Object.fromEntries(this.#var);
      }
      #newResponse(data, arg, headers) {
        const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
        if (typeof arg === "object" && "headers" in arg) {
          const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
          for (const [key, value] of argHeaders) {
            if (key.toLowerCase() === "set-cookie") {
              responseHeaders.append(key, value);
            } else {
              responseHeaders.set(key, value);
            }
          }
        }
        if (headers) {
          for (const [k, v] of Object.entries(headers)) {
            if (typeof v === "string") {
              responseHeaders.set(k, v);
            } else {
              responseHeaders.delete(k);
              for (const v2 of v) {
                responseHeaders.append(k, v2);
              }
            }
          }
        }
        const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
        return new Response(data, { status, headers: responseHeaders });
      }
      newResponse = /* @__PURE__ */ __name((...args) => this.#newResponse(...args), "newResponse");
      body = /* @__PURE__ */ __name((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
      text = /* @__PURE__ */ __name((text, arg, headers) => {
        return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
          text,
          arg,
          setDefaultContentType(TEXT_PLAIN, headers)
        );
      }, "text");
      json = /* @__PURE__ */ __name((object, arg, headers) => {
        return this.#newResponse(
          JSON.stringify(object),
          arg,
          setDefaultContentType("application/json", headers)
        );
      }, "json");
      html = /* @__PURE__ */ __name((html, arg, headers) => {
        const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
        return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
      }, "html");
      redirect = /* @__PURE__ */ __name((location, status) => {
        const locationString = String(location);
        this.header(
          "Location",
          !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
        );
        return this.newResponse(null, status ?? 302);
      }, "redirect");
      notFound = /* @__PURE__ */ __name(() => {
        this.#notFoundHandler ??= () => new Response();
        return this.#notFoundHandler(this);
      }, "notFound");
    };
  }
});

// node_modules/hono/dist/utils/cookie.js
var init_cookie = __esm({
  "node_modules/hono/dist/utils/cookie.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_url();
  }
});

// node_modules/hono/dist/helper/cookie/index.js
var init_cookie2 = __esm({
  "node_modules/hono/dist/helper/cookie/index.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_cookie();
  }
});

// node_modules/hono/dist/http-exception.js
var HTTPException;
var init_http_exception = __esm({
  "node_modules/hono/dist/http-exception.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    HTTPException = class extends Error {
      static {
        __name(this, "HTTPException");
      }
      res;
      status;
      constructor(status = 500, options) {
        super(options?.message, { cause: options?.cause });
        this.res = options?.res;
        this.status = status;
      }
      getResponse() {
        if (this.res) {
          const newResponse = new Response(this.res.body, {
            status: this.status,
            headers: this.res.headers
          });
          return newResponse;
        }
        return new Response(this.message, {
          status: this.status
        });
      }
    };
  }
});

// node_modules/hono/dist/utils/encode.js
var decodeBase64Url, encodeBase64Url, encodeBase64, decodeBase64;
var init_encode = __esm({
  "node_modules/hono/dist/utils/encode.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    decodeBase64Url = /* @__PURE__ */ __name((str) => {
      return decodeBase64(str.replace(/_|-/g, (m) => ({ _: "/", "-": "+" })[m] ?? m));
    }, "decodeBase64Url");
    encodeBase64Url = /* @__PURE__ */ __name((buf) => encodeBase64(buf).replace(/\/|\+/g, (m) => ({ "/": "_", "+": "-" })[m] ?? m), "encodeBase64Url");
    encodeBase64 = /* @__PURE__ */ __name((buf) => {
      let binary = "";
      const bytes = new Uint8Array(buf);
      for (let i = 0, len = bytes.length; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }, "encodeBase64");
    decodeBase64 = /* @__PURE__ */ __name((str) => {
      const binary = atob(str);
      const bytes = new Uint8Array(new ArrayBuffer(binary.length));
      const half = binary.length / 2;
      for (let i = 0, j = binary.length - 1; i <= half; i++, j--) {
        bytes[i] = binary.charCodeAt(i);
        bytes[j] = binary.charCodeAt(j);
      }
      return bytes;
    }, "decodeBase64");
  }
});

// node_modules/hono/dist/utils/jwt/jwa.js
var AlgorithmTypes;
var init_jwa = __esm({
  "node_modules/hono/dist/utils/jwt/jwa.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    AlgorithmTypes = /* @__PURE__ */ ((AlgorithmTypes2) => {
      AlgorithmTypes2["HS256"] = "HS256";
      AlgorithmTypes2["HS384"] = "HS384";
      AlgorithmTypes2["HS512"] = "HS512";
      AlgorithmTypes2["RS256"] = "RS256";
      AlgorithmTypes2["RS384"] = "RS384";
      AlgorithmTypes2["RS512"] = "RS512";
      AlgorithmTypes2["PS256"] = "PS256";
      AlgorithmTypes2["PS384"] = "PS384";
      AlgorithmTypes2["PS512"] = "PS512";
      AlgorithmTypes2["ES256"] = "ES256";
      AlgorithmTypes2["ES384"] = "ES384";
      AlgorithmTypes2["ES512"] = "ES512";
      AlgorithmTypes2["EdDSA"] = "EdDSA";
      return AlgorithmTypes2;
    })(AlgorithmTypes || {});
  }
});

// node_modules/hono/dist/helper/adapter/index.js
var knownUserAgents, getRuntimeKey, checkUserAgentEquals;
var init_adapter = __esm({
  "node_modules/hono/dist/helper/adapter/index.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    knownUserAgents = {
      deno: "Deno",
      bun: "Bun",
      workerd: "Cloudflare-Workers",
      node: "Node.js"
    };
    getRuntimeKey = /* @__PURE__ */ __name(() => {
      const global = globalThis;
      const userAgentSupported = typeof navigator !== "undefined" && true;
      if (userAgentSupported) {
        for (const [runtimeKey, userAgent] of Object.entries(knownUserAgents)) {
          if (checkUserAgentEquals(userAgent)) {
            return runtimeKey;
          }
        }
      }
      if (typeof global?.EdgeRuntime === "string") {
        return "edge-light";
      }
      if (global?.fastly !== void 0) {
        return "fastly";
      }
      if (global?.process?.release?.name === "node") {
        return "node";
      }
      return "other";
    }, "getRuntimeKey");
    checkUserAgentEquals = /* @__PURE__ */ __name((platform2) => {
      const userAgent = "Cloudflare-Workers";
      return userAgent.startsWith(platform2);
    }, "checkUserAgentEquals");
  }
});

// node_modules/hono/dist/utils/jwt/types.js
var JwtAlgorithmNotImplemented, JwtTokenInvalid, JwtTokenNotBefore, JwtTokenExpired, JwtTokenIssuedAt, JwtTokenIssuer, JwtHeaderInvalid, JwtHeaderRequiresKid, JwtTokenSignatureMismatched, CryptoKeyUsage;
var init_types = __esm({
  "node_modules/hono/dist/utils/jwt/types.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    JwtAlgorithmNotImplemented = class extends Error {
      static {
        __name(this, "JwtAlgorithmNotImplemented");
      }
      constructor(alg) {
        super(`${alg} is not an implemented algorithm`);
        this.name = "JwtAlgorithmNotImplemented";
      }
    };
    JwtTokenInvalid = class extends Error {
      static {
        __name(this, "JwtTokenInvalid");
      }
      constructor(token) {
        super(`invalid JWT token: ${token}`);
        this.name = "JwtTokenInvalid";
      }
    };
    JwtTokenNotBefore = class extends Error {
      static {
        __name(this, "JwtTokenNotBefore");
      }
      constructor(token) {
        super(`token (${token}) is being used before it's valid`);
        this.name = "JwtTokenNotBefore";
      }
    };
    JwtTokenExpired = class extends Error {
      static {
        __name(this, "JwtTokenExpired");
      }
      constructor(token) {
        super(`token (${token}) expired`);
        this.name = "JwtTokenExpired";
      }
    };
    JwtTokenIssuedAt = class extends Error {
      static {
        __name(this, "JwtTokenIssuedAt");
      }
      constructor(currentTimestamp, iat) {
        super(
          `Invalid "iat" claim, must be a valid number lower than "${currentTimestamp}" (iat: "${iat}")`
        );
        this.name = "JwtTokenIssuedAt";
      }
    };
    JwtTokenIssuer = class extends Error {
      static {
        __name(this, "JwtTokenIssuer");
      }
      constructor(expected, iss) {
        super(`expected issuer "${expected}", got ${iss ? `"${iss}"` : "none"} `);
        this.name = "JwtTokenIssuer";
      }
    };
    JwtHeaderInvalid = class extends Error {
      static {
        __name(this, "JwtHeaderInvalid");
      }
      constructor(header) {
        super(`jwt header is invalid: ${JSON.stringify(header)}`);
        this.name = "JwtHeaderInvalid";
      }
    };
    JwtHeaderRequiresKid = class extends Error {
      static {
        __name(this, "JwtHeaderRequiresKid");
      }
      constructor(header) {
        super(`required "kid" in jwt header: ${JSON.stringify(header)}`);
        this.name = "JwtHeaderRequiresKid";
      }
    };
    JwtTokenSignatureMismatched = class extends Error {
      static {
        __name(this, "JwtTokenSignatureMismatched");
      }
      constructor(token) {
        super(`token(${token}) signature mismatched`);
        this.name = "JwtTokenSignatureMismatched";
      }
    };
    CryptoKeyUsage = /* @__PURE__ */ ((CryptoKeyUsage2) => {
      CryptoKeyUsage2["Encrypt"] = "encrypt";
      CryptoKeyUsage2["Decrypt"] = "decrypt";
      CryptoKeyUsage2["Sign"] = "sign";
      CryptoKeyUsage2["Verify"] = "verify";
      CryptoKeyUsage2["DeriveKey"] = "deriveKey";
      CryptoKeyUsage2["DeriveBits"] = "deriveBits";
      CryptoKeyUsage2["WrapKey"] = "wrapKey";
      CryptoKeyUsage2["UnwrapKey"] = "unwrapKey";
      return CryptoKeyUsage2;
    })(CryptoKeyUsage || {});
  }
});

// node_modules/hono/dist/utils/jwt/utf8.js
var utf8Encoder, utf8Decoder;
var init_utf8 = __esm({
  "node_modules/hono/dist/utils/jwt/utf8.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    utf8Encoder = new TextEncoder();
    utf8Decoder = new TextDecoder();
  }
});

// node_modules/hono/dist/utils/jwt/jws.js
async function signing(privateKey, alg, data) {
  const algorithm = getKeyAlgorithm(alg);
  const cryptoKey = await importPrivateKey(privateKey, algorithm);
  return await crypto.subtle.sign(algorithm, cryptoKey, data);
}
async function verifying(publicKey, alg, signature, data) {
  const algorithm = getKeyAlgorithm(alg);
  const cryptoKey = await importPublicKey(publicKey, algorithm);
  return await crypto.subtle.verify(algorithm, cryptoKey, signature, data);
}
function pemToBinary(pem) {
  return decodeBase64(pem.replace(/-+(BEGIN|END).*/g, "").replace(/\s/g, ""));
}
async function importPrivateKey(key, alg) {
  if (!crypto.subtle || !crypto.subtle.importKey) {
    throw new Error("`crypto.subtle.importKey` is undefined. JWT auth middleware requires it.");
  }
  if (isCryptoKey(key)) {
    if (key.type !== "private" && key.type !== "secret") {
      throw new Error(
        `unexpected key type: CryptoKey.type is ${key.type}, expected private or secret`
      );
    }
    return key;
  }
  const usages = [CryptoKeyUsage.Sign];
  if (typeof key === "object") {
    return await crypto.subtle.importKey("jwk", key, alg, false, usages);
  }
  if (key.includes("PRIVATE")) {
    return await crypto.subtle.importKey("pkcs8", pemToBinary(key), alg, false, usages);
  }
  return await crypto.subtle.importKey("raw", utf8Encoder.encode(key), alg, false, usages);
}
async function importPublicKey(key, alg) {
  if (!crypto.subtle || !crypto.subtle.importKey) {
    throw new Error("`crypto.subtle.importKey` is undefined. JWT auth middleware requires it.");
  }
  if (isCryptoKey(key)) {
    if (key.type === "public" || key.type === "secret") {
      return key;
    }
    key = await exportPublicJwkFrom(key);
  }
  if (typeof key === "string" && key.includes("PRIVATE")) {
    const privateKey = await crypto.subtle.importKey("pkcs8", pemToBinary(key), alg, true, [
      CryptoKeyUsage.Sign
    ]);
    key = await exportPublicJwkFrom(privateKey);
  }
  const usages = [CryptoKeyUsage.Verify];
  if (typeof key === "object") {
    return await crypto.subtle.importKey("jwk", key, alg, false, usages);
  }
  if (key.includes("PUBLIC")) {
    return await crypto.subtle.importKey("spki", pemToBinary(key), alg, false, usages);
  }
  return await crypto.subtle.importKey("raw", utf8Encoder.encode(key), alg, false, usages);
}
async function exportPublicJwkFrom(privateKey) {
  if (privateKey.type !== "private") {
    throw new Error(`unexpected key type: ${privateKey.type}`);
  }
  if (!privateKey.extractable) {
    throw new Error("unexpected private key is unextractable");
  }
  const jwk = await crypto.subtle.exportKey("jwk", privateKey);
  const { kty } = jwk;
  const { alg, e, n } = jwk;
  const { crv, x, y } = jwk;
  return { kty, alg, e, n, crv, x, y, key_ops: [CryptoKeyUsage.Verify] };
}
function getKeyAlgorithm(name) {
  switch (name) {
    case "HS256":
      return {
        name: "HMAC",
        hash: {
          name: "SHA-256"
        }
      };
    case "HS384":
      return {
        name: "HMAC",
        hash: {
          name: "SHA-384"
        }
      };
    case "HS512":
      return {
        name: "HMAC",
        hash: {
          name: "SHA-512"
        }
      };
    case "RS256":
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: {
          name: "SHA-256"
        }
      };
    case "RS384":
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: {
          name: "SHA-384"
        }
      };
    case "RS512":
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: {
          name: "SHA-512"
        }
      };
    case "PS256":
      return {
        name: "RSA-PSS",
        hash: {
          name: "SHA-256"
        },
        saltLength: 32
      };
    case "PS384":
      return {
        name: "RSA-PSS",
        hash: {
          name: "SHA-384"
        },
        saltLength: 48
      };
    case "PS512":
      return {
        name: "RSA-PSS",
        hash: {
          name: "SHA-512"
        },
        saltLength: 64
      };
    case "ES256":
      return {
        name: "ECDSA",
        hash: {
          name: "SHA-256"
        },
        namedCurve: "P-256"
      };
    case "ES384":
      return {
        name: "ECDSA",
        hash: {
          name: "SHA-384"
        },
        namedCurve: "P-384"
      };
    case "ES512":
      return {
        name: "ECDSA",
        hash: {
          name: "SHA-512"
        },
        namedCurve: "P-521"
      };
    case "EdDSA":
      return {
        name: "Ed25519",
        namedCurve: "Ed25519"
      };
    default:
      throw new JwtAlgorithmNotImplemented(name);
  }
}
function isCryptoKey(key) {
  const runtime = getRuntimeKey();
  if (runtime === "node" && !!crypto.webcrypto) {
    return key instanceof crypto.webcrypto.CryptoKey;
  }
  return key instanceof CryptoKey;
}
var init_jws = __esm({
  "node_modules/hono/dist/utils/jwt/jws.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_adapter();
    init_encode();
    init_types();
    init_utf8();
    __name(signing, "signing");
    __name(verifying, "verifying");
    __name(pemToBinary, "pemToBinary");
    __name(importPrivateKey, "importPrivateKey");
    __name(importPublicKey, "importPublicKey");
    __name(exportPublicJwkFrom, "exportPublicJwkFrom");
    __name(getKeyAlgorithm, "getKeyAlgorithm");
    __name(isCryptoKey, "isCryptoKey");
  }
});

// node_modules/hono/dist/utils/jwt/jwt.js
function isTokenHeader(obj) {
  if (typeof obj === "object" && obj !== null) {
    const objWithAlg = obj;
    return "alg" in objWithAlg && Object.values(AlgorithmTypes).includes(objWithAlg.alg) && (!("typ" in objWithAlg) || objWithAlg.typ === "JWT");
  }
  return false;
}
var encodeJwtPart, encodeSignaturePart, decodeJwtPart, sign, verify, verifyWithJwks, decode, decodeHeader;
var init_jwt = __esm({
  "node_modules/hono/dist/utils/jwt/jwt.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_encode();
    init_jwa();
    init_jws();
    init_types();
    init_utf8();
    encodeJwtPart = /* @__PURE__ */ __name((part) => encodeBase64Url(utf8Encoder.encode(JSON.stringify(part)).buffer).replace(/=/g, ""), "encodeJwtPart");
    encodeSignaturePart = /* @__PURE__ */ __name((buf) => encodeBase64Url(buf).replace(/=/g, ""), "encodeSignaturePart");
    decodeJwtPart = /* @__PURE__ */ __name((part) => JSON.parse(utf8Decoder.decode(decodeBase64Url(part))), "decodeJwtPart");
    __name(isTokenHeader, "isTokenHeader");
    sign = /* @__PURE__ */ __name(async (payload, privateKey, alg = "HS256") => {
      const encodedPayload = encodeJwtPart(payload);
      let encodedHeader;
      if (typeof privateKey === "object" && "alg" in privateKey) {
        alg = privateKey.alg;
        encodedHeader = encodeJwtPart({ alg, typ: "JWT", kid: privateKey.kid });
      } else {
        encodedHeader = encodeJwtPart({ alg, typ: "JWT" });
      }
      const partialToken = `${encodedHeader}.${encodedPayload}`;
      const signaturePart = await signing(privateKey, alg, utf8Encoder.encode(partialToken));
      const signature = encodeSignaturePart(signaturePart);
      return `${partialToken}.${signature}`;
    }, "sign");
    verify = /* @__PURE__ */ __name(async (token, publicKey, algOrOptions) => {
      const optsIn = typeof algOrOptions === "string" ? { alg: algOrOptions } : algOrOptions || {};
      const opts = {
        alg: optsIn.alg ?? "HS256",
        iss: optsIn.iss,
        nbf: optsIn.nbf ?? true,
        exp: optsIn.exp ?? true,
        iat: optsIn.iat ?? true
      };
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new JwtTokenInvalid(token);
      }
      const { header, payload } = decode(token);
      if (!isTokenHeader(header)) {
        throw new JwtHeaderInvalid(header);
      }
      const now = Date.now() / 1e3 | 0;
      if (opts.nbf && payload.nbf && payload.nbf > now) {
        throw new JwtTokenNotBefore(token);
      }
      if (opts.exp && payload.exp && payload.exp <= now) {
        throw new JwtTokenExpired(token);
      }
      if (opts.iat && payload.iat && now < payload.iat) {
        throw new JwtTokenIssuedAt(now, payload.iat);
      }
      if (opts.iss) {
        if (!payload.iss) {
          throw new JwtTokenIssuer(opts.iss, null);
        }
        if (typeof opts.iss === "string" && payload.iss !== opts.iss) {
          throw new JwtTokenIssuer(opts.iss, payload.iss);
        }
        if (opts.iss instanceof RegExp && !opts.iss.test(payload.iss)) {
          throw new JwtTokenIssuer(opts.iss, payload.iss);
        }
      }
      const headerPayload = token.substring(0, token.lastIndexOf("."));
      const verified = await verifying(
        publicKey,
        opts.alg,
        decodeBase64Url(tokenParts[2]),
        utf8Encoder.encode(headerPayload)
      );
      if (!verified) {
        throw new JwtTokenSignatureMismatched(token);
      }
      return payload;
    }, "verify");
    verifyWithJwks = /* @__PURE__ */ __name(async (token, options, init) => {
      const verifyOpts = options.verification || {};
      const header = decodeHeader(token);
      if (!isTokenHeader(header)) {
        throw new JwtHeaderInvalid(header);
      }
      if (!header.kid) {
        throw new JwtHeaderRequiresKid(header);
      }
      if (options.jwks_uri) {
        const response = await fetch(options.jwks_uri, init);
        if (!response.ok) {
          throw new Error(`failed to fetch JWKS from ${options.jwks_uri}`);
        }
        const data = await response.json();
        if (!data.keys) {
          throw new Error('invalid JWKS response. "keys" field is missing');
        }
        if (!Array.isArray(data.keys)) {
          throw new Error('invalid JWKS response. "keys" field is not an array');
        }
        if (options.keys) {
          options.keys.push(...data.keys);
        } else {
          options.keys = data.keys;
        }
      } else if (!options.keys) {
        throw new Error('verifyWithJwks requires options for either "keys" or "jwks_uri" or both');
      }
      const matchingKey = options.keys.find((key) => key.kid === header.kid);
      if (!matchingKey) {
        throw new JwtTokenInvalid(token);
      }
      return await verify(token, matchingKey, {
        alg: matchingKey.alg || header.alg,
        ...verifyOpts
      });
    }, "verifyWithJwks");
    decode = /* @__PURE__ */ __name((token) => {
      try {
        const [h, p] = token.split(".");
        const header = decodeJwtPart(h);
        const payload = decodeJwtPart(p);
        return {
          header,
          payload
        };
      } catch {
        throw new JwtTokenInvalid(token);
      }
    }, "decode");
    decodeHeader = /* @__PURE__ */ __name((token) => {
      try {
        const [h] = token.split(".");
        return decodeJwtPart(h);
      } catch {
        throw new JwtTokenInvalid(token);
      }
    }, "decodeHeader");
  }
});

// node_modules/hono/dist/utils/jwt/index.js
var Jwt;
var init_jwt2 = __esm({
  "node_modules/hono/dist/utils/jwt/index.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_jwt();
    Jwt = { sign, verify, decode, verifyWithJwks };
  }
});

// node_modules/hono/dist/middleware/jwt/jwt.js
var verifyWithJwks2, verify2, decode2, sign2;
var init_jwt3 = __esm({
  "node_modules/hono/dist/middleware/jwt/jwt.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_cookie2();
    init_http_exception();
    init_jwt2();
    init_context();
    verifyWithJwks2 = Jwt.verifyWithJwks;
    verify2 = Jwt.verify;
    decode2 = Jwt.decode;
    sign2 = Jwt.sign;
  }
});

// node_modules/hono/dist/middleware/jwt/index.js
var init_jwt4 = __esm({
  "node_modules/hono/dist/middleware/jwt/index.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_jwt3();
  }
});

// src/utils/security.ts
async function hashSha256(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
function generateState(prefix = "state") {
  return `${prefix}_${crypto.randomUUID()}`;
}
function sanitizeFileName(name) {
  return name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_{2,}/g, "_").replace(/^_+|_+$/g, "").toLowerCase();
}
function assertEnvVar(value, variableName) {
  if (!value) {
    throw new Error(`Environment variable ${variableName} is required`);
  }
  return value;
}
var init_security = __esm({
  "src/utils/security.ts"() {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(hashSha256, "hashSha256");
    __name(generateState, "generateState");
    __name(sanitizeFileName, "sanitizeFileName");
    __name(assertEnvVar, "assertEnvVar");
  }
});

// src/utils/errors.ts
var errors_exports = {};
__export(errors_exports, {
  AppError: () => AppError,
  AuthenticationError: () => AuthenticationError,
  AuthorizationError: () => AuthorizationError,
  ConflictError: () => ConflictError,
  ExternalServiceError: () => ExternalServiceError,
  NotFoundError: () => NotFoundError,
  RateLimitError: () => RateLimitError,
  ValidationError: () => ValidationError,
  asyncHandler: () => asyncHandler,
  errorHandler: () => errorHandler3,
  formatErrorResponse: () => formatErrorResponse,
  handleError: () => handleError,
  validateRequired: () => validateRequired,
  validateType: () => validateType
});
function formatErrorResponse(error3) {
  if (error3 instanceof AppError) {
    return {
      error: {
        code: error3.errorCode,
        message: error3.message,
        details: error3.details
      },
      status: error3.statusCode
    };
  }
  if (error3 instanceof HTTPException) {
    return {
      error: {
        code: "HTTP_ERROR",
        message: error3.message,
        status: error3.status
      },
      status: error3.status
    };
  }
  const isDevelopment = globalThis.NODE_ENV === "development";
  return {
    error: {
      code: "INTERNAL_ERROR",
      message: isDevelopment ? error3.message : "An unexpected error occurred",
      stack: isDevelopment ? error3.stack : void 0
    },
    status: 500
  };
}
async function errorHandler3(err, c) {
  console.error("Error:", err);
  const { error: error3, status } = formatErrorResponse(err);
  const requestId2 = c.req.header("X-Request-ID") || crypto.randomUUID();
  c.header("X-Request-ID", requestId2);
  if (globalThis.NODE_ENV === "production") {
    console.error("Production error:", {
      requestId: requestId2,
      error: error3,
      url: c.req.url,
      method: c.req.method,
      headers: Object.fromEntries(c.req.raw.headers.entries())
    });
  }
  if (err instanceof RateLimitError && err.details?.retryAfter) {
    c.header("Retry-After", String(err.details.retryAfter));
  }
  return c.json(error3, status);
}
function asyncHandler(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error3) {
      throw error3;
    }
  };
}
function validateRequired(data, fields) {
  const missing = fields.filter((field) => !data[field]);
  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(", ")}`,
      { missingFields: missing }
    );
  }
}
function validateType(value, type, fieldName) {
  let isValid2 = false;
  switch (type) {
    case "string":
      isValid2 = typeof value === "string";
      break;
    case "number":
      isValid2 = typeof value === "number" && !isNaN(value);
      break;
    case "boolean":
      isValid2 = typeof value === "boolean";
      break;
    case "array":
      isValid2 = Array.isArray(value);
      break;
    case "object":
      isValid2 = value !== null && typeof value === "object" && !Array.isArray(value);
      break;
  }
  if (!isValid2) {
    throw new ValidationError(
      `Invalid type for ${fieldName}: expected ${type}`,
      { field: fieldName, expectedType: type, actualType: typeof value }
    );
  }
}
var AppError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError, ConflictError, RateLimitError, ExternalServiceError, handleError;
var init_errors = __esm({
  "src/utils/errors.ts"() {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_http_exception();
    AppError = class _AppError extends Error {
      static {
        __name(this, "AppError");
      }
      constructor(message, statusCode = 500, errorCode = "INTERNAL_ERROR", details) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        Object.setPrototypeOf(this, _AppError.prototype);
      }
    };
    ValidationError = class extends AppError {
      static {
        __name(this, "ValidationError");
      }
      constructor(message, details) {
        super(message, 400, "VALIDATION_ERROR", details);
        this.name = "ValidationError";
      }
    };
    AuthenticationError = class extends AppError {
      static {
        __name(this, "AuthenticationError");
      }
      constructor(message = "Authentication required") {
        super(message, 401, "AUTHENTICATION_ERROR");
        this.name = "AuthenticationError";
      }
    };
    AuthorizationError = class extends AppError {
      static {
        __name(this, "AuthorizationError");
      }
      constructor(message = "Insufficient permissions") {
        super(message, 403, "AUTHORIZATION_ERROR");
        this.name = "AuthorizationError";
      }
    };
    NotFoundError = class extends AppError {
      static {
        __name(this, "NotFoundError");
      }
      constructor(resource = "Resource") {
        super(`${resource} not found`, 404, "NOT_FOUND");
        this.name = "NotFoundError";
      }
    };
    ConflictError = class extends AppError {
      static {
        __name(this, "ConflictError");
      }
      constructor(message) {
        super(message, 409, "CONFLICT_ERROR");
        this.name = "ConflictError";
      }
    };
    RateLimitError = class extends AppError {
      static {
        __name(this, "RateLimitError");
      }
      constructor(retryAfter) {
        super("Too many requests", 429, "RATE_LIMIT_ERROR", { retryAfter });
        this.name = "RateLimitError";
      }
    };
    ExternalServiceError = class extends AppError {
      static {
        __name(this, "ExternalServiceError");
      }
      constructor(service, originalError) {
        super(
          `External service error: ${service}`,
          502,
          "EXTERNAL_SERVICE_ERROR",
          { service, originalError }
        );
        this.name = "ExternalServiceError";
      }
    };
    __name(formatErrorResponse, "formatErrorResponse");
    __name(errorHandler3, "errorHandler");
    __name(asyncHandler, "asyncHandler");
    __name(validateRequired, "validateRequired");
    __name(validateType, "validateType");
    handleError = errorHandler3;
  }
});

// src/middleware/analytics.ts
var analytics_exports = {};
__export(analytics_exports, {
  analyticsMiddleware: () => analyticsMiddleware,
  errorTrackingMiddleware: () => errorTrackingMiddleware,
  getAggregatedMetrics: () => getAggregatedMetrics,
  streamMetrics: () => streamMetrics
});
async function sendToAnalyticsEngine(env2, event) {
  if (!env2.ANALYTICS) return;
  try {
    const statusIndex = event.metrics.status != null ? event.metrics.status.toString() : "unknown";
    await env2.ANALYTICS.writeDataPoint({
      blobs: [
        event.type,
        event.metrics.method,
        event.metrics.path,
        event.metrics.error || "",
        event.metrics.aiModel || "",
        event.metrics.country || "",
        event.metrics.cacheStatus || "",
        event.metadata?.environment || "",
        event.metadata?.version || ""
      ],
      doubles: [
        event.metrics.duration,
        event.metrics.cpuTime,
        event.metrics.aiTokensUsed || 0,
        event.metrics.aiDuration || 0,
        event.metrics.cacheHit ? 1 : 0
      ],
      indexes: [statusIndex]
    });
  } catch (error3) {
    console.error("Failed to write to Analytics Engine:", error3);
  }
}
function checkPerformanceThresholds(metrics, env2) {
  const { duration, cpuTime } = metrics;
  let durationLevel = "good";
  if (duration > PERFORMANCE_THRESHOLDS.duration.critical) {
    durationLevel = "critical";
  } else if (duration > PERFORMANCE_THRESHOLDS.duration.warning) {
    durationLevel = "warning";
  }
  let cpuLevel = "good";
  if (cpuTime > PERFORMANCE_THRESHOLDS.cpuTime.critical) {
    cpuLevel = "critical";
  } else if (cpuTime > PERFORMANCE_THRESHOLDS.cpuTime.warning) {
    cpuLevel = "warning";
  }
  if (durationLevel !== "good" || cpuLevel !== "good") {
    console.warn("Performance threshold exceeded:", {
      path: metrics.path,
      duration: `${duration}ms (${durationLevel})`,
      cpuTime: `${cpuTime}ms (${cpuLevel})`,
      status: metrics.status
    });
  }
}
async function getAggregatedMetrics(env2, timeRange, groupBy) {
  if (!env2.ANALYTICS) return null;
  try {
    const result = await env2.ANALYTICS?.query?.({
      timeRange: [timeRange.start, timeRange.end],
      filter: { blob1: "api_request" },
      aggregations: {
        count: { count: {} },
        avgDuration: { avg: { field: "double1" } },
        avgCpuTime: { avg: { field: "double2" } },
        p95Duration: { quantile: { field: "double1", quantile: 0.95 } },
        p95CpuTime: { quantile: { field: "double2", quantile: 0.95 } }
      },
      groupBy: groupBy ? [`blob${getFieldIndex(groupBy)}`] : void 0
    });
    return result ?? null;
  } catch (error3) {
    console.error("Failed to query Analytics Engine:", error3);
    return null;
  }
}
function getFieldIndex(field) {
  const fieldMap = {
    "path": 3,
    "status": 1,
    "country": 2
  };
  return fieldMap[field] || 1;
}
async function streamMetrics(ws, env2) {
  const interval = setInterval(async () => {
    try {
      const metrics = await getAggregatedMetrics(env2, {
        start: new Date(Date.now() - 6e4),
        end: /* @__PURE__ */ new Date()
      });
      if (metrics && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "metrics_update",
          timestamp: Date.now(),
          data: metrics
        }));
      }
    } catch (error3) {
      console.error("Failed to stream metrics:", error3);
    }
  }, 5e3);
  ws.addEventListener("close", () => {
    clearInterval(interval);
  });
}
var PERFORMANCE_THRESHOLDS, analyticsMiddleware, errorTrackingMiddleware;
var init_analytics = __esm({
  "src/middleware/analytics.ts"() {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    PERFORMANCE_THRESHOLDS = {
      duration: {
        good: 100,
        // 100ms 이하
        warning: 500,
        // 500ms 이하
        critical: 1e3
        // 1초 이상
      },
      cpuTime: {
        good: 50,
        // 50ms 이하
        warning: 200,
        // 200ms 이하
        critical: 500
        // 500ms 이상
      }
    };
    analyticsMiddleware = /* @__PURE__ */ __name(async (c, next) => {
      const startTime = Date.now();
      const startCpu = c.executionCtx.cpuTime || 0;
      const request = c.req.raw;
      const url = new URL(request.url);
      const cf = request.cf;
      try {
        await next();
        const duration = Date.now() - startTime;
        const cpuTime = (c.executionCtx.cpuTime || 0) - startCpu;
        const status = c.res.status;
        const metrics = {
          method: request.method,
          path: url.pathname,
          status,
          duration,
          cpuTime,
          userAgent: request.headers.get("user-agent") || void 0,
          country: cf?.country,
          city: cf?.city,
          colo: cf?.colo,
          tlsVersion: cf?.tlsVersion,
          httpProtocol: cf?.httpProtocol,
          cacheStatus: c.res.headers.get("cf-cache-status") || void 0,
          cacheHit: c.res.headers.get("cf-cache-status") === "HIT"
        };
        const aiMetrics = c.get("aiMetrics");
        if (aiMetrics) {
          metrics.aiModel = aiMetrics.model;
          metrics.aiTokensUsed = aiMetrics.tokensUsed;
          metrics.aiDuration = aiMetrics.duration;
        }
        if (status >= 400) {
          const error3 = c.get("error");
          if (error3) {
            metrics.error = error3.message;
            metrics.errorType = error3.type || "unknown";
          }
        }
        await sendToAnalyticsEngine(c.env, {
          timestamp: Date.now(),
          type: "api_request",
          metrics,
          metadata: {
            environment: c.env.ENVIRONMENT,
            version: c.env.API_VERSION
          }
        });
        checkPerformanceThresholds(metrics, c.env);
        c.res.headers.set("Server-Timing", [
          `cpu;dur=${cpuTime.toFixed(2)}`,
          `total;dur=${duration.toFixed(2)}`,
          cf?.colo ? `colo;desc="${cf.colo}"` : null
        ].filter(Boolean).join(", "));
      } catch (error3) {
        console.error("Analytics middleware error:", error3);
      }
    }, "analyticsMiddleware");
    __name(sendToAnalyticsEngine, "sendToAnalyticsEngine");
    __name(checkPerformanceThresholds, "checkPerformanceThresholds");
    errorTrackingMiddleware = /* @__PURE__ */ __name(async (c, next) => {
      try {
        await next();
      } catch (error3) {
        c.set("error", {
          message: error3.message,
          type: error3.constructor.name,
          stack: error3.stack
        });
        await sendToAnalyticsEngine(c.env, {
          timestamp: Date.now(),
          type: "error",
          metrics: {
            method: c.req.method,
            path: new URL(c.req.url).pathname,
            status: 500,
            duration: 0,
            cpuTime: 0,
            error: error3.message,
            errorType: error3.constructor.name
          },
          metadata: {
            stack: error3.stack,
            environment: c.env.ENVIRONMENT
          }
        });
        throw error3;
      }
    }, "errorTrackingMiddleware");
    __name(getAggregatedMetrics, "getAggregatedMetrics");
    __name(getFieldIndex, "getFieldIndex");
    __name(streamMetrics, "streamMetrics");
  }
});

// src/utils/db.ts
async function query(db, sql, params = []) {
  const result = await db.prepare(sql).bind(...params).all();
  return result.results ?? [];
}
async function queryFirst(db, sql, params = []) {
  const rows = await query(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}
async function execute(db, sql, params = []) {
  return db.prepare(sql).bind(...params).run();
}
async function transaction(db, statements, reducer) {
  let accumulator = void 0;
  await db.batch(
    statements.map(({ sql, params }) => db.prepare(sql).bind(...params ?? []))
  ).then((results) => {
    if (reducer) {
      results.forEach((res, index) => {
        accumulator = reducer(res, index, accumulator);
      });
    }
  });
  return accumulator;
}
var init_db = __esm({
  "src/utils/db.ts"() {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(query, "query");
    __name(queryFirst, "queryFirst");
    __name(execute, "execute");
    __name(transaction, "transaction");
  }
});

// src/utils/userAgent.ts
function parseUserAgent(userAgent) {
  if (!userAgent) {
    return {
      device: "Unknown Device",
      browser: "Unknown Browser",
      os: "Unknown OS"
    };
  }
  const ua = userAgent.toLowerCase();
  let os = "Unknown OS";
  if (ua.includes("windows")) {
    os = "Windows";
    if (ua.includes("windows nt 10.0")) os = "Windows 10";
    else if (ua.includes("windows nt 6.3")) os = "Windows 8.1";
    else if (ua.includes("windows nt 6.2")) os = "Windows 8";
    else if (ua.includes("windows nt 6.1")) os = "Windows 7";
  } else if (ua.includes("mac os x")) {
    os = "MacOS";
    const match = ua.match(/mac os x (\d+[._]\d+)/);
    if (match) {
      os = `MacOS ${match[1].replace("_", ".")}`;
    }
  } else if (ua.includes("android")) {
    os = "Android";
    const match = ua.match(/android (\d+\.?\d*)/);
    if (match) {
      os = `Android ${match[1]}`;
    }
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    os = ua.includes("ipad") ? "iPadOS" : "iOS";
    const match = ua.match(/os (\d+[._]\d+)/);
    if (match) {
      os = `${os} ${match[1].replace("_", ".")}`;
    }
  } else if (ua.includes("linux")) {
    os = "Linux";
  }
  let browser = "Unknown Browser";
  let version2 = "";
  if (ua.includes("edg/")) {
    browser = "Edge";
    const match = ua.match(/edg\/(\d+\.?\d*)/);
    if (match) version2 = match[1];
  } else if (ua.includes("chrome/") && !ua.includes("edg")) {
    browser = "Chrome";
    const match = ua.match(/chrome\/(\d+\.?\d*)/);
    if (match) version2 = match[1];
  } else if (ua.includes("safari/") && !ua.includes("chrome")) {
    browser = "Safari";
    const match = ua.match(/version\/(\d+\.?\d*)/);
    if (match) version2 = match[1];
  } else if (ua.includes("firefox/")) {
    browser = "Firefox";
    const match = ua.match(/firefox\/(\d+\.?\d*)/);
    if (match) version2 = match[1];
  } else if (ua.includes("opera/") || ua.includes("opr/")) {
    browser = "Opera";
    const match = ua.match(/(?:opera|opr)\/(\d+\.?\d*)/);
    if (match) version2 = match[1];
  }
  if (version2) {
    browser = `${browser} ${version2.split(".")[0]}`;
  }
  let device = "Desktop";
  if (ua.includes("mobile")) {
    device = "Mobile";
  } else if (ua.includes("tablet") || ua.includes("ipad")) {
    device = "Tablet";
  }
  const deviceInfo = `${browser} on ${os}`;
  return {
    device: deviceInfo,
    browser,
    os
  };
}
function getLocationFromIP(ipAddress) {
  return {
    location: "Unknown Location",
    countryCode: "XX"
  };
}
function detectSuspiciousActivity(params) {
  return {
    suspicious: false,
    reason: void 0
  };
}
var init_userAgent = __esm({
  "src/utils/userAgent.ts"() {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(parseUserAgent, "parseUserAgent");
    __name(getLocationFromIP, "getLocationFromIP");
    __name(detectSuspiciousActivity, "detectSuspiciousActivity");
  }
});

// src/services/auth.ts
var auth_exports = {};
__export(auth_exports, {
  generateLoginUrl: () => generateLoginUrl,
  handleOAuthCallback: () => handleOAuthCallback,
  logoutUser: () => logoutUser,
  refreshTokens: () => refreshTokens
});
function resolveNumericEnv(value, fallback) {
  if (!value) return fallback;
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }
  return fallback;
}
function getAccessTokenTtl(env2) {
  return resolveNumericEnv(env2.ACCESS_TOKEN_TTL_SECONDS, DEFAULT_ACCESS_TOKEN_TTL_SECONDS);
}
function getRefreshTokenTtl(env2) {
  return resolveNumericEnv(env2.REFRESH_TOKEN_TTL_SECONDS, DEFAULT_REFRESH_TOKEN_TTL_SECONDS);
}
function getJwtIssuer(env2) {
  return env2.JWT_ISSUER ?? env2.API_BASE_URL ?? "https://api.languagemate.kr";
}
function getProviderConfig(env2, provider) {
  switch (provider) {
    case "naver":
      return {
        clientId: assertEnvVar(env2.NAVER_CLIENT_ID, "NAVER_CLIENT_ID"),
        clientSecret: assertEnvVar(env2.NAVER_CLIENT_SECRET, "NAVER_CLIENT_SECRET"),
        redirectUri: assertEnvVar(env2.NAVER_REDIRECT_URI, "NAVER_REDIRECT_URI")
      };
    case "google":
      return {
        clientId: assertEnvVar(env2.GOOGLE_CLIENT_ID, "GOOGLE_CLIENT_ID"),
        clientSecret: assertEnvVar(env2.GOOGLE_CLIENT_SECRET, "GOOGLE_CLIENT_SECRET"),
        redirectUri: assertEnvVar(env2.GOOGLE_REDIRECT_URI, "GOOGLE_REDIRECT_URI")
      };
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
function normalizeProvider(provider) {
  const value = provider.toLowerCase();
  if (value !== "naver" && value !== "google") {
    throw new Error(`Invalid OAuth provider: ${provider}`);
  }
  return value;
}
async function upsertOAuthUser(env2, identity, provider, payload) {
  const existing = await queryFirst(
    env2.DB,
    "SELECT user_id, user_identity, email, name, english_name, profile_image, self_bio, gender FROM users WHERE user_identity = ? LIMIT 1",
    [identity]
  );
  const nowIso7 = (/* @__PURE__ */ new Date()).toISOString();
  if (existing) {
    const updates = [];
    const params = [];
    if (payload.name) {
      updates.push("name = ?");
      params.push(payload.name);
    }
    if (payload.email) {
      updates.push("email = ?");
      params.push(payload.email);
    }
    if (payload.profileImage) {
      updates.push("profile_image = ?");
      params.push(payload.profileImage);
    }
    if (updates.length > 0) {
      updates.push("updated_at = ?");
      params.push(nowIso7);
      params.push(existing.user_id);
      await execute(env2.DB, `UPDATE users SET ${updates.join(", ")} WHERE user_id = ?`, params);
    }
    return {
      ...existing,
      email: payload.email ?? existing.email,
      name: payload.name ?? existing.name,
      profile_image: payload.profileImage ?? existing.profile_image
    };
  }
  const userId = crypto.randomUUID();
  await execute(
    env2.DB,
    `INSERT INTO users (
        user_id,
        user_identity,
        email,
        name,
        profile_image,
        user_disable,
        is_onboarding_completed,
        user_identity_type,
        user_created_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?)
    `,
    [
      userId,
      identity,
      payload.email ?? null,
      payload.name ?? null,
      payload.profileImage ?? null,
      provider.toUpperCase(),
      nowIso7,
      nowIso7,
      nowIso7
    ]
  );
  return {
    user_id: userId,
    user_identity: identity,
    email: payload.email ?? null,
    name: payload.name ?? null,
    english_name: null,
    profile_image: payload.profileImage ?? null,
    self_bio: null,
    gender: null
  };
}
async function issueTokens(options) {
  const {
    env: env2,
    userId,
    email,
    role = "USER",
    permissions = [],
    userAgent,
    ipAddress,
    replaceTokenId
  } = options;
  const secret = assertEnvVar(env2.JWT_SECRET, "JWT_SECRET");
  const accessTokenTtl = getAccessTokenTtl(env2);
  const refreshTokenTtl = getRefreshTokenTtl(env2);
  const issuer = getJwtIssuer(env2);
  const nowSeconds = Math.floor(Date.now() / 1e3);
  const expiresAtSeconds = nowSeconds + accessTokenTtl;
  const payload = {
    sub: userId,
    email,
    role,
    permissions,
    iat: nowSeconds,
    exp: expiresAtSeconds,
    iss: issuer
  };
  const accessToken = await sign2(payload, secret, "HS512");
  const refreshId = crypto.randomUUID();
  const refreshPayload = {
    jti: refreshId,
    sub: userId,
    type: "refresh",
    iat: nowSeconds,
    exp: nowSeconds + refreshTokenTtl,
    iss: issuer
  };
  const refreshToken = await sign2(refreshPayload, secret, "HS512");
  const refreshHash = await hashSha256(refreshToken);
  const issuedAtIso = new Date(nowSeconds * 1e3).toISOString();
  const refreshExpiresAtIso = new Date((nowSeconds + refreshTokenTtl) * 1e3).toISOString();
  const parsedUA = parseUserAgent(userAgent);
  const locationInfo = getLocationFromIP(ipAddress);
  const suspiciousCheck = detectSuspiciousActivity({
    ipAddress,
    userAgent
  });
  await transaction(env2.DB, [
    ...replaceTokenId ? [
      {
        sql: "UPDATE refresh_tokens SET revoked_at = ? WHERE token_id = ?",
        params: [issuedAtIso, replaceTokenId]
      }
    ] : [],
    {
      sql: `INSERT INTO refresh_tokens (
              token_id,
              user_id,
              token_hash,
              issued_at,
              expires_at,
              user_agent,
              ip_address
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      params: [refreshId, userId, refreshHash, issuedAtIso, refreshExpiresAtIso, userAgent ?? null, ipAddress ?? null]
    },
    // 로그인 히스토리 기록
    {
      sql: `INSERT INTO login_history (
              user_id,
              login_time,
              ip_address,
              user_agent,
              device,
              browser,
              location,
              country_code,
              suspicious,
              suspicious_reason,
              session_id,
              success
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        userId,
        issuedAtIso,
        ipAddress ?? null,
        userAgent ?? null,
        parsedUA.device,
        parsedUA.browser,
        locationInfo.location,
        locationInfo.countryCode,
        suspiciousCheck.suspicious ? 1 : 0,
        suspiciousCheck.reason ?? null,
        refreshId,
        1
        // success = 1
      ]
    }
  ]);
  return {
    accessToken,
    refreshToken,
    expiresIn: accessTokenTtl
  };
}
async function getUserById(env2, userId) {
  return queryFirst(
    env2.DB,
    "SELECT user_id, user_identity, email, name, english_name, profile_image, self_bio, gender FROM users WHERE user_id = ? LIMIT 1",
    [userId]
  );
}
function mapDbUserToAuthUser(row) {
  return {
    id: row.user_id,
    email: row.email ?? void 0,
    role: "USER",
    permissions: []
  };
}
async function consumeState(env2, state) {
  if (!state) {
    return null;
  }
  const key = `oauth:state:${state}`;
  const value = await env2.CACHE.get(key, { type: "json" });
  if (value) {
    await env2.CACHE.delete(key);
  }
  return value;
}
async function generateLoginUrl(env2, providerName, redirectUri) {
  const provider = normalizeProvider(providerName);
  const config2 = getProviderConfig(env2, provider);
  const state = generateState(provider);
  const baseRedirect = redirectUri || "https://languagemate.kr";
  const callbackUrl = (() => {
    try {
      return new URL(`/login/oauth2/code/${provider}`, baseRedirect).toString();
    } catch {
      return `https://languagemate.kr/login/oauth2/code/${provider}`;
    }
  })();
  const statePayload = {
    provider,
    redirectUri: baseRedirect,
    // 최종 리다이렉트 목적지
    callbackUrl,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await env2.CACHE.put(`oauth:state:${state}`, JSON.stringify(statePayload), {
    expirationTtl: 300
  });
  const authorizeUrl = new URL(provider === "naver" ? NAVER_AUTHORIZE_URL : GOOGLE_AUTHORIZE_URL);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", config2.clientId);
  authorizeUrl.searchParams.set("redirect_uri", config2.redirectUri);
  authorizeUrl.searchParams.set("state", state);
  if (provider === "google") {
    authorizeUrl.searchParams.set("scope", "openid email profile");
    authorizeUrl.searchParams.set("access_type", "offline");
    authorizeUrl.searchParams.set("prompt", "consent");
  }
  return {
    url: authorizeUrl.toString(),
    state
  };
}
async function handleOAuthCallback(env2, providerName, params, metadata = {}) {
  const provider = normalizeProvider(providerName);
  const config2 = getProviderConfig(env2, provider);
  const statePayload = await consumeState(env2, params.state);
  const finalRedirectUri = statePayload?.redirectUri ?? "https://languagemate.kr";
  const callbackUrl = statePayload?.callbackUrl ?? (() => {
    try {
      return new URL(`/login/oauth2/code/${provider}`, finalRedirectUri).toString();
    } catch {
      return `https://languagemate.kr/login/oauth2/code/${provider}`;
    }
  })();
  if (statePayload && statePayload.provider !== provider) {
    throw new Error("OAuth provider mismatch for provided state");
  }
  const result = provider === "naver" ? await handleNaverCallback(env2, config2, params.code, params.state, config2.redirectUri, metadata) : await handleGoogleCallback(env2, config2, params.code, config2.redirectUri, metadata);
  return {
    ...result,
    redirectUri: finalRedirectUri,
    callbackUrl
  };
}
async function handleNaverCallback(env2, config2, code, state, redirectUri, metadata) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config2.clientId,
    client_secret: config2.clientSecret,
    code,
    state: state ?? "",
    redirect_uri: redirectUri
  });
  const tokenRes = await fetch(NAVER_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!tokenRes.ok) {
    throw new Error(`Naver token exchange failed: ${tokenRes.status}`);
  }
  const tokenJson = await tokenRes.json();
  const accessToken = tokenJson.access_token;
  if (!accessToken) {
    throw new Error("Naver token exchange response missing access_token");
  }
  const profileRes = await fetch(NAVER_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!profileRes.ok) {
    throw new Error(`Naver userinfo request failed: ${profileRes.status}`);
  }
  const profileJson = await profileRes.json();
  const response = profileJson.response ?? {};
  const identity = response.id;
  if (!identity) {
    throw new Error("Naver userinfo did not include id");
  }
  const userRow = await upsertOAuthUser(env2, identity, "naver", {
    name: response.name ?? response.nickname ?? null,
    email: response.email ?? null,
    profileImage: response.profile_image ?? null
  });
  const tokens = await issueTokens({
    env: env2,
    userId: userRow.user_id,
    email: userRow.email,
    role: "USER",
    permissions: [],
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress
  });
  return {
    user: mapDbUserToAuthUser(userRow),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
    redirectUri
  };
}
async function handleGoogleCallback(env2, config2, code, redirectUri, metadata) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config2.clientId,
    client_secret: config2.clientSecret,
    code,
    redirect_uri: redirectUri
  });
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!tokenRes.ok) {
    throw new Error(`Google token exchange failed: ${tokenRes.status}`);
  }
  const tokenJson = await tokenRes.json();
  const accessToken = tokenJson.access_token;
  if (!accessToken) {
    throw new Error("Google token exchange response missing access_token");
  }
  const profileRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!profileRes.ok) {
    throw new Error(`Google userinfo request failed: ${profileRes.status}`);
  }
  const profileJson = await profileRes.json();
  if (!profileJson.id) {
    throw new Error("Google userinfo did not include id");
  }
  const userRow = await upsertOAuthUser(env2, profileJson.id, "google", {
    name: profileJson.name ?? null,
    email: profileJson.email ?? null,
    profileImage: profileJson.picture ?? null
  });
  const tokens = await issueTokens({
    env: env2,
    userId: userRow.user_id,
    email: userRow.email,
    role: "USER",
    permissions: [],
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress
  });
  return {
    user: mapDbUserToAuthUser(userRow),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
    redirectUri
  };
}
async function refreshTokens(env2, refreshToken, metadata = {}) {
  const refreshHash = await hashSha256(refreshToken);
  const row = await queryFirst(
    env2.DB,
    "SELECT token_id, user_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = ? LIMIT 1",
    [refreshHash]
  );
  if (!row) {
    throw new Error("Invalid refresh token");
  }
  if (row.revoked_at) {
    throw new Error("Refresh token revoked");
  }
  if (Date.parse(row.expires_at) < Date.now()) {
    throw new Error("Refresh token expired");
  }
  const user = await getUserById(env2, row.user_id);
  if (!user) {
    throw new Error("User not found for refresh token");
  }
  return issueTokens({
    env: env2,
    userId: user.user_id,
    email: user.email,
    role: "USER",
    permissions: [],
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress,
    replaceTokenId: row.token_id
  });
}
async function logoutUser(env2, _accessToken, refreshToken) {
  if (!refreshToken) {
    return;
  }
  const refreshHash = await hashSha256(refreshToken);
  await execute(
    env2.DB,
    "UPDATE refresh_tokens SET revoked_at = ? WHERE token_hash = ?",
    [(/* @__PURE__ */ new Date()).toISOString(), refreshHash]
  );
}
var DEFAULT_ACCESS_TOKEN_TTL_SECONDS, DEFAULT_REFRESH_TOKEN_TTL_SECONDS, NAVER_AUTHORIZE_URL, NAVER_TOKEN_URL, NAVER_USERINFO_URL, GOOGLE_AUTHORIZE_URL, GOOGLE_TOKEN_URL, GOOGLE_USERINFO_URL;
var init_auth = __esm({
  "src/services/auth.ts"() {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_jwt4();
    init_security();
    init_db();
    init_userAgent();
    DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 24 * 60 * 60;
    DEFAULT_REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
    __name(resolveNumericEnv, "resolveNumericEnv");
    __name(getAccessTokenTtl, "getAccessTokenTtl");
    __name(getRefreshTokenTtl, "getRefreshTokenTtl");
    __name(getJwtIssuer, "getJwtIssuer");
    NAVER_AUTHORIZE_URL = "https://nid.naver.com/oauth2.0/authorize";
    NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token";
    NAVER_USERINFO_URL = "https://openapi.naver.com/v1/nid/me";
    GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
    GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
    __name(getProviderConfig, "getProviderConfig");
    __name(normalizeProvider, "normalizeProvider");
    __name(upsertOAuthUser, "upsertOAuthUser");
    __name(issueTokens, "issueTokens");
    __name(getUserById, "getUserById");
    __name(mapDbUserToAuthUser, "mapDbUserToAuthUser");
    __name(consumeState, "consumeState");
    __name(generateLoginUrl, "generateLoginUrl");
    __name(handleOAuthCallback, "handleOAuthCallback");
    __name(handleNaverCallback, "handleNaverCallback");
    __name(handleGoogleCallback, "handleGoogleCallback");
    __name(refreshTokens, "refreshTokens");
    __name(logoutUser, "logoutUser");
  }
});

// .wrangler/tmp/bundle-e6xCjn/middleware-loader.entry.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// .wrangler/tmp/bundle-e6xCjn/middleware-insertion-facade.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/index.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/index.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/hono.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/hono-base.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/compose.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context2, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context2.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context2, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context2.error = err;
            res = await onError(err, context2);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context2.finalized === false && onNotFound) {
          res = await onNotFound(context2);
        }
      }
      if (res && (context2.finalized === false || isError)) {
        context2.res = res;
      }
      return context2;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/hono-base.js
init_context();

// node_modules/hono/dist/router.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
  static {
    __name(this, "UnsupportedPathError");
  }
};

// node_modules/hono/dist/utils/constants.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
init_url();
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = class {
  static {
    __name(this, "Hono");
  }
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app9) {
    const subApp = this.basePath(path);
    app9.routes.map((r) => {
      let handler;
      if (app9.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app9.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = /* @__PURE__ */ __name((handler) => {
    this.errorHandler = handler;
    return this;
  }, "onError");
  notFound = /* @__PURE__ */ __name((handler) => {
    this.#notFoundHandler = handler;
    return this;
  }, "notFound");
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    }
    const path = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context2 = await composed(c);
        if (!context2.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context2.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  fetch = /* @__PURE__ */ __name((request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  }, "fetch");
  request = /* @__PURE__ */ __name((input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  }, "request");
  fire = /* @__PURE__ */ __name(() => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  }, "fire");
};

// node_modules/hono/dist/router/reg-exp-router/index.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/reg-exp-router/router.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_url();

// node_modules/hono/dist/router/reg-exp-router/node.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = class {
  static {
    __name(this, "Node");
  }
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context2, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node();
        if (name !== "") {
          node.#varIndex = context2.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node();
      }
    }
    node.insert(restTokens, index, paramMap, context2, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var Trie = class {
  static {
    __name(this, "Trie");
  }
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var emptyParam = [];
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = class {
  static {
    __name(this, "RegExpRouter");
  }
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache();
    const matchers = this.#buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }
      const index = match.indexOf("", 1);
      return [matcher[1][index], match];
    };
    return this.match(method, path);
  }
  #buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/smart-router/index.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/smart-router/router.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var SmartRouter = class {
  static {
    __name(this, "SmartRouter");
  }
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/index.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/trie-router/router.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_url();

// node_modules/hono/dist/router/trie-router/node.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_url();
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = class {
  static {
    __name(this, "Node");
  }
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  static {
    __name(this, "TrieRouter");
  }
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  static {
    __name(this, "Hono");
  }
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// node_modules/hono/dist/middleware/cors/index.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var cors = /* @__PURE__ */ __name((options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return /* @__PURE__ */ __name(async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    __name(set, "set");
    const allowOrigin = findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.origin !== "*") {
      const existingVary = c.req.header("Vary");
      if (existingVary) {
        set("Vary", existingVary);
      } else {
        set("Vary", "Origin");
      }
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
  }, "cors2");
}, "cors");

// src/routes/levelTest.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/middleware/auth.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_jwt4();

// src/middleware/error-handler.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_http_exception();

// src/types/index.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var ApiError = class extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = "ApiError";
  }
  static {
    __name(this, "ApiError");
  }
};

// src/utils/logger.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};
var WorkersLogger = class _WorkersLogger {
  constructor() {
    this.currentLevel = LOG_LEVELS.INFO;
    this.environment = "production";
  }
  static {
    __name(this, "WorkersLogger");
  }
  static getInstance() {
    if (!_WorkersLogger.instance) {
      _WorkersLogger.instance = new _WorkersLogger();
    }
    return _WorkersLogger.instance;
  }
  setLevel(level) {
    this.currentLevel = LOG_LEVELS[level];
  }
  setEnvironment(env2) {
    this.environment = env2;
    if (env2 === "development" || env2 === "staging") {
      this.setLevel("DEBUG");
    }
  }
  shouldLog(level) {
    return level >= this.currentLevel;
  }
  createLogEntry(level, message, context2, error3, metadata) {
    const entry = {
      level,
      message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      context: context2,
      metadata
    };
    if (error3) {
      entry.error = {
        name: error3.name,
        message: error3.message,
        stack: this.environment === "development" ? error3.stack : void 0
      };
    }
    return entry;
  }
  output(entry) {
    const logString = JSON.stringify(entry);
    switch (entry.level) {
      case "ERROR":
        console.error(logString);
        break;
      case "WARN":
        console.warn(logString);
        break;
      case "INFO":
      case "DEBUG":
      default:
        console.log(logString);
        break;
    }
  }
  debug(message, context2, metadata) {
    if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
    const entry = this.createLogEntry("DEBUG", message, context2, void 0, metadata);
    this.output(entry);
  }
  info(message, context2, metadata) {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    const entry = this.createLogEntry("INFO", message, context2, void 0, metadata);
    this.output(entry);
  }
  warn(message, context2, metadata) {
    if (!this.shouldLog(LOG_LEVELS.WARN)) return;
    const entry = this.createLogEntry("WARN", message, context2, void 0, metadata);
    this.output(entry);
  }
  error(message, error3, context2, metadata) {
    if (!this.shouldLog(LOG_LEVELS.ERROR)) return;
    const entry = this.createLogEntry("ERROR", message, context2, error3, metadata);
    this.output(entry);
  }
  // API 호출 전용 로깅
  apiCall(method, path, status, duration, context2) {
    const message = `${method.toUpperCase()} ${path} - ${status} (${duration}ms)`;
    const apiContext = {
      ...context2,
      method: method.toUpperCase(),
      path,
      status,
      duration,
      component: "API"
    };
    if (status >= 500) {
      this.error(message, void 0, apiContext);
    } else if (status >= 400) {
      this.warn(message, apiContext);
    } else {
      this.info(message, apiContext);
    }
  }
  // 성능 로깅
  performance(operation, duration, context2) {
    const perfContext = {
      ...context2,
      operation,
      duration,
      component: "PERFORMANCE"
    };
    if (duration > 5e3) {
      this.warn(`Slow operation: ${operation} (${duration}ms)`, perfContext);
    } else if (duration > 1e3) {
      this.info(`Operation: ${operation} (${duration}ms)`, perfContext);
    } else {
      this.debug(`Operation: ${operation} (${duration}ms)`, perfContext);
    }
  }
  // AI 서비스 로깅
  aiOperation(service, operation, duration, tokens, context2) {
    const aiContext = {
      ...context2,
      component: "AI",
      operation: `${service}.${operation}`,
      duration
    };
    const metadata = tokens ? { tokens } : void 0;
    this.info(`AI ${service}: ${operation} (${duration}ms)`, aiContext, metadata);
  }
  // WebRTC 로깅
  webrtc(event, roomId, userId, context2) {
    const webrtcContext = {
      ...context2,
      component: "WEBRTC",
      operation: event,
      userId
    };
    const metadata = roomId ? { roomId } : void 0;
    this.info(`WebRTC: ${event}`, webrtcContext, metadata);
  }
  // 스토리지 작업 로깅
  storage(operation, key, size, context2) {
    const storageContext = {
      ...context2,
      component: "STORAGE",
      operation
    };
    const metadata = { key, size };
    this.debug(`Storage ${operation}: ${key}`, storageContext, metadata);
  }
  // 캐시 작업 로깅
  cache(operation, key, context2) {
    const cacheContext = {
      ...context2,
      component: "CACHE",
      operation
    };
    const metadata = { key };
    this.debug(`Cache ${operation}: ${key}`, cacheContext, metadata);
  }
  // 보안 이벤트 로깅
  security(event, ip, context2) {
    const securityContext = {
      ...context2,
      component: "SECURITY",
      operation: event,
      ip
    };
    this.warn(`Security event: ${event}`, securityContext);
  }
};
var logger = WorkersLogger.getInstance();
var log3 = {
  debug: /* @__PURE__ */ __name((msg, ctx, meta) => logger.debug(msg, ctx, meta), "debug"),
  info: /* @__PURE__ */ __name((msg, ctx, meta) => logger.info(msg, ctx, meta), "info"),
  warn: /* @__PURE__ */ __name((msg, ctx, meta) => logger.warn(msg, ctx, meta), "warn"),
  error: /* @__PURE__ */ __name((msg, err, ctx, meta) => logger.error(msg, err, ctx, meta), "error"),
  api: /* @__PURE__ */ __name((method, path, status, duration, ctx) => logger.apiCall(method, path, status, duration, ctx), "api"),
  perf: /* @__PURE__ */ __name((operation, duration, ctx) => logger.performance(operation, duration, ctx), "perf"),
  ai: /* @__PURE__ */ __name((service, operation, duration, tokens, ctx) => logger.aiOperation(service, operation, duration, tokens, ctx), "ai"),
  webrtc: /* @__PURE__ */ __name((event, roomId, userId, ctx) => logger.webrtc(event, roomId, userId, ctx), "webrtc"),
  storage: /* @__PURE__ */ __name((operation, key, size, ctx) => logger.storage(operation, key, size, ctx), "storage"),
  cache: /* @__PURE__ */ __name((operation, key, ctx) => logger.cache(operation, key, ctx), "cache"),
  security: /* @__PURE__ */ __name((event, ip, ctx) => logger.security(event, ip, ctx), "security")
};

// src/middleware/error-handler.ts
async function errorHandler2(c, next) {
  try {
    await next();
  } catch (error3) {
    log3.error(
      "Unhandled error in request",
      error3 instanceof Error ? error3 : new Error(String(error3)),
      {
        requestId: c.get("requestId"),
        path: c.req.path,
        method: c.req.method,
        component: "ERROR_HANDLER"
      }
    );
    if (error3 instanceof ApiError) {
      return c.json({
        success: false,
        error: {
          message: error3.message,
          code: error3.code,
          details: error3.details
        },
        meta: {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          requestId: c.get("requestId")
        }
      }, error3.statusCode);
    }
    if (error3 instanceof HTTPException) {
      return c.json({
        success: false,
        error: {
          message: error3.message,
          code: "HTTP_EXCEPTION"
        },
        meta: {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          requestId: c.get("requestId")
        }
      }, { status: error3.status });
    }
    const isDevelopment = c.env.ENVIRONMENT === "development";
    return c.json({
      success: false,
      error: {
        message: isDevelopment ? error3.message : "Internal Server Error",
        code: "INTERNAL_ERROR",
        details: isDevelopment ? error3.stack : void 0
      },
      meta: {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        requestId: c.get("requestId")
      }
    }, { status: 500 });
  }
}
__name(errorHandler2, "errorHandler");
function notFoundHandler2(c) {
  return c.json({
    success: false,
    error: {
      message: `Route not found: ${c.req.method} ${c.req.path}`,
      code: "NOT_FOUND"
    },
    meta: {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      requestId: c.get("requestId")
    }
  }, { status: 404 });
}
__name(notFoundHandler2, "notFoundHandler");
function validationError(message, details) {
  return new ApiError(400, "VALIDATION_ERROR", message, details);
}
__name(validationError, "validationError");
function authError(message = "Unauthorized") {
  return new ApiError(401, "AUTH_ERROR", message);
}
__name(authError, "authError");
function forbiddenError(message = "Forbidden") {
  return new ApiError(403, "FORBIDDEN", message);
}
__name(forbiddenError, "forbiddenError");
function notFoundError(resource) {
  return new ApiError(404, "NOT_FOUND", `${resource} not found`);
}
__name(notFoundError, "notFoundError");
function conflictError(message) {
  return new ApiError(409, "CONFLICT", message);
}
__name(conflictError, "conflictError");

// src/middleware/auth.ts
init_security();
async function extractUser(token, env2) {
  try {
    const secret = assertEnvVar(env2.JWT_SECRET, "JWT_SECRET");
    const verifyOptions = { alg: "HS512" };
    const issuer = env2.JWT_ISSUER ?? env2.API_BASE_URL;
    if (issuer) {
      verifyOptions.iss = issuer;
    }
    const payload = await verify2(token, secret, verifyOptions);
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions
    };
  } catch (error3) {
    return null;
  }
}
__name(extractUser, "extractUser");
function auth(options = {}) {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      if (options.optional) {
        return next();
      }
      return c.json({
        success: false,
        error: {
          message: "Authorization header required",
          code: "AUTH_ERROR"
        },
        meta: {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          requestId: c.get("requestId")
        }
      }, 401);
    }
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match) {
      return c.json({
        success: false,
        error: {
          message: "Invalid authorization format. Use: Bearer <token>",
          code: "AUTH_ERROR"
        },
        meta: {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          requestId: c.get("requestId")
        }
      }, 401);
    }
    const token = match[1];
    const user = await extractUser(token, c.env);
    if (!user) {
      return c.json({
        success: false,
        error: {
          message: "Invalid or expired token",
          code: "AUTH_ERROR"
        },
        meta: {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          requestId: c.get("requestId")
        }
      }, 401);
    }
    if (options.roles && options.roles.length > 0) {
      if (!user.role || !options.roles.includes(user.role)) {
        throw forbiddenError("Insufficient role");
      }
    }
    if (options.permissions && options.permissions.length > 0) {
      const hasPermission = options.permissions.some(
        (permission2) => user.permissions?.includes(permission2)
      );
      if (!hasPermission) {
        throw forbiddenError("Insufficient permissions");
      }
    }
    c.set("userId", user.id);
    c.set("user", user);
    await next();
  };
}
__name(auth, "auth");
function internalAuth(secret) {
  return async (c, next) => {
    const authSecret = c.req.header("X-Internal-Secret");
    const expectedSecret = secret || c.env.INTERNAL_SECRET;
    if (!authSecret || authSecret !== expectedSecret) {
      throw authError("Invalid internal authentication");
    }
    await next();
  };
}
__name(internalAuth, "internalAuth");
function getCurrentUser(c) {
  return c.get("user") || null;
}
__name(getCurrentUser, "getCurrentUser");

// src/routes/levelTest.ts
init_errors();

// src/utils/response.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function successResponse(c, data, meta) {
  const response = {
    success: true,
    data,
    meta: {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      requestId: c.get("requestId"),
      ...meta
    }
  };
  return c.json(response, 200);
}
__name(successResponse, "successResponse");
function createdResponse(c, data, location) {
  const response = {
    success: true,
    data,
    meta: {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      requestId: c.get("requestId")
    }
  };
  if (location) {
    c.header("Location", location);
  }
  return c.json(response, 201);
}
__name(createdResponse, "createdResponse");
function noContentResponse(c) {
  return c.body(null, 204);
}
__name(noContentResponse, "noContentResponse");
function paginatedResponse(c, data, pagination) {
  const response = {
    success: true,
    data,
    meta: {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      requestId: c.get("requestId"),
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit)
    }
  };
  return c.json(response, 200);
}
__name(paginatedResponse, "paginatedResponse");
function setCacheHeaders(c, options = {}) {
  const directives = [];
  if (options.noStore) {
    directives.push("no-store");
  } else if (options.noCache) {
    directives.push("no-cache");
  } else {
    if (options.private) {
      directives.push("private");
    } else {
      directives.push("public");
    }
    if (options.maxAge !== void 0) {
      directives.push(`max-age=${options.maxAge}`);
    }
    if (options.sMaxAge !== void 0) {
      directives.push(`s-maxage=${options.sMaxAge}`);
    }
    if (options.mustRevalidate) {
      directives.push("must-revalidate");
    }
  }
  c.header("Cache-Control", directives.join(", "));
}
__name(setCacheHeaders, "setCacheHeaders");
function errorResponse(c, message, code, details, status = 500) {
  const response = {
    success: false,
    error: {
      message,
      code: code || "INTERNAL_ERROR",
      details
    },
    meta: {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      requestId: c.get("requestId")
    }
  };
  return c.json(response, status);
}
__name(errorResponse, "errorResponse");

// src/services/ai.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
async function splitAudioIntoChunks(audioBuffer, chunkSize = 1024 * 1024) {
  const chunks = [];
  for (let i = 0; i < audioBuffer.byteLength; i += chunkSize) {
    const chunk = audioBuffer.slice(i, Math.min(i + chunkSize, audioBuffer.byteLength));
    chunks.push(chunk);
  }
  return chunks;
}
__name(splitAudioIntoChunks, "splitAudioIntoChunks");
async function processAudioChunk(ai, audioChunk, options = {}) {
  try {
    const response = await ai.run("@cf/openai/whisper-large-v3-turbo", {
      audio: [...new Uint8Array(audioChunk)],
      task: options.task || "transcribe",
      language: options.language || "auto",
      vad_filter: options.vad_filter || true,
      initial_prompt: options.initial_prompt,
      prefix: options.prefix
    });
    return response;
  } catch (error3) {
    log3.error("Whisper chunk processing error", error3, { component: "AI_SERVICE" });
    return { text: "[Error transcribing chunk]", word_count: 0 };
  }
}
__name(processAudioChunk, "processAudioChunk");
async function processAudio(ai, audioBuffer, options = {}) {
  try {
    if (audioBuffer.byteLength <= 1024 * 1024) {
      const response = await processAudioChunk(ai, audioBuffer, options);
      return {
        text: response.text || "",
        word_count: response.word_count || 0,
        words: response.words || [],
        chunks: 1
      };
    }
    const chunks = await splitAudioIntoChunks(audioBuffer);
    const results = [];
    let fullTranscript = "";
    let totalWordCount = 0;
    const allWords = [];
    let timeOffset = 0;
    for (const chunk of chunks) {
      const result = await processAudioChunk(ai, chunk, options);
      results.push(result);
      fullTranscript += result.text + " ";
      totalWordCount += result.word_count || 0;
      if (result.words) {
        const adjustedWords = result.words.map((word) => ({
          ...word,
          start: word.start + timeOffset,
          end: word.end + timeOffset
        }));
        allWords.push(...adjustedWords);
        const lastWord = result.words[result.words.length - 1];
        if (lastWord) {
          timeOffset = lastWord.end;
        }
      }
    }
    return {
      text: fullTranscript.trim(),
      word_count: totalWordCount,
      words: allWords,
      chunks: chunks.length
    };
  } catch (error3) {
    log3.error("Whisper processing error", error3, { component: "AI_SERVICE" });
    throw new Error("Failed to process audio with Whisper");
  }
}
__name(processAudio, "processAudio");
async function generateText(ai, prompt, options = {}) {
  try {
    const model = options.model || "@cf/meta/llama-3.2-3b-instruct";
    const response = await ai.run(model, {
      prompt,
      stream: options.stream || false,
      max_tokens: options.max_tokens || 1024,
      temperature: options.temperature || 0.7,
      top_p: options.top_p || 0.9,
      top_k: options.top_k || 40,
      repetition_penalty: options.repetition_penalty || 1.1,
      frequency_penalty: options.frequency_penalty || 0,
      presence_penalty: options.presence_penalty || 0,
      seed: options.seed
    });
    return {
      text: response.response || response,
      model,
      usage: response.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    };
  } catch (error3) {
    log3.error("Text generation error", error3, { component: "AI_SERVICE" });
    throw new Error("Failed to generate text");
  }
}
__name(generateText, "generateText");
function normalizeAiResponseBody(raw2) {
  if (typeof raw2 === "string") {
    return raw2;
  }
  if (Array.isArray(raw2)) {
    return raw2.map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && "text" in part) {
        const textValue = part.text;
        return typeof textValue === "string" ? textValue : JSON.stringify(textValue ?? {});
      }
      return JSON.stringify(part ?? {});
    }).join("");
  }
  if (raw2 && typeof raw2 === "object") {
    if ("text" in raw2) {
      const textValue = raw2.text;
      return typeof textValue === "string" ? textValue : JSON.stringify(textValue ?? {});
    }
    return JSON.stringify(raw2);
  }
  return "";
}
__name(normalizeAiResponseBody, "normalizeAiResponseBody");
function sanitizeJsonResponse(raw2) {
  if (!raw2) return "";
  let text = raw2.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "");
    const closingIndex = text.lastIndexOf("```");
    if (closingIndex !== -1) {
      text = text.slice(0, closingIndex);
    }
    text = text.trim();
  }
  return text;
}
__name(sanitizeJsonResponse, "sanitizeJsonResponse");
async function generateChatCompletion(ai, messages, options = {}) {
  try {
    const model = options.model || "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
    const supportsFunctions = ["llama-3.3-70b-instruct-fp8-fast", "llama-4-scout-17b-16e-instruct"].some(
      (m) => model.includes(m)
    );
    const requestParams = {
      messages,
      stream: options.stream || false,
      max_tokens: options.max_tokens || 1024,
      temperature: options.temperature || 0.7,
      top_p: options.top_p || 0.9,
      top_k: options.top_k || 40,
      repetition_penalty: options.repetition_penalty || 1.1,
      frequency_penalty: options.frequency_penalty || 0,
      presence_penalty: options.presence_penalty || 0,
      seed: options.seed
    };
    if (options.response_format) {
      requestParams.response_format = options.response_format;
    }
    if (options.tools && supportsFunctions) {
      requestParams.tools = options.tools;
    }
    const response = await ai.run(model, requestParams);
    const rawText = response.response ?? response;
    return {
      text: normalizeAiResponseBody(rawText),
      model,
      usage: response.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      },
      tool_calls: response.tool_calls
    };
  } catch (error3) {
    log3.error("Chat completion error", error3, { component: "AI_SERVICE" });
    throw new Error("Failed to generate chat completion");
  }
}
__name(generateChatCompletion, "generateChatCompletion");
async function evaluateLanguageLevel(ai, transcription, question) {
  try {
    const prompt = `Evaluate the following English response for language proficiency.

Question asked: "${question}"
Student's response: "${transcription}"

Evaluate the response across these 6 dimensions and provide a score (0-100) for each:
1. Pronunciation clarity (based on transcription quality)
2. Fluency and flow
3. Grammar accuracy
4. Vocabulary range and appropriateness
5. Coherence and organization
6. Interaction and responsiveness to the question

Also provide:
- Brief feedback on overall performance
- 2-3 specific suggestions for improvement
- Estimated CEFR level (A1-C2)

Respond in JSON format:
{
  "scores": {
    "pronunciation": number,
    "fluency": number,
    "grammar": number,
    "vocabulary": number,
    "coherence": number,
    "interaction": number
  },
  "feedback": "string",
  "suggestions": ["string", "string", "string"],
  "estimatedLevel": "string"
}`;
    const response = await generateChatCompletion(ai, [
      { role: "system", content: "You are an expert English language assessor. Provide fair and constructive evaluations." },
      { role: "user", content: prompt }
    ], {
      temperature: 0.3,
      max_tokens: 600,
      response_format: { type: "json_object" }
    });
    const sanitized = sanitizeJsonResponse(response.text);
    try {
      return JSON.parse(sanitized);
    } catch (parseError) {
      log3.warn("Language evaluation parse error", void 0, {
        component: "AI_SERVICE",
        model: response.model,
        rawPreview: response.text?.slice(0, 500),
        sanitizedPreview: sanitized.slice(0, 500),
        errorMessage: parseError instanceof Error ? parseError.message : String(parseError)
      });
      return {
        scores: {
          pronunciation: 70,
          fluency: 70,
          grammar: 70,
          vocabulary: 70,
          coherence: 70,
          interaction: 70
        },
        feedback: "Good effort in responding to the question.",
        suggestions: ["Practice speaking more fluently", "Expand vocabulary range", "Work on grammar accuracy"],
        estimatedLevel: "B1"
      };
    }
  } catch (error3) {
    log3.error("Language evaluation error", error3, { component: "AI_SERVICE" });
    throw new Error("Failed to evaluate language level");
  }
}
__name(evaluateLanguageLevel, "evaluateLanguageLevel");
async function generateLevelFeedback(ai, analysis, level) {
  try {
    const prompt = `Based on the following language assessment results, provide personalized feedback and learning recommendations.

Level: ${level}
Scores:
- Grammar: ${analysis.grammar}/100
- Vocabulary: ${analysis.vocabulary}/100
- Fluency: ${analysis.fluency}/100
- Pronunciation: ${analysis.pronunciation}/100
- Task Achievement: ${analysis.taskAchievement}/100
- Interaction: ${analysis.interaction}/100

Provide:
1. Overall assessment (2-3 sentences)
2. Strengths (2-3 points)
3. Areas for improvement (2-3 points)
4. Specific study recommendations (3-4 actionable tips)
5. Next steps to reach the next CEFR level

Keep the tone encouraging and constructive. Format in clear sections.`;
    const response = await generateText(ai, prompt, {
      temperature: 0.6,
      max_tokens: 800
    });
    return response.text;
  } catch (error3) {
    log3.error("Feedback generation error", error3, { component: "AI_SERVICE" });
    return "Unable to generate detailed feedback at this time.";
  }
}
__name(generateLevelFeedback, "generateLevelFeedback");
async function translateToMultipleLanguages(ai, text, targetLanguages, sourceLanguage = "auto") {
  try {
    const languageMap = {
      "en": "English",
      "ko": "Korean",
      "ja": "Japanese",
      "zh": "Chinese",
      "es": "Spanish",
      "fr": "French",
      "de": "German",
      "pt": "Portuguese",
      "ru": "Russian",
      "ar": "Arabic"
    };
    const languageList = targetLanguages.map((code) => `${languageMap[code] || code}: [translation]`).join("\n");
    const prompt = `Translate the following text to multiple languages. Provide ONLY the translations in the exact format shown, with no additional text:

${languageList}

Text to translate: "${text}"`;
    const response = await generateChatCompletion(ai, [
      {
        role: "system",
        content: "You are a professional translator. Provide accurate translations in the requested format."
      },
      { role: "user", content: prompt }
    ], {
      temperature: 0.3,
      max_tokens: 1e3
    });
    const translations = {};
    const lines = response.text.trim().split("\n");
    for (const line of lines) {
      const match = line.match(/^(English|Korean|Japanese|Chinese|Spanish|French|German|Portuguese|Russian|Arabic):\s*(.+)$/);
      if (match) {
        const langName = match[1];
        const translation = match[2].trim();
        const langCode = Object.entries(languageMap).find(([code, name]) => name === langName)?.[0];
        if (langCode) {
          translations[langCode] = translation;
        }
      }
    }
    return translations;
  } catch (error3) {
    log3.error("Multi-translation error", error3, { component: "AI_SERVICE" });
    throw new Error("Failed to translate to multiple languages");
  }
}
__name(translateToMultipleLanguages, "translateToMultipleLanguages");

// src/services/storage.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
async function saveToR2(bucket, key, data, contentType, customMetadata) {
  try {
    const httpMetadata = {};
    if (contentType) {
      httpMetadata.contentType = contentType;
    }
    if (contentType?.startsWith("image/")) {
      httpMetadata.cacheControl = "public, max-age=31536000";
    } else if (contentType?.startsWith("audio/")) {
      httpMetadata.cacheControl = "public, max-age=86400";
    } else {
      httpMetadata.cacheControl = "public, max-age=3600";
    }
    const object = await bucket.put(key, data, {
      httpMetadata,
      customMetadata: {
        uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
        ...customMetadata
      }
    });
    return object;
  } catch (error3) {
    console.error("R2 save error:", error3);
    throw new Error(`Failed to save to R2: ${key}`);
  }
}
__name(saveToR2, "saveToR2");
async function getFromR2(bucket, key) {
  try {
    const object = await bucket.get(key);
    return object;
  } catch (error3) {
    console.error("R2 get error:", error3);
    return null;
  }
}
__name(getFromR2, "getFromR2");
async function deleteFromR2(bucket, key) {
  try {
    await bucket.delete(key);
  } catch (error3) {
    console.error("R2 delete error:", error3);
    throw new Error(`Failed to delete from R2: ${key}`);
  }
}
__name(deleteFromR2, "deleteFromR2");
function generateUniqueFileName(originalName, userId) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50);
  return `${userId}/${timestamp}_${random}_${sanitized}.${extension}`;
}
__name(generateUniqueFileName, "generateUniqueFileName");

// src/routes/levelTest.ts
var levelTestRoutes = new Hono2();
var SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;
var HISTORY_TTL_SECONDS = 60 * 60 * 24 * 90;
var MAX_HISTORY_ITEMS = 20;
var SCORE_KEYS = ["pronunciation", "fluency", "grammar", "vocabulary", "coherence", "interaction"];
var optionalAuth = auth({ optional: true });
levelTestRoutes.use("*", optionalAuth);
var TEST_QUESTIONS = [
  {
    id: 1,
    text: "Introduce yourself. Tell me about your name, where you're from, and what you do.",
    korean: "\uC790\uAE30\uC18C\uAC1C\uB97C \uD574\uC8FC\uC138\uC694. \uC774\uB984, \uCD9C\uC2E0\uC9C0, \uD558\uB294 \uC77C\uC5D0 \uB300\uD574 \uB9D0\uC500\uD574\uC8FC\uC138\uC694.",
    duration: 60,
    difficulty: "A1-A2"
  },
  {
    id: 2,
    text: "Describe your typical day. What do you usually do from morning to evening?",
    korean: "\uC77C\uC0C1\uC801\uC778 \uD558\uB8E8\uB97C \uC124\uBA85\uD574\uC8FC\uC138\uC694. \uC544\uCE68\uBD80\uD130 \uC800\uB141\uAE4C\uC9C0 \uBCF4\uD1B5 \uBB34\uC5C7\uC744 \uD558\uB098\uC694?",
    duration: 90,
    difficulty: "A2-B1"
  },
  {
    id: 3,
    text: "Talk about a memorable experience you had recently. What happened and how did you feel?",
    korean: "\uCD5C\uADFC\uC5D0 \uC788\uC5C8\uB358 \uAE30\uC5B5\uC5D0 \uB0A8\uB294 \uACBD\uD5D8\uC5D0 \uB300\uD574 \uC774\uC57C\uAE30\uD574\uC8FC\uC138\uC694. \uBB34\uC2A8 \uC77C\uC774 \uC788\uC5C8\uACE0 \uC5B4\uB5BB\uAC8C \uB290\uAF08\uB098\uC694?",
    duration: 120,
    difficulty: "B1-B2"
  },
  {
    id: 4,
    text: "What are your thoughts on technology's impact on education? Discuss both positive and negative aspects.",
    korean: "\uAE30\uC220\uC774 \uAD50\uC721\uC5D0 \uBBF8\uCE58\uB294 \uC601\uD5A5\uC5D0 \uB300\uD55C \uB2F9\uC2E0\uC758 \uC0DD\uAC01\uC740 \uBB34\uC5C7\uC778\uAC00\uC694? \uAE0D\uC815\uC801\uC778 \uBA74\uACFC \uBD80\uC815\uC801\uC778 \uBA74\uC744 \uBAA8\uB450 \uB17C\uC758\uD574\uC8FC\uC138\uC694.",
    duration: 180,
    difficulty: "B2-C1"
  }
];
function generateTestId() {
  const now = Date.now();
  const random = Math.floor(Math.random() * 1e3);
  return String(now * 1e3 + random);
}
__name(generateTestId, "generateTestId");
function sessionKey(testId) {
  return `level-test:session:${testId}`;
}
__name(sessionKey, "sessionKey");
function userHistoryKey(userId) {
  return `level-test:history:${userId}`;
}
__name(userHistoryKey, "userHistoryKey");
async function loadSession(env2, testId) {
  const raw2 = await env2.CACHE.get(sessionKey(testId));
  if (!raw2) return null;
  try {
    return JSON.parse(raw2);
  } catch (error3) {
    log3.error("Failed to parse level test session", error3, { component: "LEVEL_TEST", testId });
    return null;
  }
}
__name(loadSession, "loadSession");
async function requireSession(env2, testId) {
  const session = await loadSession(env2, testId);
  if (!session) {
    throw new AppError("Level test not found", 404, "LEVEL_TEST_NOT_FOUND");
  }
  return session;
}
__name(requireSession, "requireSession");
function ensureOwnership(session, userId) {
  if (session.userId !== userId) {
    throw new AppError("You do not have access to this test", 403, "LEVEL_TEST_FORBIDDEN");
  }
}
__name(ensureOwnership, "ensureOwnership");
async function saveSession(env2, session) {
  await env2.CACHE.put(sessionKey(session.testId), JSON.stringify(session), {
    expirationTtl: SESSION_TTL_SECONDS
  });
  await updateHistory(env2, session.userId, session);
}
__name(saveSession, "saveSession");
async function updateHistory(env2, userId, session) {
  const key = userHistoryKey(userId);
  const raw2 = await env2.CACHE.get(key);
  let history = [];
  if (raw2) {
    try {
      history = JSON.parse(raw2);
    } catch (error3) {
      history = [];
    }
  }
  const summary = {
    testId: session.testId,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    status: session.status,
    languageCode: session.languageCode,
    testType: session.testType,
    testLevel: session.testLevel,
    overallScore: session.result?.overallScore,
    level: session.result?.level
  };
  history = history.filter((item) => item.testId !== session.testId);
  history.unshift(summary);
  if (history.length > MAX_HISTORY_ITEMS) {
    history = history.slice(0, MAX_HISTORY_ITEMS);
  }
  await env2.CACHE.put(key, JSON.stringify(history), {
    expirationTtl: HISTORY_TTL_SECONDS
  });
}
__name(updateHistory, "updateHistory");
async function getUserHistory(env2, userId) {
  const raw2 = await env2.CACHE.get(userHistoryKey(userId));
  if (!raw2) return [];
  try {
    return JSON.parse(raw2);
  } catch (error3) {
    return [];
  }
}
__name(getUserHistory, "getUserHistory");
function buildAudioKey(session, questionId) {
  return `level-test/${session.userId}/${session.testId}/question-${questionId}.webm`;
}
__name(buildAudioKey, "buildAudioKey");
function buildAudioUrl(testId, questionId) {
  return `/api/v1/level-test/${testId}/audio/${questionId}`;
}
__name(buildAudioUrl, "buildAudioUrl");
function sanitizeSession(session) {
  return {
    testId: Number(session.testId),
    status: session.status,
    languageCode: session.languageCode,
    testType: session.testType,
    testLevel: session.testLevel,
    mode: session.mode,
    startedAt: session.startedAt,
    completedAt: session.completedAt ?? null,
    questions: session.questions,
    answers: session.answers.map((answer) => ({
      questionId: answer.questionId,
      transcription: answer.transcription ?? null,
      submittedAt: answer.submittedAt,
      responseTimeSeconds: answer.responseTimeSeconds ?? null,
      audioUrl: answer.audioKey ? buildAudioUrl(session.testId, answer.questionId) : null,
      evaluation: answer.evaluation ?? null
    })),
    result: session.result ? {
      ...session.result,
      testId: Number(session.result.testId)
    } : null
  };
}
__name(sanitizeSession, "sanitizeSession");
function getUserIdOrThrow(c) {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }
  return userId;
}
__name(getUserIdOrThrow, "getUserIdOrThrow");
function pickScore(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.min(100, value));
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.min(100, parsed));
    }
  }
  return void 0;
}
__name(pickScore, "pickScore");
function upsertAnswer(session, questionId) {
  const existing = session.answers.find((answer2) => answer2.questionId === questionId);
  if (existing) {
    return existing;
  }
  const answer = {
    questionId,
    submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
    responseTimeSeconds: null
  };
  session.answers.push(answer);
  return answer;
}
__name(upsertAnswer, "upsertAnswer");
function resolveQuestion(session, questionId) {
  if (questionId) {
    const question = session.questions.find((item) => item.id === questionId);
    if (!question) {
      throw new AppError("Invalid question id", 400, "LEVEL_TEST_INVALID_QUESTION");
    }
    return question;
  }
  const unanswered = session.questions.find((question) => !session.answers.some((answer) => answer.questionId === question.id));
  if (!unanswered) {
    throw new AppError("All questions already answered", 400, "LEVEL_TEST_COMPLETED");
  }
  return unanswered;
}
__name(resolveQuestion, "resolveQuestion");
function aggregateScores(evaluations) {
  const totals = {
    pronunciation: { sum: 0, count: 0 },
    fluency: { sum: 0, count: 0 },
    grammar: { sum: 0, count: 0 },
    vocabulary: { sum: 0, count: 0 },
    coherence: { sum: 0, count: 0 },
    interaction: { sum: 0, count: 0 }
  };
  for (const evaluation of evaluations) {
    for (const key of SCORE_KEYS) {
      const value = pickScore(evaluation.scores[key]);
      if (value !== void 0) {
        totals[key].sum += value;
        totals[key].count += 1;
      }
    }
  }
  const averages = {
    pronunciation: 0,
    fluency: 0,
    grammar: 0,
    vocabulary: 0,
    coherence: 0,
    interaction: 0
  };
  for (const key of SCORE_KEYS) {
    averages[key] = totals[key].count > 0 ? Math.round(totals[key].sum / totals[key].count) : 0;
  }
  return averages;
}
__name(aggregateScores, "aggregateScores");
function determineLevel(overallScore) {
  if (overallScore >= 85) return "C2";
  if (overallScore >= 75) return "C1";
  if (overallScore >= 65) return "B2";
  if (overallScore >= 55) return "B1";
  if (overallScore >= 45) return "A2";
  return "A1";
}
__name(determineLevel, "determineLevel");
async function evaluateSession(env2, session) {
  const evaluations = [];
  for (const question of session.questions) {
    const answer = session.answers.find((item) => item.questionId === question.id);
    if (!answer?.transcription) {
      continue;
    }
    if (!answer.evaluation) {
      const evaluation = await evaluateLanguageLevel(env2.AI, answer.transcription, question.text);
      const scores = {
        pronunciation: pickScore(evaluation?.scores?.pronunciation) ?? 0,
        fluency: pickScore(evaluation?.scores?.fluency) ?? 0,
        grammar: pickScore(evaluation?.scores?.grammar) ?? 0,
        vocabulary: pickScore(evaluation?.scores?.vocabulary) ?? 0,
        coherence: pickScore(evaluation?.scores?.coherence) ?? 0,
        interaction: pickScore(evaluation?.scores?.interaction) ?? 0
      };
      answer.evaluation = {
        scores,
        feedback: evaluation?.feedback ?? "",
        suggestions: Array.isArray(evaluation?.suggestions) ? evaluation.suggestions.filter(Boolean) : [],
        estimatedLevel: evaluation?.estimatedLevel
      };
    }
    evaluations.push({
      questionId: question.id,
      question: question.text,
      transcription: answer.transcription,
      scores: answer.evaluation.scores,
      feedback: answer.evaluation.feedback,
      suggestions: answer.evaluation.suggestions,
      estimatedLevel: answer.evaluation.estimatedLevel
    });
  }
  if (evaluations.length === 0) {
    throw new AppError("No submissions to evaluate", 400, "LEVEL_TEST_NO_SUBMISSIONS");
  }
  const averages = aggregateScores(evaluations);
  const overallScore = Math.round(
    SCORE_KEYS.reduce((sum, key) => sum + averages[key], 0) / SCORE_KEYS.length
  );
  const level = determineLevel(overallScore);
  const strengths = SCORE_KEYS.filter((key) => averages[key] >= 75).map((key) => key);
  const improvements = SCORE_KEYS.filter((key) => averages[key] <= 55).map((key) => key);
  const suggestions = Array.from(
    new Set(
      evaluations.flatMap((evaluation) => evaluation.suggestions).filter(Boolean)
    )
  ).slice(0, 6);
  const analysis = {
    grammar: averages.grammar,
    vocabulary: averages.vocabulary,
    fluency: averages.fluency,
    pronunciation: averages.pronunciation,
    taskAchievement: averages.coherence,
    interaction: averages.interaction
  };
  const feedbackSummary = await generateLevelFeedback(env2.AI, analysis, level);
  const result = {
    testId: session.testId,
    level,
    estimatedLevel: level,
    overallScore,
    scores: averages,
    strengths,
    improvements,
    suggestions,
    evaluations,
    completedAt: (/* @__PURE__ */ new Date()).toISOString(),
    feedbackSummary
  };
  return result;
}
__name(evaluateSession, "evaluateSession");
async function createSession(c, mode) {
  const env2 = c.env;
  const userId = getUserIdOrThrow(c);
  const body = await c.req.json().catch(() => ({}));
  const languageCode = typeof body?.languageCode === "string" ? body.languageCode : typeof body?.targetLanguage === "string" ? body.targetLanguage : "en";
  const testType = typeof body?.testType === "string" ? body.testType : "SPEAKING";
  const testLevel = typeof body?.testLevel === "string" ? body.testLevel : "INTERMEDIATE";
  const requestedQuestions = Number(body?.totalQuestions) || TEST_QUESTIONS.length;
  const questionCount = Math.min(Math.max(requestedQuestions, 1), TEST_QUESTIONS.length);
  const testId = generateTestId();
  const questions = TEST_QUESTIONS.slice(0, questionCount).map((question, index) => ({
    ...question,
    id: index + 1
  }));
  const session = {
    testId,
    userId,
    languageCode,
    testType,
    testLevel,
    questionCount,
    mode,
    questions,
    answers: [],
    status: "in-progress",
    startedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await saveSession(env2, session);
  return session;
}
__name(createSession, "createSession");
async function handleAudioSubmission(c, session, providedQuestionId) {
  const env2 = c.env;
  const formData = await c.req.formData();
  const audio = formData.get("audio");
  if (!audio) {
    throw new AppError("Audio file missing", 400, "LEVEL_TEST_AUDIO_REQUIRED");
  }
  const questionIdFromForm = formData.get("questionId");
  const questionNumber = providedQuestionId ?? (typeof questionIdFromForm === "string" ? Number.parseInt(questionIdFromForm, 10) : void 0);
  const question = resolveQuestion(session, Number.isFinite(questionNumber) ? Number(questionNumber) : void 0);
  const answer = upsertAnswer(session, question.id);
  const audioBuffer = await audio.arrayBuffer();
  const audioKey = buildAudioKey(session, question.id);
  await saveToR2(env2.STORAGE, audioKey, audioBuffer, audio.type || "audio/webm");
  const transcription = await processAudio(env2.AI, audioBuffer, {
    task: "transcribe",
    language: session.languageCode || "en",
    vad_filter: true,
    initial_prompt: question.text
  });
  answer.audioKey = audioKey;
  answer.audioType = audio.type || "audio/webm";
  answer.transcription = transcription?.text ?? transcription;
  answer.submittedAt = (/* @__PURE__ */ new Date()).toISOString();
  answer.responseTimeSeconds = typeof formData.get("responseTimeSeconds") === "string" ? Number.parseFloat(formData.get("responseTimeSeconds")) : answer.responseTimeSeconds ?? null;
  answer.evaluation = void 0;
  await saveSession(env2, session);
  return {
    testId: Number(session.testId),
    questionId: question.id,
    transcription: answer.transcription,
    audioUrl: buildAudioUrl(session.testId, question.id),
    submittedAt: answer.submittedAt
  };
}
__name(handleAudioSubmission, "handleAudioSubmission");
levelTestRoutes.get("/questions", (c) => {
  return successResponse(c, { questions: TEST_QUESTIONS });
});
levelTestRoutes.post("/start", auth(), async (c) => {
  const session = await createSession(c, "standard");
  return successResponse(c, {
    testId: Number(session.testId),
    languageCode: session.languageCode,
    testType: session.testType,
    testLevel: session.testLevel,
    totalQuestions: session.questionCount,
    questions: session.questions,
    startedAt: session.startedAt
  });
});
levelTestRoutes.post("/restart", auth(), async (c) => {
  const env2 = c.env;
  const userId = getUserIdOrThrow(c);
  const body = await c.req.json().catch(() => ({}));
  const previousTestId = typeof body?.previousTestId === "string" ? body.previousTestId : typeof body?.testId === "string" ? body.testId : void 0;
  if (previousTestId) {
    const previous = await loadSession(env2, previousTestId);
    if (previous && previous.userId === userId && previous.status === "in-progress") {
      previous.status = "cancelled";
      previous.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      await saveSession(env2, previous);
    }
  }
  const session = await createSession(c, "standard");
  return successResponse(c, {
    testId: Number(session.testId),
    languageCode: session.languageCode,
    testType: session.testType,
    testLevel: session.testLevel,
    totalQuestions: session.questionCount,
    questions: session.questions,
    startedAt: session.startedAt
  });
});
levelTestRoutes.post("/voice/start", auth(), async (c) => {
  const session = await createSession(c, "voice");
  return successResponse(c, {
    testId: Number(session.testId),
    languageCode: session.languageCode,
    testType: session.testType,
    testLevel: session.testLevel,
    totalQuestions: session.questionCount,
    questions: session.questions,
    startedAt: session.startedAt
  });
});
levelTestRoutes.post("/voice/:testId/upload", auth(), async (c) => {
  const env2 = c.env;
  const userId = getUserIdOrThrow(c);
  const testId = c.req.param("testId");
  const session = await requireSession(env2, testId);
  ensureOwnership(session, userId);
  if (session.status === "completed") {
    throw new AppError("Test already completed", 400, "LEVEL_TEST_ALREADY_COMPLETED");
  }
  const response = await handleAudioSubmission(c, session, null);
  return successResponse(c, response);
});
levelTestRoutes.post("/voice/transcribe", auth(), async (c) => {
  const userId = getUserIdOrThrow(c);
  const contentType = c.req.header("Content-Type") || "";
  let audioBuffer = null;
  let mimeType = "audio/webm";
  let whisperOptions = {};
  if (contentType.startsWith("multipart/form-data")) {
    const formData = await c.req.formData();
    const audio = formData.get("audio");
    if (!(audio instanceof File)) {
      throw new AppError("audio file is required", 400, "LEVEL_TEST_AUDIO_REQUIRED");
    }
    audioBuffer = await audio.arrayBuffer();
    mimeType = audio.type || mimeType;
    whisperOptions = {
      language: formData.get("language") || void 0,
      task: formData.get("task") || void 0,
      initial_prompt: formData.get("initialPrompt") || void 0,
      prefix: formData.get("prefix") || void 0,
      vad_filter: formData.get("vadFilter") ?? formData.get("vad_filter") ?? void 0
    };
  } else {
    const body = await c.req.json().catch(() => ({}));
    if (typeof body.audio === "string") {
      const cleaned = body.audio.replace(/^data:[^;]+;base64,/, "");
      const binaryString = atob(cleaned);
      const view = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        view[i] = binaryString.charCodeAt(i);
      }
      audioBuffer = view.buffer;
      mimeType = typeof body.mimeType === "string" ? body.mimeType : mimeType;
    }
    whisperOptions = {
      language: typeof body.language === "string" ? body.language : void 0,
      task: typeof body.task === "string" ? body.task : void 0,
      initial_prompt: typeof body.initialPrompt === "string" ? body.initialPrompt : void 0,
      prefix: typeof body.prefix === "string" ? body.prefix : void 0,
      vad_filter: typeof body.vadFilter === "boolean" ? body.vadFilter : void 0
    };
  }
  if (!audioBuffer) {
    throw new AppError("audio payload is required", 400, "LEVEL_TEST_AUDIO_REQUIRED");
  }
  const transcription = await processAudio(c.env.AI, audioBuffer, {
    task: whisperOptions.task || "transcribe",
    language: whisperOptions.language || "auto",
    vad_filter: whisperOptions.vad_filter !== void 0 ? Boolean(whisperOptions.vad_filter) : true,
    initial_prompt: whisperOptions.initial_prompt,
    prefix: whisperOptions.prefix
  });
  return successResponse(c, {
    userId,
    mimeType,
    transcription: transcription.text,
    wordCount: transcription.word_count,
    words: transcription.words ?? [],
    chunks: transcription.chunks
  });
});
levelTestRoutes.post("/voice/:testId/analyze", auth(), async (c) => {
  const env2 = c.env;
  const userId = getUserIdOrThrow(c);
  const testId = c.req.param("testId");
  const session = await requireSession(env2, testId);
  ensureOwnership(session, userId);
  const result = await evaluateSession(env2, session);
  session.result = result;
  session.status = "completed";
  session.completedAt = result.completedAt;
  await saveSession(env2, session);
  return successResponse(c, {
    ...result,
    testId: Number(result.testId)
  });
});
levelTestRoutes.get("/voice/:testId/result", auth(), async (c) => {
  const env2 = c.env;
  const userId = getUserIdOrThrow(c);
  const testId = c.req.param("testId");
  const session = await requireSession(env2, testId);
  ensureOwnership(session, userId);
  if (!session.result) {
    throw new AppError("Result not available yet", 404, "LEVEL_TEST_RESULT_NOT_READY");
  }
  return successResponse(c, {
    ...session.result,
    testId: Number(session.result.testId)
  });
});
levelTestRoutes.post("/submit", auth(), async (c) => {
  const env2 = c.env;
  const userId = getUserIdOrThrow(c);
  const body = await c.req.json().catch(() => ({}));
  const testId = typeof body?.testId === "number" ? String(body.testId) : typeof body?.testId === "string" ? body.testId : void 0;
  const questionNumber = typeof body?.questionNumber === "number" ? body.questionNumber : Number(body?.questionId);
  const userAnswer = typeof body?.userAnswer === "string" ? body.userAnswer.trim() : void 0;
  if (!testId || !questionNumber || !userAnswer) {
    throw new AppError("testId, questionNumber and userAnswer are required", 400, "LEVEL_TEST_INVALID_SUBMISSION");
  }
  const session = await requireSession(env2, testId);
  ensureOwnership(session, userId);
  if (session.status === "completed") {
    throw new AppError("Test already completed", 400, "LEVEL_TEST_ALREADY_COMPLETED");
  }
  const question = resolveQuestion(session, questionNumber);
  const answer = upsertAnswer(session, question.id);
  answer.transcription = userAnswer;
  answer.submittedAt = (/* @__PURE__ */ new Date()).toISOString();
  answer.responseTimeSeconds = typeof body?.responseTimeSeconds === "number" ? body.responseTimeSeconds : answer.responseTimeSeconds ?? null;
  answer.evaluation = void 0;
  await saveSession(env2, session);
  return successResponse(c, {
    testId: Number(session.testId),
    questionId: question.id,
    saved: true
  });
});
levelTestRoutes.post("/:testId/audio-answer", auth(), async (c) => {
  const env2 = c.env;
  const userId = getUserIdOrThrow(c);
  const testId = c.req.param("testId");
  const session = await requireSession(env2, testId);
  ensureOwnership(session, userId);
  if (session.status === "completed") {
    throw new AppError("Test already completed", 400, "LEVEL_TEST_ALREADY_COMPLETED");
  }
  const response = await handleAudioSubmission(c, session);
  return successResponse(c, response);
});
levelTestRoutes.post("/:testId/complete", auth(), async (c) => {
  const env2 = c.env;
  const userId = getUserIdOrThrow(c);
  const testId = c.req.param("testId");
  const session = await requireSession(env2, testId);
  ensureOwnership(session, userId);
  const result = await evaluateSession(env2, session);
  session.result = result;
  session.status = "completed";
  session.completedAt = result.completedAt;
  await saveSession(env2, session);
  return successResponse(c, {
    ...result,
    testId: Number(result.testId)
  });
});
levelTestRoutes.get("/my-tests", auth(), async (c) => {
  const env2 = c.env;
  const userId = getUserIdOrThrow(c);
  const history = await getUserHistory(env2, userId);
  return successResponse(c, history.map((entry) => ({
    ...entry,
    testId: Number(entry.testId)
  })));
});
levelTestRoutes.get("/summary", auth(), async (c) => {
  const env2 = c.env;
  const userId = getUserIdOrThrow(c);
  const history = await getUserHistory(env2, userId);
  if (history.length === 0) {
    return successResponse(c, {
      totalTests: 0,
      completedTests: 0,
      averageScore: null,
      latestLevel: null,
      latestCompletedAt: null
    });
  }
  const completed = history.filter((item) => item.status === "completed" && typeof item.overallScore === "number");
  const averageScore = completed.length > 0 ? Math.round(completed.reduce((sum, item) => sum + (item.overallScore || 0), 0) / completed.length) : null;
  const latestCompleted = completed.sort((a, b) => (b.completedAt ? Date.parse(b.completedAt) : 0) - (a.completedAt ? Date.parse(a.completedAt) : 0))[0];
  return successResponse(c, {
    totalTests: history.length,
    completedTests: completed.length,
    averageScore,
    latestLevel: latestCompleted?.level ?? null,
    latestCompletedAt: latestCompleted?.completedAt ?? null
  });
});
levelTestRoutes.get("/:testId/audio/:questionId", auth(), async (c) => {
  const env2 = c.env;
  const userId = getUserIdOrThrow(c);
  const testId = c.req.param("testId");
  const questionId = Number.parseInt(c.req.param("questionId"), 10);
  const session = await requireSession(env2, testId);
  ensureOwnership(session, userId);
  const answer = session.answers.find((item) => item.questionId === questionId);
  if (!answer?.audioKey) {
    throw new AppError("Audio not found for this question", 404, "LEVEL_TEST_AUDIO_NOT_FOUND");
  }
  const audio = await getFromR2(env2.STORAGE, answer.audioKey);
  if (!audio) {
    throw new AppError("Audio not found", 404, "LEVEL_TEST_AUDIO_NOT_FOUND");
  }
  return new Response(audio.body, {
    headers: {
      "Content-Type": answer.audioType || audio.httpMetadata?.contentType || "audio/webm",
      "Cache-Control": "private, max-age=86400"
    }
  });
});
levelTestRoutes.get("/:testId", auth(), async (c) => {
  const env2 = c.env;
  const userId = getUserIdOrThrow(c);
  const testId = c.req.param("testId");
  const session = await requireSession(env2, testId);
  ensureOwnership(session, userId);
  return successResponse(c, sanitizeSession(session));
});

// src/routes/webrtc.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/utils/activeRooms.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var ACTIVE_ROOMS_CACHE_KEY = "active_rooms";
var DEFAULT_TTL_SECONDS = 3600;
async function readActiveRooms(cache) {
  if (!cache) return [];
  const raw2 = await cache.get(ACTIVE_ROOMS_CACHE_KEY);
  if (!raw2) return [];
  try {
    const parsed = JSON.parse(raw2);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error3) {
    console.error("Failed to parse active rooms cache", error3);
    return [];
  }
}
__name(readActiveRooms, "readActiveRooms");
async function writeActiveRooms(cache, rooms) {
  if (!cache) return;
  await cache.put(
    ACTIVE_ROOMS_CACHE_KEY,
    JSON.stringify(rooms),
    { expirationTtl: DEFAULT_TTL_SECONDS }
  );
}
__name(writeActiveRooms, "writeActiveRooms");
async function getActiveRooms(cache) {
  return readActiveRooms(cache);
}
__name(getActiveRooms, "getActiveRooms");
async function upsertActiveRoom(cache, room) {
  if (!cache) return;
  const rooms = await readActiveRooms(cache);
  const index = rooms.findIndex((item) => item.roomId === room.roomId);
  const nextRoom = {
    ...room,
    updatedAt: room.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
  };
  if (index >= 0) {
    rooms[index] = nextRoom;
  } else {
    rooms.push(nextRoom);
  }
  await writeActiveRooms(cache, rooms);
}
__name(upsertActiveRoom, "upsertActiveRoom");
async function removeActiveRoom(cache, roomId) {
  if (!cache) return;
  const rooms = await readActiveRooms(cache);
  const filtered = rooms.filter((room) => room.roomId !== roomId);
  if (filtered.length === rooms.length) {
    return;
  }
  await writeActiveRooms(cache, filtered);
}
__name(removeActiveRoom, "removeActiveRoom");

// src/routes/webrtc.ts
var webrtcRoutes = new Hono2();
webrtcRoutes.post("/create", auth({ optional: true }), async (c) => {
  const { roomType = "audio", maxParticipants = 4, metadata = {} } = await c.req.json();
  if (!["audio", "video"].includes(roomType)) {
    throw validationError('Invalid room type. Must be "audio" or "video"');
  }
  if (maxParticipants < 2 || maxParticipants > 10) {
    throw validationError("Max participants must be between 2 and 10");
  }
  const roomId = crypto.randomUUID();
  const id = c.env.ROOM.idFromName(roomId);
  const room = c.env.ROOM.get(id);
  const response = await room.fetch(new Request("http://room/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomType, maxParticipants, metadata })
  }));
  if (!response.ok) {
    const error3 = await response.json();
    throw new Error(String(error3?.message) || "Failed to initialize room");
  }
  const data = {
    roomId,
    roomType,
    maxParticipants,
    metadata,
    websocketUrl: `/api/v1/room/${roomId}/ws`,
    joinUrl: `/api/v1/room/${roomId}/join`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await c.env.CACHE.put(
    `room:${roomId}`,
    JSON.stringify(data),
    { expirationTtl: 3600 }
    // 1 hour
  );
  return createdResponse(c, data, `/api/v1/room/${roomId}`);
});
webrtcRoutes.get("/active", async (c) => {
  const rooms = await getActiveRooms(c.env.CACHE);
  return successResponse(c, rooms);
});
webrtcRoutes.post("/:roomId/join", auth({ optional: true }), async (c) => {
  const roomId = c.req.param("roomId");
  const { userId, userName, userMetadata = {} } = await c.req.json();
  if (!userId || !userName) {
    throw validationError("userId and userName are required");
  }
  const cachedRoom = await c.env.CACHE.get(`room:${roomId}`);
  if (!cachedRoom) {
    const id2 = c.env.ROOM.idFromName(roomId);
    const room2 = c.env.ROOM.get(id2);
    const infoResponse = await room2.fetch(new Request("http://room/info"));
    if (!infoResponse.ok) {
      throw notFoundError("Room");
    }
  }
  const id = c.env.ROOM.idFromName(roomId);
  const room = c.env.ROOM.get(id);
  const response = await room.fetch(new Request("http://room/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, userName, userMetadata })
  }));
  if (!response.ok) {
    const error3 = await response.json();
    if (response.status === 409) {
      throw conflictError(String(error3?.message) || "Room is full");
    }
    throw new Error(String(error3?.message) || "Failed to join room");
  }
  const result = await response.json();
  return successResponse(c, {
    ...result || {},
    websocketUrl: `/api/v1/room/${roomId}/ws?userId=${userId}&userName=${encodeURIComponent(userName)}`
  });
});
webrtcRoutes.post("/:roomId/leave", auth({ optional: true }), async (c) => {
  const roomId = c.req.param("roomId");
  const { userId } = await c.req.json();
  if (!userId) {
    throw validationError("userId is required");
  }
  const id = c.env.ROOM.idFromName(roomId);
  const room = c.env.ROOM.get(id);
  const response = await room.fetch(new Request("http://room/leave", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId })
  }));
  if (!response.ok) {
    const error3 = await response.json();
    throw new Error(String(error3?.message) || "Failed to leave room");
  }
  return successResponse(c, await response.json());
});
webrtcRoutes.get("/:roomId/ws", async (c) => {
  const roomId = c.req.param("roomId");
  const userId = c.req.query("userId");
  const userName = c.req.query("userName") || "Anonymous";
  const upgrade = c.req.header("Upgrade");
  if (!upgrade || upgrade !== "websocket") {
    throw validationError("Expected WebSocket upgrade header");
  }
  if (!userId) {
    throw validationError("userId parameter is required");
  }
  const id = c.env.ROOM.idFromName(roomId);
  const room = c.env.ROOM.get(id);
  const wsUrl = `http://room/websocket?userId=${userId}&userName=${encodeURIComponent(userName)}`;
  return room.fetch(new Request(wsUrl, {
    headers: c.req.raw.headers
  }));
});
webrtcRoutes.patch("/:roomId/settings", auth({ optional: true }), async (c) => {
  const roomId = c.req.param("roomId");
  const settings = await c.req.json();
  const id = c.env.ROOM.idFromName(roomId);
  const room = c.env.ROOM.get(id);
  const response = await room.fetch(new Request("http://room/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings)
  }));
  if (!response.ok) {
    const error3 = await response.json();
    throw new Error(String(error3?.message) || "Failed to update settings");
  }
  const cachedRoom = await c.env.CACHE.get(`room:${roomId}`);
  if (cachedRoom) {
    const roomData = JSON.parse(cachedRoom);
    await c.env.CACHE.put(
      `room:${roomId}`,
      JSON.stringify({ ...roomData, ...settings }),
      { expirationTtl: 3600 }
    );
  }
  return successResponse(c, await response.json());
});
webrtcRoutes.get("/:roomId/info", async (c) => {
  const roomId = c.req.param("roomId");
  const cachedRoom = await c.env.CACHE.get(`room:${roomId}`);
  if (cachedRoom) {
    return successResponse(c, JSON.parse(cachedRoom));
  }
  const id = c.env.ROOM.idFromName(roomId);
  const room = c.env.ROOM.get(id);
  const response = await room.fetch(new Request("http://room/info"));
  if (!response.ok) {
    if (response.status === 404) {
      throw notFoundError("Room");
    }
    const error3 = await response.json();
    throw new Error(String(error3?.message) || "Failed to get room info");
  }
  const data = await response.json();
  await c.env.CACHE.put(
    `room:${roomId}`,
    JSON.stringify(data),
    { expirationTtl: 3600 }
  );
  return successResponse(c, data);
});
webrtcRoutes.get("/:roomId/ice-servers", async (c) => {
  const roomId = c.req.param("roomId");
  const id = c.env.ROOM.idFromName(roomId);
  const room = c.env.ROOM.get(id);
  const response = await room.fetch(new Request("http://room/ice-servers"));
  if (!response.ok) {
    const error3 = await response.json();
    throw new Error(String(error3?.message) || "Failed to get ICE servers");
  }
  return successResponse(c, await response.json());
});
webrtcRoutes.get("/:roomId/metrics", auth({ optional: true }), async (c) => {
  const roomId = c.req.param("roomId");
  const id = c.env.ROOM.idFromName(roomId);
  const room = c.env.ROOM.get(id);
  const response = await room.fetch(new Request("http://room/metrics"));
  if (!response.ok) {
    if (response.status === 404) {
      throw notFoundError("Room");
    }
    const error3 = await response.json();
    throw new Error(String(error3?.message) || "Failed to get room metrics");
  }
  const data = await response.json();
  return successResponse(c, {
    ...data || {},
    analytics: {
      uptimeHours: Math.floor((data?.metrics?.sessionDuration || 0) / 3600),
      averageParticipants: (data?.metrics?.totalParticipants || 0) > 0 ? (data?.metrics?.peakParticipants || 0) / Math.max(1, data?.currentParticipants || 0) : 0,
      messagesPerMinute: (data?.metrics?.sessionDuration || 0) > 0 ? (data?.metrics?.messagesExchanged || 0) / ((data?.metrics?.sessionDuration || 0) / 60) : 0
    }
  });
});
webrtcRoutes.post("/:roomId/recording/upload", auth({ optional: true }), async (c) => {
  const roomId = c.req.param("roomId");
  const formData = await c.req.formData();
  const file = formData.get("recording");
  const userId = formData.get("userId");
  const filename = formData.get("filename");
  if (!file || !userId || !filename) {
    throw validationError("recording, userId, and filename are required");
  }
  const timestamp = Date.now();
  const extension = filename.split(".").pop() || "webm";
  const storageKey = `recordings/${roomId}/${userId}/${timestamp}-${filename}`;
  try {
    await c.env.STORAGE.put(storageKey, file.stream(), {
      httpMetadata: {
        contentType: file.type || "video/webm"
      }
    });
    const id = c.env.ROOM.idFromName(roomId);
    const room = c.env.ROOM.get(id);
    await room.fetch(new Request("http://room/websocket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "recording-chunk",
        userId,
        data: {
          filename: storageKey,
          originalFilename: filename,
          size: file.size,
          duration: formData.get("duration") || 0,
          contentType: file.type
        }
      })
    }));
    return successResponse(c, {
      uploadedTo: storageKey,
      size: file.size,
      contentType: file.type,
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error3) {
    console.error("Recording upload error:", error3);
    throw new Error("Failed to upload recording");
  }
});
webrtcRoutes.get("/list", auth({ roles: ["admin"] }), async (c) => {
  return successResponse(c, {
    rooms: [],
    total: 0,
    message: "Room listing requires additional infrastructure setup"
  });
});

// src/routes/upload.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/middleware/security.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function bodySizeLimit(maxSize = 10 * 1024 * 1024) {
  return async (c, next) => {
    const contentLength = c.req.header("Content-Length");
    if (contentLength && parseInt(contentLength) > maxSize) {
      throw new ApiError(413, "PAYLOAD_TOO_LARGE", `Request body too large. Maximum size: ${maxSize} bytes`);
    }
    await next();
  };
}
__name(bodySizeLimit, "bodySizeLimit");

// src/routes/upload.ts
var uploadRoutes = new Hono2();
var FILE_LIMITS = {
  audio: {
    types: ["audio/webm", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a"],
    maxSize: 50 * 1024 * 1024
    // 50MB
  },
  image: {
    types: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
    maxSize: 10 * 1024 * 1024
    // 10MB
  },
  video: {
    types: ["video/mp4", "video/webm", "video/quicktime"],
    maxSize: 100 * 1024 * 1024
    // 100MB
  },
  document: {
    types: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    maxSize: 20 * 1024 * 1024
    // 20MB
  }
};
function validateFile(file, type) {
  const limits = FILE_LIMITS[type];
  if (!limits.types.includes(file.type)) {
    throw validationError(`Invalid file type. Allowed types: ${limits.types.join(", ")}`);
  }
  if (file.size > limits.maxSize) {
    const maxSizeMB = limits.maxSize / (1024 * 1024);
    throw validationError(`File too large. Maximum size: ${maxSizeMB}MB`);
  }
}
__name(validateFile, "validateFile");
function generateFileKey(type, userId, fileName, folder) {
  const timestamp = Date.now();
  const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const parts = [type];
  if (folder) {
    parts.push(folder);
  }
  parts.push(userId, `${timestamp}-${safeFileName}`);
  return parts.join("/");
}
__name(generateFileKey, "generateFileKey");
uploadRoutes.post("/audio", auth(), bodySizeLimit(50 * 1024 * 1024), async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file");
  const folder = formData.get("folder");
  const metadata = formData.get("metadata");
  if (!file) {
    throw validationError("File is required");
  }
  const user = getCurrentUser(c);
  validateFile(file, "audio");
  const buffer = await file.arrayBuffer();
  const key = generateFileKey("audio", user.id, file.name, folder);
  const uploadMetadata = metadata ? JSON.parse(metadata) : {};
  await saveToR2(c.env.STORAGE, key, buffer, file.type, {
    userId: user.id,
    originalName: file.name,
    ...uploadMetadata
  });
  const response = {
    key,
    url: `/api/v1/upload/file/${key}`,
    size: file.size,
    type: file.type,
    metadata: uploadMetadata
  };
  return createdResponse(c, response, response.url);
});
uploadRoutes.post("/image", auth(), bodySizeLimit(10 * 1024 * 1024), async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file");
  const type = formData.get("type");
  const metadata = formData.get("metadata");
  if (!file) {
    throw validationError("File is required");
  }
  const user = getCurrentUser(c);
  validateFile(file, "image");
  const buffer = await file.arrayBuffer();
  const key = generateFileKey("images", user.id, file.name, type || "general");
  const uploadMetadata = metadata ? JSON.parse(metadata) : {};
  await saveToR2(c.env.STORAGE, key, buffer, file.type, {
    userId: user.id,
    originalName: file.name,
    imageType: type,
    ...uploadMetadata
  });
  let variants = {};
  if (type === "profile") {
    variants = {
      thumbnail: `/api/v1/upload/file/${key}?variant=thumbnail`,
      medium: `/api/v1/upload/file/${key}?variant=medium`,
      large: `/api/v1/upload/file/${key}?variant=large`
    };
  }
  const response = {
    key,
    url: `/api/v1/upload/file/${key}`,
    size: file.size,
    type: file.type,
    variants,
    metadata: uploadMetadata
  };
  if (type === "profile") {
    await c.env.CACHE.put(
      `profile-image:${user.id}`,
      JSON.stringify(response),
      { expirationTtl: 86400 }
      // 24 hours
    );
  }
  return createdResponse(c, response, response.url);
});
uploadRoutes.post("/video", auth(), bodySizeLimit(100 * 1024 * 1024), async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file");
  const metadata = formData.get("metadata");
  if (!file) {
    throw validationError("File is required");
  }
  const user = getCurrentUser(c);
  validateFile(file, "video");
  const buffer = await file.arrayBuffer();
  const key = generateFileKey("videos", user.id, file.name);
  const uploadMetadata = metadata ? JSON.parse(metadata) : {};
  await saveToR2(c.env.STORAGE, key, buffer, file.type, {
    userId: user.id,
    originalName: file.name,
    ...uploadMetadata
  });
  const response = {
    key,
    url: `/api/v1/upload/file/${key}`,
    size: file.size,
    type: file.type,
    metadata: uploadMetadata
  };
  return createdResponse(c, response, response.url);
});
uploadRoutes.get("/file/*", async (c) => {
  const path = c.req.path.replace("/api/v1/upload/file/", "");
  const variant = c.req.query("variant");
  const download = c.req.query("download") === "true";
  if (!path) {
    throw validationError("Invalid file path");
  }
  const cacheKey = `file:${path}${variant ? `:${variant}` : ""}`;
  const cached = await c.env.CACHE.get(cacheKey, { type: "stream" });
  if (cached) {
    setCacheHeaders(c, { maxAge: 3600, sMaxAge: 86400 });
    return new Response(cached, {
      headers: c.res.headers
    });
  }
  const file = await getFromR2(c.env.STORAGE, path);
  if (!file) {
    throw notFoundError("File");
  }
  const headers = new Headers();
  headers.set("Content-Type", file.httpMetadata?.contentType || "application/octet-stream");
  if (download || file.httpMetadata?.contentDisposition) {
    const filename = file.customMetadata?.originalName || path.split("/").pop();
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  } else {
    headers.set("Content-Disposition", "inline");
  }
  setCacheHeaders(c, {
    maxAge: 3600,
    // 1 hour browser cache
    sMaxAge: 86400,
    // 24 hours CDN cache
    private: false
  });
  Object.entries(c.res.headers).forEach(([key, value]) => {
    headers.set(key, value);
  });
  if (!download && file.size < 1024 * 1024) {
    await c.env.CACHE.put(
      cacheKey,
      file.body,
      { expirationTtl: 3600 }
    );
  }
  return new Response(file.body, { headers });
});
uploadRoutes.delete("/file/*", auth(), async (c) => {
  const path = c.req.path.replace("/api/v1/upload/file/", "");
  const user = getCurrentUser(c);
  if (!path) {
    throw validationError("Invalid file path");
  }
  const file = await getFromR2(c.env.STORAGE, path);
  if (!file) {
    throw notFoundError("File");
  }
  const fileUserId = file.customMetadata?.userId;
  if (fileUserId !== user.id && user.role !== "admin") {
    throw forbiddenError("You do not have permission to delete this file");
  }
  await deleteFromR2(c.env.STORAGE, path);
  await c.env.CACHE.delete(`file:${path}`);
  if (path.includes("profile")) {
    await c.env.CACHE.delete(`profile-image:${user.id}`);
  }
  return noContentResponse(c);
});
uploadRoutes.post("/presigned-url", auth(), async (c) => {
  const { fileName, fileType, type = "general" } = await c.req.json();
  if (!fileName || !fileType) {
    throw validationError("fileName and fileType are required");
  }
  const user = getCurrentUser(c);
  const key = generateFileKey(type, user.id, fileName);
  try {
    const uploadUrl = `/api/v1/upload/${type}`;
    return successResponse(c, {
      uploadUrl,
      key,
      method: "POST",
      // Worker 엔드포인트는 POST 메서드 사용
      headers: {
        "Content-Type": "multipart/form-data"
      },
      fields: {
        key,
        fileName,
        fileType,
        type
      },
      expiresAt: new Date(Date.now() + 3600 * 1e3).toISOString()
    });
  } catch (error3) {
    console.error("Upload URL generation failed:", error3);
    throw validationError("Failed to generate upload URL");
  }
});

// src/routes/whisper.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var app = new Hono2();
app.use("/*", cors());
app.post("/transcribe", async (c) => {
  try {
    const contentType = c.req.header("content-type");
    let audioBuffer;
    let options = {};
    if (contentType?.includes("multipart/form-data")) {
      const formData = await c.req.formData();
      const audioFile = formData.get("audio");
      if (!audioFile) {
        return c.json({ error: "No audio file provided" }, 400);
      }
      audioBuffer = await audioFile.arrayBuffer();
      const task = formData.get("task");
      const language = formData.get("language");
      const vadFilter = formData.get("vad_filter");
      const initialPrompt = formData.get("initial_prompt");
      const prefix = formData.get("prefix");
      options = {
        task: task || "transcribe",
        language: language || "auto",
        vad_filter: vadFilter === "true",
        initial_prompt: initialPrompt,
        prefix
      };
    } else if (contentType?.includes("application/json")) {
      const body = await c.req.json();
      if (!body.audio) {
        return c.json({ error: "No audio data provided" }, 400);
      }
      const binaryString = atob(body.audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      audioBuffer = bytes.buffer;
      options = body.options || {};
    } else {
      audioBuffer = await c.req.arrayBuffer();
    }
    if (audioBuffer.byteLength > 25 * 1024 * 1024) {
      return c.json({ error: "Audio file too large. Maximum size is 25MB" }, 400);
    }
    const result = await processAudio(c.env.AI, audioBuffer, options);
    return c.json({
      success: true,
      transcription: result.text,
      word_count: result.word_count,
      words: result.words,
      chunks_processed: result.chunks,
      language: options.language || "auto",
      task: options.task || "transcribe"
    });
  } catch (error3) {
    log3.error("Transcription error", error3, { component: "WHISPER_SERVICE" });
    return c.json({
      error: "Transcription failed",
      message: error3 instanceof Error ? error3.message : "Unknown error"
    }, 500);
  }
});
app.get("/languages", (c) => {
  return c.json({
    supported_languages: [
      { code: "auto", name: "Auto-detect" },
      { code: "en", name: "English" },
      { code: "zh", name: "Chinese" },
      { code: "de", name: "German" },
      { code: "es", name: "Spanish" },
      { code: "ru", name: "Russian" },
      { code: "ko", name: "Korean" },
      { code: "fr", name: "French" },
      { code: "ja", name: "Japanese" },
      { code: "pt", name: "Portuguese" },
      { code: "tr", name: "Turkish" },
      { code: "pl", name: "Polish" },
      { code: "ca", name: "Catalan" },
      { code: "nl", name: "Dutch" },
      { code: "ar", name: "Arabic" },
      { code: "sv", name: "Swedish" },
      { code: "it", name: "Italian" },
      { code: "id", name: "Indonesian" },
      { code: "hi", name: "Hindi" },
      { code: "fi", name: "Finnish" },
      { code: "vi", name: "Vietnamese" },
      { code: "he", name: "Hebrew" },
      { code: "uk", name: "Ukrainian" },
      { code: "el", name: "Greek" },
      { code: "ms", name: "Malay" },
      { code: "cs", name: "Czech" },
      { code: "ro", name: "Romanian" },
      { code: "da", name: "Danish" },
      { code: "hu", name: "Hungarian" },
      { code: "ta", name: "Tamil" },
      { code: "no", name: "Norwegian" },
      { code: "th", name: "Thai" },
      { code: "ur", name: "Urdu" },
      { code: "hr", name: "Croatian" },
      { code: "bg", name: "Bulgarian" },
      { code: "lt", name: "Lithuanian" },
      { code: "la", name: "Latin" },
      { code: "mi", name: "Maori" },
      { code: "ml", name: "Malayalam" },
      { code: "cy", name: "Welsh" },
      { code: "sk", name: "Slovak" },
      { code: "te", name: "Telugu" },
      { code: "fa", name: "Persian" },
      { code: "lv", name: "Latvian" },
      { code: "bn", name: "Bengali" },
      { code: "sr", name: "Serbian" },
      { code: "az", name: "Azerbaijani" },
      { code: "sl", name: "Slovenian" },
      { code: "kn", name: "Kannada" },
      { code: "et", name: "Estonian" },
      { code: "mk", name: "Macedonian" },
      { code: "br", name: "Breton" },
      { code: "eu", name: "Basque" },
      { code: "is", name: "Icelandic" },
      { code: "hy", name: "Armenian" },
      { code: "ne", name: "Nepali" },
      { code: "mn", name: "Mongolian" },
      { code: "bs", name: "Bosnian" },
      { code: "kk", name: "Kazakh" },
      { code: "sq", name: "Albanian" },
      { code: "sw", name: "Swahili" },
      { code: "gl", name: "Galician" },
      { code: "mr", name: "Marathi" },
      { code: "pa", name: "Punjabi" },
      { code: "si", name: "Sinhala" },
      { code: "km", name: "Khmer" },
      { code: "sn", name: "Shona" },
      { code: "yo", name: "Yoruba" },
      { code: "so", name: "Somali" },
      { code: "af", name: "Afrikaans" },
      { code: "oc", name: "Occitan" },
      { code: "ka", name: "Georgian" },
      { code: "be", name: "Belarusian" },
      { code: "tg", name: "Tajik" },
      { code: "sd", name: "Sindhi" },
      { code: "gu", name: "Gujarati" },
      { code: "am", name: "Amharic" },
      { code: "yi", name: "Yiddish" },
      { code: "lo", name: "Lao" },
      { code: "uz", name: "Uzbek" },
      { code: "fo", name: "Faroese" },
      { code: "ht", name: "Haitian creole" },
      { code: "ps", name: "Pashto" },
      { code: "tk", name: "Turkmen" },
      { code: "nn", name: "Nynorsk" },
      { code: "mt", name: "Maltese" },
      { code: "sa", name: "Sanskrit" },
      { code: "lb", name: "Luxembourgish" },
      { code: "my", name: "Myanmar" },
      { code: "bo", name: "Tibetan" },
      { code: "tl", name: "Tagalog" },
      { code: "mg", name: "Malagasy" },
      { code: "as", name: "Assamese" },
      { code: "tt", name: "Tatar" },
      { code: "haw", name: "Hawaiian" },
      { code: "ln", name: "Lingala" },
      { code: "ha", name: "Hausa" },
      { code: "ba", name: "Bashkir" },
      { code: "jw", name: "Javanese" },
      { code: "su", name: "Sundanese" }
    ]
  });
});
app.get("/models", (c) => {
  return c.json({
    available_models: [
      {
        id: "@cf/openai/whisper",
        name: "Whisper",
        description: "General-purpose speech recognition model",
        languages: "Multilingual",
        max_duration: "30 minutes",
        pricing: "$0.00045 per audio minute"
      },
      {
        id: "@cf/openai/whisper-large-v3-turbo",
        name: "Whisper Large v3 Turbo",
        description: "Large model optimized for speed and accuracy",
        languages: "Multilingual",
        max_duration: "30 minutes",
        pricing: "$0.00045 per audio minute",
        recommended: true
      },
      {
        id: "@cf/openai/whisper-tiny-en",
        name: "Whisper Tiny (English)",
        description: "Small model for English-only transcription",
        languages: "English only",
        max_duration: "30 minutes",
        pricing: "$0.00045 per audio minute",
        beta: true
      }
    ]
  });
});
var whisper_default = app;

// src/routes/llm.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var app2 = new Hono2();
app2.use("/*", cors());
app2.post("/generate", async (c) => {
  try {
    const body = await c.req.json();
    const model = body.model || "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
    let messages;
    if (body.messages) {
      messages = body.messages;
    } else if (body.prompt) {
      messages = [
        { role: "system", content: body.system || "You are a helpful assistant." },
        { role: "user", content: body.prompt }
      ];
    } else {
      return c.json({ error: "Either prompt or messages required" }, 400);
    }
    const ai = c.env.AI;
    if (body.stream) {
      const stream = await ai.run(model, {
        messages,
        stream: true,
        temperature: body.temperature || 0.7,
        max_tokens: body.max_tokens || 1e3
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    }
    const response = await ai.run(model, {
      messages,
      temperature: body.temperature || 0.7,
      max_tokens: body.max_tokens || 1e3
    });
    return successResponse(c, {
      response: response.response,
      usage: response.usage,
      model
    });
  } catch (error3) {
    console.error("LLM generation error:", error3);
    return c.json({ error: error3.message || "Text generation failed" }, 500);
  }
});
app2.post("/evaluate-english", async (c) => {
  try {
    const { text, context: context2 } = await c.req.json();
    if (!text) {
      return c.json({ error: "Text is required" }, 400);
    }
    const prompt = `You are an expert English language assessor. Evaluate the following English text for language proficiency.

${context2 ? `Context: ${context2}
` : ""}
Text to evaluate: "${text}"

Provide a detailed assessment with scores (0-100) for each of these 6 areas:
1. Grammar accuracy
2. Vocabulary range and appropriateness
3. Fluency and coherence
4. Pronunciation clarity (based on transcription quality if applicable)
5. Task achievement / Content relevance
6. Interaction skills / Communication effectiveness

Also determine the CEFR level (A1, A2, B1, B2, C1, or C2) based on the overall proficiency.

Response in JSON format with this structure:
{
  "scores": {
    "grammar": <0-100>,
    "vocabulary": <0-100>,
    "fluency": <0-100>,
    "pronunciation": <0-100>,
    "taskAchievement": <0-100>,
    "interaction": <0-100>
  },
  "averageScore": <0-100>,
  "cefrLevel": "<A1-C2>",
  "feedback": {
    "strengths": ["point 1", "point 2"],
    "improvements": ["point 1", "point 2"],
    "suggestions": ["suggestion 1", "suggestion 2"]
  },
  "detailedAnalysis": {
    "grammar": "Detailed grammar analysis...",
    "vocabulary": "Detailed vocabulary analysis...",
    "fluency": "Detailed fluency analysis...",
    "pronunciation": "Detailed pronunciation analysis...",
    "taskAchievement": "Detailed task achievement analysis...",
    "interaction": "Detailed interaction analysis..."
  }
}`;
    const ai = c.env.AI;
    const response = await ai.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages: [
        {
          role: "system",
          content: "You are a professional English language assessment expert. Always respond with valid JSON."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2e3
    });
    try {
      const evaluation = JSON.parse(response.response);
      return successResponse(c, {
        evaluation,
        evaluatedText: text
      });
    } catch (parseError) {
      return successResponse(c, {
        evaluation: {
          textResponse: response.response,
          scores: {
            grammar: 70,
            vocabulary: 70,
            fluency: 70,
            pronunciation: 70,
            taskAchievement: 70,
            interaction: 70
          },
          averageScore: 70,
          cefrLevel: "B1"
        },
        evaluatedText: text
      });
    }
  } catch (error3) {
    console.error("English evaluation error:", error3);
    return c.json({ error: error3.message || "Evaluation failed" }, 500);
  }
});
app2.post("/check-grammar", async (c) => {
  try {
    const { text } = await c.req.json();
    if (!text) {
      return c.json({ error: "Text is required" }, 400);
    }
    const prompt = `Check the grammar of the following text and provide corrections:

Text: "${text}"

Provide a response in JSON format:
{
  "hasErrors": boolean,
  "correctedText": "the corrected version of the text",
  "errors": [
    {
      "type": "grammar/spelling/punctuation",
      "original": "original text",
      "correction": "corrected text",
      "explanation": "why this is wrong and how to fix it"
    }
  ],
  "suggestions": ["general writing improvement suggestions"]
}`;
    const ai = c.env.AI;
    const response = await ai.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages: [
        {
          role: "system",
          content: "You are a grammar expert. Always respond with valid JSON."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1500
    });
    try {
      const result = JSON.parse(response.response);
      return successResponse(c, result);
    } catch (parseError) {
      return c.json({
        error: "Failed to parse grammar check response",
        rawResponse: response.response
      }, 400);
    }
  } catch (error3) {
    console.error("Grammar check error:", error3);
    return c.json({ error: error3.message || "Grammar check failed" }, 500);
  }
});
app2.post("/conversation-feedback", async (c) => {
  try {
    const { conversation, topic, level } = await c.req.json();
    if (!conversation || conversation.length === 0) {
      return c.json({ error: "Conversation is required" }, 400);
    }
    const conversationText = conversation.map((turn) => `${turn.speaker}: ${turn.text}`).join("\n");
    const prompt = `Analyze this English conversation and provide detailed feedback:

${topic ? `Topic: ${topic}` : ""}
${level ? `Expected Level: ${level}` : ""}

Conversation:
${conversationText}

Provide comprehensive feedback in JSON format:
{
  "overallAssessment": "general assessment of the conversation",
  "participantFeedback": {
    "<speaker_name>": {
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "languageUse": "assessment of grammar, vocabulary, fluency",
      "communicationSkills": "assessment of interaction, turn-taking, etc."
    }
  },
  "suggestions": {
    "vocabulary": ["useful words/phrases for this topic"],
    "expressions": ["natural expressions to use"],
    "grammar": ["grammar points to focus on"]
  },
  "nextSteps": ["recommendation 1", "recommendation 2"]
}`;
    const ai = c.env.AI;
    const response = await ai.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages: [
        {
          role: "system",
          content: "You are an experienced English conversation coach. Always respond with valid JSON."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 2e3
    });
    try {
      const feedback = JSON.parse(response.response);
      return successResponse(c, {
        feedback,
        conversationLength: conversation.length,
        topic,
        level
      });
    } catch (parseError) {
      return successResponse(c, {
        feedback: {
          textResponse: response.response
        },
        conversationLength: conversation.length,
        topic,
        level
      });
    }
  } catch (error3) {
    console.error("Conversation feedback error:", error3);
    return c.json({ error: error3.message || "Feedback generation failed" }, 500);
  }
});
app2.get("/models", (c) => {
  return successResponse(c, {
    available_models: [
      {
        id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
        name: "Llama 3.3 70B Instruct",
        description: "Fast 70B parameter model optimized for instruction following",
        context_window: 24e3,
        recommended: true
      },
      {
        id: "@cf/meta/llama-3-8b-instruct",
        name: "Llama 3 8B Instruct",
        description: "Smaller, faster model for general tasks",
        context_window: 8192
      },
      {
        id: "@cf/microsoft/phi-2",
        name: "Phi-2",
        description: "Small but capable model from Microsoft",
        context_window: 2048
      },
      {
        id: "@cf/qwen/qwen1.5-14b-chat-awq",
        name: "Qwen 1.5 14B",
        description: "Multilingual model with strong performance",
        context_window: 32768
      }
    ],
    features: [
      "Text generation",
      "English evaluation",
      "Grammar checking",
      "Conversation feedback",
      "Streaming support"
    ]
  });
});
var llm_default = app2;

// src/routes/images.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var app3 = new Hono2();
app3.use("/*", cors());
app3.post("/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("image");
    if (!file) {
      return c.json({ error: "No image file provided" }, 400);
    }
    const userId = formData.get("userId");
    const type = formData.get("type") || "profile";
    if (!file || !userId) {
      return c.json({ error: "Image file and userId are required" }, 400);
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed" }, 400);
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return c.json({ error: "File size exceeds 10MB limit" }, 400);
    }
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const fileName = `${type}/${userId}/${timestamp}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    await c.env.STORAGE.put(fileName, arrayBuffer, {
      httpMetadata: {
        contentType: file.type
      },
      customMetadata: {
        userId,
        type,
        originalName: file.name,
        uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
    const baseUrl = `https://${c.req.header("host")}`;
    const variants = {
      original: `${baseUrl}/api/v1/images/serve/${fileName}`,
      thumbnail: `${baseUrl}/api/v1/images/transform/${fileName}?width=150&height=150&fit=cover`,
      medium: `${baseUrl}/api/v1/images/transform/${fileName}?width=400&height=400&fit=contain`,
      large: `${baseUrl}/api/v1/images/transform/${fileName}?width=800&height=800&fit=contain`
    };
    await c.env.CACHE.put(
      `image:${fileName}`,
      JSON.stringify({
        fileName,
        userId,
        type,
        originalName: file.name,
        size: file.size,
        contentType: file.type,
        uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
        variants
      }),
      { expirationTtl: 86400 * 30 }
      // 30일 캐시
    );
    return c.json({
      success: true,
      fileName,
      variants,
      size: file.size,
      type: file.type
    });
  } catch (error3) {
    console.error("Image upload error:", error3);
    return c.json({ error: error3.message || "Failed to upload image" }, 500);
  }
});
app3.get("/transform/*", async (c) => {
  try {
    const path = c.req.param("*");
    if (!path) {
      return c.json({ error: "Image path is required" }, 400);
    }
    const { searchParams } = new URL(c.req.url);
    const width = parseInt(searchParams.get("width") || "0");
    const height = parseInt(searchParams.get("height") || "0");
    const quality = parseInt(searchParams.get("quality") || "85");
    const fit = searchParams.get("fit") || "contain";
    const format = searchParams.get("format") || "auto";
    const object = await c.env.STORAGE.get(path);
    if (!object) {
      return c.json({ error: "Image not found" }, 404);
    }
    const cacheKey = `transformed:${path}:w${width}:h${height}:q${quality}:${fit}:${format}`;
    const cached = await c.env.CACHE.get(cacheKey, { type: "arrayBuffer" });
    if (cached) {
      return new Response(cached, {
        headers: {
          "Content-Type": format === "auto" ? "image/webp" : `image/${format}`,
          "Cache-Control": "public, max-age=31536000",
          "X-Cache": "HIT"
        }
      });
    }
    const imageBuffer = await object.arrayBuffer();
    let transformedBuffer = imageBuffer;
    let contentType = object.httpMetadata?.contentType || "image/jpeg";
    if (format !== "auto" && format !== object.httpMetadata?.contentType?.split("/")[1]) {
      contentType = `image/${format}`;
    } else if (format === "auto") {
      contentType = "image/webp";
    }
    return new Response(transformedBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
        "X-Cache": "HIT",
        "X-Image-Format": format || "original"
      }
    });
  } catch (error3) {
    console.error("Image transform error:", error3);
    return c.json({ error: error3.message || "Failed to transform image" }, 500);
  }
});
app3.get("/serve/*", async (c) => {
  try {
    const path = c.req.param("*");
    if (!path) {
      return c.json({ error: "Image path is required" }, 400);
    }
    const object = await c.env.STORAGE.get(path);
    if (!object) {
      return c.json({ error: "Image not found" }, 404);
    }
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("Cache-Control", "public, max-age=31536000");
    headers.set("Content-Security-Policy", "default-src 'none'; img-src 'self';");
    headers.set("X-Content-Type-Options", "nosniff");
    return new Response(object.body, { headers });
  } catch (error3) {
    console.error("Image serve error:", error3);
    return c.json({ error: error3.message || "Failed to serve image" }, 500);
  }
});
app3.delete("/:fileName", async (c) => {
  try {
    const fileName = c.req.param("fileName");
    const userId = c.req.header("x-user-id");
    if (!fileName || !userId) {
      return c.json({ error: "fileName and userId are required" }, 400);
    }
    const metadata = await c.env.CACHE.get(`image:${fileName}`, { type: "json" });
    if (!metadata || metadata.userId !== userId) {
      return c.json({ error: "Unauthorized" }, 403);
    }
    await c.env.STORAGE.delete(fileName);
    await c.env.CACHE.delete(`image:${fileName}`);
    return c.json({
      success: true,
      message: "Image deleted successfully"
    });
  } catch (error3) {
    console.error("Image delete error:", error3);
    return c.json({ error: error3.message || "Failed to delete image" }, 500);
  }
});
app3.get("/list/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const type = c.req.query("type");
    if (!userId) {
      return c.json({ error: "userId is required" }, 400);
    }
    const prefix = type ? `${type}/${userId}/` : userId;
    const list = await c.env.STORAGE.list({ prefix, limit: 1e3 });
    const images = await Promise.all(
      list.objects.map(async (obj) => {
        const metadata = await c.env.CACHE.get(`image:${obj.key}`, { type: "json" });
        return {
          key: obj.key,
          size: obj.size,
          uploadedAt: obj.uploaded.toISOString(),
          metadata: metadata || {
            fileName: obj.key,
            contentType: obj.httpMetadata?.contentType
          }
        };
      })
    );
    return c.json({
      success: true,
      images,
      count: images.length
    });
  } catch (error3) {
    console.error("Image list error:", error3);
    return c.json({ error: error3.message || "Failed to list images" }, 500);
  }
});
app3.get("/info/:fileName", async (c) => {
  try {
    const fileName = c.req.param("fileName");
    if (!fileName) {
      return c.json({ error: "fileName is required" }, 400);
    }
    const metadata = await c.env.CACHE.get(`image:${fileName}`, { type: "json" });
    if (!metadata) {
      const object = await c.env.STORAGE.head(fileName);
      if (!object) {
        return c.json({ error: "Image not found" }, 404);
      }
      return c.json({
        fileName,
        size: object.size,
        uploadedAt: object.uploaded.toISOString(),
        contentType: object.httpMetadata?.contentType,
        customMetadata: object.customMetadata
      });
    }
    return c.json(metadata);
  } catch (error3) {
    console.error("Image info error:", error3);
    return c.json({ error: error3.message || "Failed to get image info" }, 500);
  }
});
var images_default = app3;

// src/routes/transcribe.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/zod/lib/index.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var util;
(function(util2) {
  util2.assertEqual = (val) => val;
  function assertIs(_arg) {
  }
  __name(assertIs, "assertIs");
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  __name(assertNever, "assertNever");
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  __name(joinValues, "joinValues");
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = /* @__PURE__ */ __name((data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
}, "getParsedType");
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = /* @__PURE__ */ __name((obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
}, "quotelessJson");
var ZodError = class extends Error {
  static {
    __name(this, "ZodError");
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  get errors() {
    return this.issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = /* @__PURE__ */ __name((error3) => {
      for (const issue of error3.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    }, "processError");
    processError(this);
    return fieldErrors;
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
        fieldErrors[sub.path[0]].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error3 = new ZodError(issues);
  return error3;
};
var errorMap = /* @__PURE__ */ __name((issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
}, "errorMap");
var overrideErrorMap = errorMap;
function setErrorMap(map) {
  overrideErrorMap = map;
}
__name(setErrorMap, "setErrorMap");
function getErrorMap() {
  return overrideErrorMap;
}
__name(getErrorMap, "getErrorMap");
var makeIssue = /* @__PURE__ */ __name((params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: issueData.message || errorMessage
  };
}, "makeIssue");
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      ctx.schemaErrorMap,
      getErrorMap(),
      errorMap
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
__name(addIssueToContext, "addIssueToContext");
var ParseStatus = class _ParseStatus {
  static {
    __name(this, "ParseStatus");
  }
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      syncPairs.push({
        key: await pair.key,
        value: await pair.value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = /* @__PURE__ */ __name((value) => ({ status: "dirty", value }), "DIRTY");
var OK = /* @__PURE__ */ __name((value) => ({ status: "valid", value }), "OK");
var isAborted = /* @__PURE__ */ __name((x) => x.status === "aborted", "isAborted");
var isDirty = /* @__PURE__ */ __name((x) => x.status === "dirty", "isDirty");
var isValid = /* @__PURE__ */ __name((x) => x.status === "valid", "isValid");
var isAsync = /* @__PURE__ */ __name((x) => typeof Promise !== "undefined" && x instanceof Promise, "isAsync");
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message === null || message === void 0 ? void 0 : message.message;
})(errorUtil || (errorUtil = {}));
var ParseInputLazyPath = class {
  static {
    __name(this, "ParseInputLazyPath");
  }
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (this._key instanceof Array) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = /* @__PURE__ */ __name((ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error3 = new ZodError(ctx.common.issues);
        this._error = error3;
        return this._error;
      }
    };
  }
}, "handleResult");
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = /* @__PURE__ */ __name((iss, ctx) => {
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    if (typeof ctx.data === "undefined") {
      return { message: required_error !== null && required_error !== void 0 ? required_error : ctx.defaultError };
    }
    return { message: invalid_type_error !== null && invalid_type_error !== void 0 ? invalid_type_error : ctx.defaultError };
  }, "customMap");
  return { errorMap: customMap, description };
}
__name(processCreateParams, "processCreateParams");
var ZodType = class {
  static {
    __name(this, "ZodType");
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
  }
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    var _a;
    const ctx = {
      common: {
        issues: [],
        async: (_a = params === null || params === void 0 ? void 0 : params.async) !== null && _a !== void 0 ? _a : false,
        contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap
      },
      path: (params === null || params === void 0 ? void 0 : params.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
        async: true
      },
      path: (params === null || params === void 0 ? void 0 : params.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = /* @__PURE__ */ __name((val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    }, "getIssueProperties");
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = /* @__PURE__ */ __name(() => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      }), "setError");
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this, this._def);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[a-z][a-z0-9]*$/;
var ulidRegex = /[0-9A-HJKMNP-TV-Z]{26}/;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_+-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var emojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Component})+$/u;
var ipv4Regex = /^(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))$/;
var ipv6Regex = /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/;
var datetimeRegex = /* @__PURE__ */ __name((args) => {
  if (args.precision) {
    if (args.offset) {
      return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
    } else {
      return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}Z$`);
    }
  } else if (args.precision === 0) {
    if (args.offset) {
      return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
    } else {
      return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$`);
    }
  } else {
    if (args.offset) {
      return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
    } else {
      return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z$`);
    }
  }
}, "datetimeRegex");
function isValidIP(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
__name(isValidIP, "isValidIP");
var ZodString = class _ZodString extends ZodType {
  static {
    __name(this, "ZodString");
  }
  constructor() {
    super(...arguments);
    this._regex = (regex, validation, message) => this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
    this.nonempty = (message) => this.min(1, errorUtil.errToObj(message));
    this.trim = () => new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
    this.toLowerCase = () => new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
    this.toUpperCase = () => new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(
        ctx2,
        {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.string,
          received: ctx2.parsedType
        }
        //
      );
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch (_a) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    var _a;
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof (options === null || options === void 0 ? void 0 : options.precision) === "undefined" ? null : options === null || options === void 0 ? void 0 : options.precision,
      offset: (_a = options === null || options === void 0 ? void 0 : options.offset) !== null && _a !== void 0 ? _a : false,
      ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
    });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options === null || options === void 0 ? void 0 : options.position,
      ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  var _a;
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / Math.pow(10, decCount);
}
__name(floatSafeRemainder, "floatSafeRemainder");
var ZodNumber = class _ZodNumber extends ZodType {
  static {
    __name(this, "ZodNumber");
  }
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null, min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  static {
    __name(this, "ZodBigInt");
  }
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = BigInt(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.bigint,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  var _a;
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  static {
    __name(this, "ZodBoolean");
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  static {
    __name(this, "ZodDate");
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  static {
    __name(this, "ZodSymbol");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  static {
    __name(this, "ZodUndefined");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  static {
    __name(this, "ZodNull");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  static {
    __name(this, "ZodAny");
  }
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  static {
    __name(this, "ZodUnknown");
  }
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  static {
    __name(this, "ZodNever");
  }
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  static {
    __name(this, "ZodVoid");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  static {
    __name(this, "ZodArray");
  }
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: /* @__PURE__ */ __name(() => newShape, "shape")
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
__name(deepPartialify, "deepPartialify");
var ZodObject = class _ZodObject extends ZodType {
  static {
    __name(this, "ZodObject");
  }
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    return this._cached = { shape, keys };
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") ;
      else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          syncPairs.push({
            key,
            value: await pair.value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: /* @__PURE__ */ __name((issue, ctx) => {
          var _a, _b, _c, _d;
          const defaultError = (_c = (_b = (_a = this._def).errorMap) === null || _b === void 0 ? void 0 : _b.call(_a, issue, ctx).message) !== null && _c !== void 0 ? _c : ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: (_d = errorUtil.errToObj(message).message) !== null && _d !== void 0 ? _d : defaultError
            };
          return {
            message: defaultError
          };
        }, "errorMap")
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => ({
        ...this._def.shape(),
        ...augmentation
      }), "shape")
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: /* @__PURE__ */ __name(() => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }), "shape"),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    util.objectKeys(mask).forEach((key) => {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    });
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => shape, "shape")
    });
  }
  omit(mask) {
    const shape = {};
    util.objectKeys(this.shape).forEach((key) => {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    });
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => shape, "shape")
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    util.objectKeys(this.shape).forEach((key) => {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    });
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => newShape, "shape")
    });
  }
  required(mask) {
    const newShape = {};
    util.objectKeys(this.shape).forEach((key) => {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    });
    return new _ZodObject({
      ...this._def,
      shape: /* @__PURE__ */ __name(() => newShape, "shape")
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: /* @__PURE__ */ __name(() => shape, "shape"),
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: /* @__PURE__ */ __name(() => shape, "shape"),
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  static {
    __name(this, "ZodUnion");
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    __name(handleResults, "handleResults");
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = /* @__PURE__ */ __name((type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return Object.keys(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else {
    return null;
  }
}, "getDiscriminator");
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  static {
    __name(this, "ZodDiscriminatedUnion");
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
__name(mergeValues, "mergeValues");
var ZodIntersection = class extends ZodType {
  static {
    __name(this, "ZodIntersection");
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = /* @__PURE__ */ __name((parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    }, "handleParsed");
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  static {
    __name(this, "ZodTuple");
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  static {
    __name(this, "ZodRecord");
  }
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key))
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  static {
    __name(this, "ZodMap");
  }
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  static {
    __name(this, "ZodSet");
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    __name(finalizeSet, "finalizeSet");
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  static {
    __name(this, "ZodFunction");
  }
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error3) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          ctx.schemaErrorMap,
          getErrorMap(),
          errorMap
        ].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error3
        }
      });
    }
    __name(makeArgsIssue, "makeArgsIssue");
    function makeReturnsIssue(returns, error3) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          ctx.schemaErrorMap,
          getErrorMap(),
          errorMap
        ].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error3
        }
      });
    }
    __name(makeReturnsIssue, "makeReturnsIssue");
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error3 = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error3.addIssue(makeArgsIssue(args, e));
          throw error3;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error3.addIssue(makeReturnsIssue(result, e));
          throw error3;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  static {
    __name(this, "ZodLazy");
  }
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  static {
    __name(this, "ZodLiteral");
  }
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
__name(createZodEnum, "createZodEnum");
var ZodEnum = class _ZodEnum extends ZodType {
  static {
    __name(this, "ZodEnum");
  }
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (this._def.values.indexOf(input.data) === -1) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values) {
    return _ZodEnum.create(values);
  }
  exclude(values) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)));
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  static {
    __name(this, "ZodNativeEnum");
  }
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (nativeEnumValues.indexOf(input.data) === -1) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  static {
    __name(this, "ZodPromise");
  }
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  static {
    __name(this, "ZodEffects");
  }
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: /* @__PURE__ */ __name((arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      }, "addIssue"),
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.issues.length) {
        return {
          status: "dirty",
          value: ctx.data
        };
      }
      if (ctx.common.async) {
        return Promise.resolve(processed).then((processed2) => {
          return this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
        });
      } else {
        return this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = /* @__PURE__ */ __name((acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      }, "executeRefinement");
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return base;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return base;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({ status: status.value, value: result }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  static {
    __name(this, "ZodOptional");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  static {
    __name(this, "ZodNullable");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  static {
    __name(this, "ZodDefault");
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  static {
    __name(this, "ZodCatch");
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  static {
    __name(this, "ZodNaN");
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  static {
    __name(this, "ZodBranded");
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  static {
    __name(this, "ZodPipeline");
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = /* @__PURE__ */ __name(async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      }, "handleAsync");
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  static {
    __name(this, "ZodReadonly");
  }
  _parse(input) {
    const result = this._def.innerType._parse(input);
    if (isValid(result)) {
      result.value = Object.freeze(result.value);
    }
    return result;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
var custom = /* @__PURE__ */ __name((check, params = {}, fatal) => {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      var _a, _b;
      if (!check(data)) {
        const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
        const _fatal = (_b = (_a = p.fatal) !== null && _a !== void 0 ? _a : fatal) !== null && _b !== void 0 ? _b : true;
        const p2 = typeof p === "string" ? { message: p } : p;
        ctx.addIssue({ code: "custom", ...p2, fatal: _fatal });
      }
    });
  return ZodAny.create();
}, "custom");
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = /* @__PURE__ */ __name((cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params), "instanceOfType");
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = /* @__PURE__ */ __name(() => stringType().optional(), "ostring");
var onumber = /* @__PURE__ */ __name(() => numberType().optional(), "onumber");
var oboolean = /* @__PURE__ */ __name(() => booleanType().optional(), "oboolean");
var coerce = {
  string: /* @__PURE__ */ __name((arg) => ZodString.create({ ...arg, coerce: true }), "string"),
  number: /* @__PURE__ */ __name((arg) => ZodNumber.create({ ...arg, coerce: true }), "number"),
  boolean: /* @__PURE__ */ __name((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  }), "boolean"),
  bigint: /* @__PURE__ */ __name((arg) => ZodBigInt.create({ ...arg, coerce: true }), "bigint"),
  date: /* @__PURE__ */ __name((arg) => ZodDate.create({ ...arg, coerce: true }), "date")
};
var NEVER = INVALID;
var z = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  defaultErrorMap: errorMap,
  setErrorMap,
  getErrorMap,
  makeIssue,
  EMPTY_PATH,
  addIssueToContext,
  ParseStatus,
  INVALID,
  DIRTY,
  OK,
  isAborted,
  isDirty,
  isValid,
  isAsync,
  get util() {
    return util;
  },
  get objectUtil() {
    return objectUtil;
  },
  ZodParsedType,
  getParsedType,
  ZodType,
  ZodString,
  ZodNumber,
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodSymbol,
  ZodUndefined,
  ZodNull,
  ZodAny,
  ZodUnknown,
  ZodNever,
  ZodVoid,
  ZodArray,
  ZodObject,
  ZodUnion,
  ZodDiscriminatedUnion,
  ZodIntersection,
  ZodTuple,
  ZodRecord,
  ZodMap,
  ZodSet,
  ZodFunction,
  ZodLazy,
  ZodLiteral,
  ZodEnum,
  ZodNativeEnum,
  ZodPromise,
  ZodEffects,
  ZodTransformer: ZodEffects,
  ZodOptional,
  ZodNullable,
  ZodDefault,
  ZodCatch,
  ZodNaN,
  BRAND,
  ZodBranded,
  ZodPipeline,
  ZodReadonly,
  custom,
  Schema: ZodType,
  ZodSchema: ZodType,
  late,
  get ZodFirstPartyTypeKind() {
    return ZodFirstPartyTypeKind;
  },
  coerce,
  any: anyType,
  array: arrayType,
  bigint: bigIntType,
  boolean: booleanType,
  date: dateType,
  discriminatedUnion: discriminatedUnionType,
  effect: effectsType,
  "enum": enumType,
  "function": functionType,
  "instanceof": instanceOfType,
  intersection: intersectionType,
  lazy: lazyType,
  literal: literalType,
  map: mapType,
  nan: nanType,
  nativeEnum: nativeEnumType,
  never: neverType,
  "null": nullType,
  nullable: nullableType,
  number: numberType,
  object: objectType,
  oboolean,
  onumber,
  optional: optionalType,
  ostring,
  pipeline: pipelineType,
  preprocess: preprocessType,
  promise: promiseType,
  record: recordType,
  set: setType,
  strictObject: strictObjectType,
  string: stringType,
  symbol: symbolType,
  transformer: effectsType,
  tuple: tupleType,
  "undefined": undefinedType,
  union: unionType,
  unknown: unknownType,
  "void": voidType,
  NEVER,
  ZodIssueCode,
  quotelessJson,
  ZodError
});

// src/utils/auth.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_jwt4();
async function verifyToken(token, secret) {
  try {
    const payload = await verify2(token, secret, "HS512");
    if (payload.exp && payload.exp < Date.now() / 1e3) {
      return null;
    }
    return {
      id: payload.userId || payload.sub,
      email: payload.email,
      role: payload.role || "user",
      permissions: payload.permissions || []
    };
  } catch (error3) {
    log3.error("Token verification error", error3, { component: "AUTH_SERVICE" });
    return null;
  }
}
__name(verifyToken, "verifyToken");
async function authMiddleware(c, next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = authHeader.slice(7);
  const secret = c.env.JWT_SECRET || "development-secret-change-in-production";
  const user = await verifyToken(token, secret);
  if (!user) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
  c.set("user", user);
  await next();
}
__name(authMiddleware, "authMiddleware");
var validateAuth = authMiddleware;

// src/routes/transcribe.ts
var app4 = new Hono2();
app4.get("/stream", async (c) => {
  const upgradeHeader = c.req.header("upgrade");
  if (!upgradeHeader || upgradeHeader !== "websocket") {
    return c.json({ error: "Expected WebSocket" }, 426);
  }
  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);
  server.accept();
  handleWebSocket(server, c.env);
  return new Response(null, {
    status: 101,
    webSocket: client
  });
});
async function handleWebSocket(ws, env2) {
  let config2 = {
    language: "en",
    model: "whisper-large-v3-turbo",
    task: "transcribe",
    enableTranslation: false,
    targetLanguages: []
  };
  const audioBuffer = [];
  let isProcessing = false;
  let sessionActive = true;
  ws.addEventListener("message", async (event) => {
    try {
      if (typeof event.data === "string") {
        const message = JSON.parse(event.data);
        if (message.type === "config") {
          config2 = { ...config2, ...message };
          ws.send(JSON.stringify({
            type: "config_updated",
            config: config2
          }));
        } else if (message.type === "end_session") {
          sessionActive = false;
          ws.close();
        }
      } else if (event.data instanceof ArrayBuffer) {
        audioBuffer.push(event.data);
        const totalSize = audioBuffer.reduce((sum, buf) => sum + buf.byteLength, 0);
        const targetSize = 16e3 * 2;
        if (totalSize >= targetSize && !isProcessing) {
          isProcessing = true;
          const combinedBuffer = new ArrayBuffer(totalSize);
          const view = new Uint8Array(combinedBuffer);
          let offset = 0;
          for (const buffer of audioBuffer) {
            view.set(new Uint8Array(buffer), offset);
            offset += buffer.byteLength;
          }
          audioBuffer.length = 0;
          try {
            const transcription = await processAudio(env2.AI, combinedBuffer, {
              task: config2.task,
              language: config2.language,
              vad_filter: true
            });
            if (transcription.text && transcription.text.trim()) {
              const transcribedText = transcription.text.trim();
              let translations = {};
              if (config2.enableTranslation && config2.targetLanguages.length > 0) {
                try {
                  translations = await translateToMultipleLanguages(
                    env2.AI,
                    transcribedText,
                    config2.targetLanguages,
                    transcription.language || "auto"
                  );
                } catch (error3) {
                  log3.error("Translation error", error3, { component: "TRANSCRIBE_SERVICE" });
                }
              }
              ws.send(JSON.stringify({
                type: "transcription",
                text: transcribedText,
                language: transcription.language,
                words: transcription.words,
                translations,
                is_final: true,
                timestamp: Date.now(),
                confidence: transcription.confidence || 0.95
              }));
            }
          } catch (error3) {
            log3.error("Transcription error", error3, { component: "TRANSCRIBE_SERVICE" });
            ws.send(JSON.stringify({
              type: "error",
              message: "Transcription failed"
            }));
          }
          isProcessing = false;
        }
      }
    } catch (error3) {
      log3.error("WebSocket error", error3, { component: "TRANSCRIBE_SERVICE" });
      ws.send(JSON.stringify({
        type: "error",
        message: "Processing error"
      }));
    }
  });
  ws.addEventListener("close", () => {
    sessionActive = false;
    audioBuffer.length = 0;
  });
  const pingInterval = setInterval(() => {
    if (sessionActive && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "ping" }));
    } else {
      clearInterval(pingInterval);
    }
  }, 3e4);
}
__name(handleWebSocket, "handleWebSocket");
var transcribeSchema = z.object({
  audio_url: z.string().url().optional(),
  audio_base64: z.string().optional(),
  language: z.string().optional(),
  task: z.enum(["transcribe", "translate"]).optional(),
  word_timestamps: z.boolean().optional()
});
app4.post("/", validateAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { audio_url, audio_base64, language, task, word_timestamps } = transcribeSchema.parse(body);
    let audioBuffer;
    if (audio_url) {
      const response = await fetch(audio_url);
      if (!response.ok) {
        return c.json({ error: "Failed to fetch audio" }, 400);
      }
      audioBuffer = await response.arrayBuffer();
    } else if (audio_base64) {
      const binaryString = atob(audio_base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      audioBuffer = bytes.buffer;
    } else {
      return c.json({ error: "No audio provided" }, 400);
    }
    const result = await processAudio(c.env.AI, audioBuffer, {
      task: task || "transcribe",
      language: language || "auto",
      vad_filter: true
    });
    return c.json({
      success: true,
      transcription: result
    });
  } catch (error3) {
    log3.error("Transcription error", error3, { component: "TRANSCRIBE_SERVICE" });
    return c.json({
      error: "Transcription failed",
      message: error3 instanceof Error ? error3.message : "Unknown error"
    }, 500);
  }
});
var transcribe_default = app4;

// src/routes/cache.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/middleware/cache.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/services/cache.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var CacheService = class {
  static {
    __name(this, "CacheService");
  }
  constructor(kv, prefix = "cache", defaultTTL = 3600) {
    this.kv = kv;
    this.prefix = prefix;
    this.defaultTTL = defaultTTL;
  }
  // 캐시 키 생성
  makeKey(...parts) {
    return [this.prefix, ...parts].join(":");
  }
  // 캐시 저장
  async set(key, data, options = {}) {
    const ttl = options.ttl || this.defaultTTL;
    const now = Date.now();
    const entry = {
      data,
      createdAt: now,
      expiresAt: now + ttl * 1e3,
      tags: options.tags,
      version: "1.0"
    };
    await this.kv.put(
      this.makeKey(key),
      JSON.stringify(entry),
      {
        expirationTtl: ttl,
        metadata: {
          tags: options.tags,
          priority: options.priority || "normal"
        }
      }
    );
    if (options.tags && options.tags.length > 0) {
      await this.updateTagIndex(key, options.tags);
    }
  }
  // 캐시 조회
  async get(key) {
    const fullKey = this.makeKey(key);
    const cached = await this.kv.get(fullKey, { type: "json" });
    if (!cached) {
      return null;
    }
    if (cached.expiresAt < Date.now()) {
      await this.kv.delete(fullKey);
      return null;
    }
    return cached.data;
  }
  // 캐시 존재 확인
  async has(key) {
    const result = await this.get(key);
    return result !== null;
  }
  // 캐시 삭제
  async delete(key) {
    const fullKey = this.makeKey(key);
    await this.kv.delete(fullKey);
  }
  // 태그로 캐시 삭제
  async deleteByTag(tag) {
    const tagKey = this.makeKey("tags", tag);
    const keys = await this.kv.get(tagKey, { type: "json" });
    if (keys && keys.length > 0) {
      await Promise.all(keys.map((key) => this.kv.delete(this.makeKey(key))));
      await this.kv.delete(tagKey);
    }
  }
  // 패턴으로 캐시 삭제
  async deleteByPrefix(prefix) {
    const fullPrefix = this.makeKey(prefix);
    const list = await this.kv.list({ prefix: fullPrefix });
    await Promise.all(
      list.keys.map((key) => this.kv.delete(key.name))
    );
  }
  // 태그 인덱스 업데이트
  async updateTagIndex(key, tags) {
    await Promise.all(
      tags.map(async (tag) => {
        const tagKey = this.makeKey("tags", tag);
        const existing = await this.kv.get(tagKey, { type: "json" }) || [];
        if (!existing.includes(key)) {
          existing.push(key);
          await this.kv.put(tagKey, JSON.stringify(existing), {
            expirationTtl: 86400 * 7
            // 7일
          });
        }
      })
    );
  }
  // 캐시 통계
  async getStats() {
    const list = await this.kv.list({ prefix: this.prefix });
    return {
      totalKeys: list.keys.length,
      estimatedSize: list.keys.reduce((sum, key) => sum + (key.metadata?.size || 0), 0),
      oldestKey: list.keys[0]?.name
    };
  }
};
var SessionCache = class {
  static {
    __name(this, "SessionCache");
  }
  constructor(kv) {
    this.cache = new CacheService(kv, "session", 3600);
  }
  // 세션 저장
  async setSession(sessionId, data, ttl = 3600) {
    await this.cache.set(sessionId, data, {
      ttl,
      tags: ["session", `user:${data.userId}`]
    });
  }
  // 세션 조회
  async getSession(sessionId) {
    return this.cache.get(sessionId);
  }
  // 세션 갱신
  async refreshSession(sessionId, ttl = 3600) {
    const session = await this.getSession(sessionId);
    if (!session) return false;
    await this.setSession(sessionId, session, ttl);
    return true;
  }
  // 사용자별 세션 삭제
  async deleteUserSessions(userId) {
    await this.cache.deleteByTag(`user:${userId}`);
  }
  // 모든 세션 삭제
  async deleteAllSessions() {
    await this.cache.deleteByTag("session");
  }
};
var APICache = class {
  static {
    __name(this, "APICache");
  }
  constructor(kv) {
    this.cache = new CacheService(kv, "api", 300);
  }
  // API 응답 캐시 키 생성
  makeAPIKey(method, url, params) {
    const paramString = params ? JSON.stringify(params) : "";
    return `${method}:${url}:${paramString}`;
  }
  // API 응답 캐싱
  async cacheResponse(method, url, response, params, ttl = 300) {
    const key = this.makeAPIKey(method, url, params);
    await this.cache.set(key, response, { ttl, tags: ["api", method] });
  }
  // 캐시된 응답 조회
  async getCachedResponse(method, url, params) {
    const key = this.makeAPIKey(method, url, params);
    return this.cache.get(key);
  }
  // 특정 메서드의 모든 캐시 삭제
  async invalidateMethod(method) {
    await this.cache.deleteByTag(method);
  }
  // 모든 API 캐시 삭제
  async invalidateAll() {
    await this.cache.deleteByTag("api");
  }
};
var UserCache = class {
  static {
    __name(this, "UserCache");
  }
  constructor(kv) {
    this.cache = new CacheService(kv, "user", 86400);
  }
  // 사용자 프로필 캐싱
  async setUser(userId, profile3) {
    await this.cache.set(`profile:${userId}`, profile3, {
      ttl: 86400,
      tags: ["user-profile"]
    });
  }
  // 사용자 프로필 조회
  async getUser(userId) {
    return this.cache.get(`profile:${userId}`);
  }
  // 사용자 설정 캐싱
  async setUserSettings(userId, settings) {
    await this.cache.set(`settings:${userId}`, settings, {
      ttl: 86400 * 7,
      // 7일
      tags: ["user-settings"]
    });
  }
  // 사용자 설정 조회
  async getUserSettings(userId) {
    return this.cache.get(`settings:${userId}`);
  }
  // 사용자 관련 모든 캐시 삭제
  async invalidateUser(userId) {
    await Promise.all([
      this.cache.delete(`profile:${userId}`),
      this.cache.delete(`settings:${userId}`)
    ]);
  }
};

// src/middleware/cache.ts
async function invalidateCache(kv, patterns) {
  const apiCache = new APICache(kv);
  await Promise.all(
    patterns.map((pattern) => {
      if (pattern === "*") {
        return apiCache.invalidateAll();
      }
      return apiCache.invalidateMethod(pattern);
    })
  );
}
__name(invalidateCache, "invalidateCache");
async function warmCache(env2, endpoints) {
  const apiCache = new APICache(env2.CACHE);
  await Promise.all(
    endpoints.map(async ({ url, ttl = 3600 }) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const urlObj = new URL(url);
          const cacheKey = `${urlObj.pathname}${urlObj.search}`;
          await apiCache.cacheResponse("GET", cacheKey, data, null, ttl);
        }
      } catch (error3) {
        console.error(`Failed to warm cache for ${url}:`, error3);
      }
    })
  );
}
__name(warmCache, "warmCache");
async function getCacheStats(kv) {
  const list = await kv.list({ limit: 1e3 });
  const cacheTypes = {};
  for (const key of list.keys) {
    const [prefix] = key.name.split(":");
    cacheTypes[prefix] = (cacheTypes[prefix] || 0) + 1;
  }
  return {
    totalKeys: list.keys.length,
    estimatedSize: list.keys.reduce((sum, key) => sum + (key.metadata?.size || 0), 0),
    cacheTypes
  };
}
__name(getCacheStats, "getCacheStats");

// src/routes/cache.ts
var app5 = new Hono2();
app5.use("/*", cors());
app5.use("/*", async (c, next) => {
  const apiKey = c.req.header("x-api-key");
  if (apiKey !== c.env.INTERNAL_SECRET) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});
app5.get("/stats", async (c) => {
  try {
    const stats = await getCacheStats(c.env.CACHE);
    return c.json({
      success: true,
      stats,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error3) {
    return c.json({ error: error3.message }, 500);
  }
});
app5.post("/invalidate", async (c) => {
  try {
    const body = await c.req.json();
    if (body.type === "all") {
      const cacheService = new CacheService(c.env.CACHE);
      await cacheService.deleteByPrefix("");
      return c.json({
        success: true,
        message: "All cache cleared"
      });
    }
    if (body.type === "api") {
      const apiCache = new APICache(c.env.CACHE);
      await apiCache.invalidateAll();
      return c.json({
        success: true,
        message: "API cache cleared"
      });
    }
    if (body.type === "session") {
      const sessionCache = new SessionCache(c.env.CACHE);
      await sessionCache.deleteAllSessions();
      return c.json({
        success: true,
        message: "Session cache cleared"
      });
    }
    if (body.type === "user" && body.userId) {
      const userCache = new UserCache(c.env.CACHE);
      await userCache.invalidateUser(body.userId);
      const sessionCache = new SessionCache(c.env.CACHE);
      await sessionCache.deleteUserSessions(body.userId);
      return c.json({
        success: true,
        message: `Cache cleared for user ${body.userId}`
      });
    }
    if (body.patterns) {
      await invalidateCache(c.env.CACHE, body.patterns);
      return c.json({
        success: true,
        message: `Cache invalidated for patterns: ${body.patterns.join(", ")}`
      });
    }
    if (body.tag) {
      const cacheService = new CacheService(c.env.CACHE);
      await cacheService.deleteByTag(body.tag);
      return c.json({
        success: true,
        message: `Cache cleared for tag: ${body.tag}`
      });
    }
    return c.json({ error: "No invalidation criteria provided" }, 400);
  } catch (error3) {
    return c.json({ error: error3.message }, 500);
  }
});
app5.post("/warm", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.endpoints || body.endpoints.length === 0) {
      return c.json({ error: "No endpoints provided" }, 400);
    }
    c.executionCtx.waitUntil(
      warmCache(c.env, body.endpoints)
    );
    return c.json({
      success: true,
      message: `Warming cache for ${body.endpoints.length} endpoints`,
      endpoints: body.endpoints
    });
  } catch (error3) {
    return c.json({ error: error3.message }, 500);
  }
});
app5.get("/get/:key", async (c) => {
  try {
    const key = c.req.param("key");
    const cacheService = new CacheService(c.env.CACHE);
    const value = await cacheService.get(key);
    if (!value) {
      return c.json({ error: "Key not found" }, 404);
    }
    return c.json({
      success: true,
      key,
      value,
      exists: true
    });
  } catch (error3) {
    return c.json({ error: error3.message }, 500);
  }
});
app5.post("/set", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.key || body.value === void 0) {
      return c.json({ error: "Key and value are required" }, 400);
    }
    const cacheService = new CacheService(c.env.CACHE);
    await cacheService.set(body.key, body.value, {
      ttl: body.ttl,
      tags: body.tags
    });
    return c.json({
      success: true,
      key: body.key,
      ttl: body.ttl || 3600
    });
  } catch (error3) {
    return c.json({ error: error3.message }, 500);
  }
});
app5.get("/keys", async (c) => {
  try {
    const prefix = c.req.query("prefix") || "";
    const limit = parseInt(c.req.query("limit") || "100");
    const list = await c.env.CACHE.list({
      prefix,
      limit: Math.min(limit, 1e3)
    });
    return c.json({
      success: true,
      keys: list.keys.map((key) => ({
        name: key.name,
        expiration: key.expiration,
        metadata: key.metadata
      })),
      cursor: list.cursor,
      complete: list.list_complete
    });
  } catch (error3) {
    return c.json({ error: error3.message }, 500);
  }
});
app5.post("/session/refresh", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.sessionId) {
      return c.json({ error: "Session ID is required" }, 400);
    }
    const sessionCache = new SessionCache(c.env.CACHE);
    const refreshed = await sessionCache.refreshSession(
      body.sessionId,
      body.ttl || 3600
    );
    if (!refreshed) {
      return c.json({ error: "Session not found" }, 404);
    }
    return c.json({
      success: true,
      sessionId: body.sessionId,
      refreshed: true,
      ttl: body.ttl || 3600
    });
  } catch (error3) {
    return c.json({ error: error3.message }, 500);
  }
});
var cache_default = app5;

// src/routes/translate.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var app6 = new Hono2();
app6.use("/*", cors());
var LANGUAGE_CODES = {
  "ko": "Korean",
  "en": "English",
  "ja": "Japanese",
  "zh": "Chinese",
  "es": "Spanish",
  "fr": "French",
  "de": "German",
  "ru": "Russian",
  "ar": "Arabic",
  "hi": "Hindi",
  "pt": "Portuguese",
  "it": "Italian",
  "nl": "Dutch",
  "sv": "Swedish",
  "pl": "Polish",
  "tr": "Turkish",
  "vi": "Vietnamese",
  "th": "Thai",
  "id": "Indonesian",
  "ms": "Malay"
};
async function detectLanguage(text, ai) {
  try {
    const prompt = `Detect the language of the following text and respond with ONLY the ISO 639-1 language code (e.g., 'en' for English, 'ko' for Korean, 'ja' for Japanese, etc.).

Text: "${text}"

Language code:`;
    const response = await ai.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages: [
        { role: "system", content: "You are a language detection expert. Respond only with the ISO 639-1 language code." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 10
    });
    const detectedCode = response.response.trim().toLowerCase();
    return LANGUAGE_CODES[detectedCode] ? detectedCode : "en";
  } catch (error3) {
    log3.error("Language detection error", error3, { component: "TRANSLATE_SERVICE" });
    return "en";
  }
}
__name(detectLanguage, "detectLanguage");
app6.post("/translate", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.text || !body.target) {
      return c.json({ error: "Text and target language are required" }, 400);
    }
    const sourceLanguage = body.source || await detectLanguage(body.text, c.env.AI);
    const targetLanguage = body.target;
    if (sourceLanguage === targetLanguage) {
      return c.json({
        success: true,
        originalText: body.text,
        translatedText: body.text,
        sourceLanguage,
        targetLanguage,
        isIdentical: true
      });
    }
    const prompt = `Translate the following text from ${LANGUAGE_CODES[sourceLanguage] || sourceLanguage} to ${LANGUAGE_CODES[targetLanguage] || targetLanguage}.
${body.preserveFormatting ? "Preserve the original formatting including line breaks and punctuation." : ""}

Original text:
"${body.text}"

Translation:`;
    const response = await c.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages: [
        {
          role: "system",
          content: "You are a professional translator. Provide accurate, natural translations while maintaining the original meaning and tone. Respond only with the translation, no explanations."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: Math.min(body.text.length * 3, 2e3)
      // 번역은 보통 원문보다 길어질 수 있음
    });
    const translatedText = response.response.trim().replace(/^["']/, "").replace(/["']$/, "");
    return c.json({
      success: true,
      originalText: body.text,
      translatedText,
      sourceLanguage,
      targetLanguage,
      model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
    });
  } catch (error3) {
    log3.error("Translation error", error3, { component: "TRANSLATE_SERVICE" });
    return c.json({ error: error3.message || "Translation failed" }, 500);
  }
});
app6.post("/translate/batch", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.texts || body.texts.length === 0 || !body.target) {
      return c.json({ error: "Texts array and target language are required" }, 400);
    }
    const textsToTranslate = body.texts.slice(0, 10);
    const translations = await Promise.all(
      textsToTranslate.map(async (text) => {
        try {
          const sourceLanguage = body.source || await detectLanguage(text, c.env.AI);
          if (sourceLanguage === body.target) {
            return {
              originalText: text,
              translatedText: text,
              sourceLanguage,
              targetLanguage: body.target,
              isIdentical: true
            };
          }
          const prompt = `Translate from ${LANGUAGE_CODES[sourceLanguage] || sourceLanguage} to ${LANGUAGE_CODES[body.target] || body.target}: "${text}"`;
          const response = await c.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
            messages: [
              { role: "system", content: "You are a translator. Provide only the translation, no explanations." },
              { role: "user", content: prompt }
            ],
            temperature: 0.3,
            max_tokens: Math.min(text.length * 3, 1e3)
          });
          return {
            originalText: text,
            translatedText: response.response.trim().replace(/^["']|["']$/g, ""),
            sourceLanguage,
            targetLanguage: body.target
          };
        } catch (error3) {
          return {
            originalText: text,
            translatedText: "",
            error: "Translation failed",
            sourceLanguage: body.source || "unknown",
            targetLanguage: body.target
          };
        }
      })
    );
    return c.json({
      success: true,
      translations,
      total: translations.length
    });
  } catch (error3) {
    log3.error("Batch translation error", error3, { component: "TRANSLATE_SERVICE" });
    return c.json({ error: error3.message || "Batch translation failed" }, 500);
  }
});
app6.post("/translate/subtitle", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.subtitle?.text || !body.targetLanguage) {
      return c.json({ error: "Subtitle text and target language are required" }, 400);
    }
    const sourceLanguage = body.subtitle.language || await detectLanguage(body.subtitle.text, c.env.AI);
    if (sourceLanguage === body.targetLanguage) {
      return c.json({
        success: true,
        originalSubtitle: body.subtitle,
        translatedSubtitle: {
          ...body.subtitle,
          translatedText: body.subtitle.text,
          targetLanguage: body.targetLanguage
        }
      });
    }
    let contextPrompt = "";
    if (body.context && body.context.length > 0) {
      contextPrompt = `Previous conversation context:
${body.context.slice(-3).join("\n")}

`;
    }
    const prompt = `${contextPrompt}Translate this subtitle from ${LANGUAGE_CODES[sourceLanguage] || sourceLanguage} to ${LANGUAGE_CODES[body.targetLanguage] || body.targetLanguage}. Keep it concise for subtitles:

"${body.subtitle.text}"`;
    const response = await c.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages: [
        {
          role: "system",
          content: "You are a subtitle translator. Provide concise, natural translations suitable for real-time display. Consider the conversation context if provided."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 200
    });
    const translatedText = response.response.trim().replace(/^["']|["']$/g, "");
    return c.json({
      success: true,
      originalSubtitle: body.subtitle,
      translatedSubtitle: {
        ...body.subtitle,
        translatedText,
        targetLanguage: body.targetLanguage,
        sourceLanguage
      }
    });
  } catch (error3) {
    log3.error("Subtitle translation error", error3, { component: "TRANSLATE_SERVICE" });
    return c.json({ error: error3.message || "Subtitle translation failed" }, 500);
  }
});
app6.get("/languages", (c) => {
  const languages = Object.entries(LANGUAGE_CODES).map(([code, name]) => ({
    code,
    name,
    nativeName: getNativeName(code)
  }));
  return c.json({
    success: true,
    languages,
    total: languages.length
  });
});
function getNativeName(code) {
  const nativeNames = {
    "ko": "\uD55C\uAD6D\uC5B4",
    "en": "English",
    "ja": "\u65E5\u672C\u8A9E",
    "zh": "\u4E2D\u6587",
    "es": "Espa\xF1ol",
    "fr": "Fran\xE7ais",
    "de": "Deutsch",
    "ru": "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
    "ar": "\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
    "hi": "\u0939\u093F\u0928\u094D\u0926\u0940",
    "pt": "Portugu\xEAs",
    "it": "Italiano",
    "nl": "Nederlands",
    "sv": "Svenska",
    "pl": "Polski",
    "tr": "T\xFCrk\xE7e",
    "vi": "Ti\u1EBFng Vi\u1EC7t",
    "th": "\u0E44\u0E17\u0E22",
    "id": "Bahasa Indonesia",
    "ms": "Bahasa Melayu"
  };
  return nativeNames[code] || LANGUAGE_CODES[code] || code;
}
__name(getNativeName, "getNativeName");
var translate_default = app6;

// src/routes/analytics.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_analytics();
var app7 = new Hono2();
var metricsQuerySchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  groupBy: z.enum(["path", "status", "country"]).optional(),
  interval: z.enum(["1m", "5m", "1h", "1d"]).optional()
});
app7.get("/metrics", authMiddleware, async (c) => {
  try {
    const query2 = metricsQuerySchema.parse(c.req.query());
    const end = query2.end ? new Date(query2.end) : /* @__PURE__ */ new Date();
    const start = query2.start ? new Date(query2.start) : new Date(end.getTime() - 24 * 60 * 60 * 1e3);
    const metrics = await getAggregatedMetrics(
      c.env,
      { start, end },
      query2.groupBy
    );
    if (!metrics) {
      return successResponse(c, {
        timeRange: { start, end },
        groupBy: query2.groupBy ?? null,
        fallback: true,
        metrics: {
          count: 0,
          avgDuration: 0,
          avgCpuTime: 0,
          p95Duration: 0,
          p95CpuTime: 0,
          buckets: []
        }
      }, {
        note: "analytics_fallback"
      });
    }
    return successResponse(c, {
      timeRange: { start, end },
      groupBy: query2.groupBy,
      metrics
    });
  } catch (error3) {
    console.error("Metrics query error:", error3);
    return successResponse(c, {
      timeRange: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1e3),
        end: /* @__PURE__ */ new Date()
      },
      groupBy: null,
      fallback: true,
      metrics: {
        count: 0,
        avgDuration: 0,
        avgCpuTime: 0,
        p95Duration: 0,
        p95CpuTime: 0,
        buckets: []
      }
    }, {
      note: "analytics_error_fallback"
    });
  }
});
app7.get("/dashboard", authMiddleware, async (c) => {
  try {
    const now = /* @__PURE__ */ new Date();
    const ranges = {
      last24h: { start: new Date(now.getTime() - 24 * 60 * 60 * 1e3), end: now },
      last7d: { start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3), end: now },
      last30d: { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3), end: now }
    };
    const [
      overview24h,
      overview7d,
      overview30d,
      topPaths,
      errorsByStatus,
      geoDistribution
    ] = await Promise.all([
      getAggregatedMetrics(c.env, ranges.last24h),
      getAggregatedMetrics(c.env, ranges.last7d),
      getAggregatedMetrics(c.env, ranges.last30d),
      getAggregatedMetrics(c.env, ranges.last24h, "path"),
      getAggregatedMetrics(c.env, ranges.last24h, "status"),
      getAggregatedMetrics(c.env, ranges.last24h, "country")
    ]);
    return successResponse(c, {
      overview: {
        last24h: overview24h,
        last7d: overview7d,
        last30d: overview30d
      },
      topPaths,
      errorsByStatus,
      geoDistribution,
      timestamp: now.toISOString()
    });
  } catch (error3) {
    console.error("Dashboard data error:", error3);
    return c.json({ success: false, error: { message: "Failed to load dashboard data" } }, { status: 500 });
  }
});
app7.get("/stream", async (c) => {
  const upgradeHeader = c.req.header("upgrade");
  if (!upgradeHeader || upgradeHeader !== "websocket") {
    return c.json({ error: "Expected WebSocket" }, 426);
  }
  const webSocketPair = new globalThis.WebSocketPair();
  const [client, server] = Object.values(webSocketPair);
  server.accept();
  const authHeader = c.req.header("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    server.send(JSON.stringify({ type: "error", message: "Unauthorized" }));
    server.close(1008, "Unauthorized");
    return new Response(null, { status: 101, webSocket: client });
  }
  const { streamMetrics: streamMetrics2 } = await Promise.resolve().then(() => (init_analytics(), analytics_exports));
  streamMetrics2(server, c.env);
  return new Response(null, {
    status: 101,
    webSocket: client
  });
});
app7.get("/errors", authMiddleware, async (c) => {
  try {
    const query2 = metricsQuerySchema.parse(c.req.query());
    const end = query2.end ? new Date(query2.end) : /* @__PURE__ */ new Date();
    const start = query2.start ? new Date(query2.start) : new Date(end.getTime() - 24 * 60 * 60 * 1e3);
    const result = await c.env.ANALYTICS?.query({
      timeRange: [start, end],
      filter: {
        blob1: "error"
      },
      aggregations: {
        count: { count: {} },
        topErrors: {
          topK: {
            field: "blob4",
            // error message
            k: 10
          }
        },
        errorsByType: {
          topK: {
            field: "blob5",
            // error type
            k: 10
          }
        }
      }
    });
    return successResponse(c, {
      timeRange: { start, end },
      errors: result || null
    });
  } catch (error3) {
    console.error("Error stats error:", error3);
    return errorResponse(c, "Failed to query error statistics");
  }
});
app7.get("/ai-usage", authMiddleware, async (c) => {
  try {
    const query2 = metricsQuerySchema.parse(c.req.query());
    const end = query2.end ? new Date(query2.end) : /* @__PURE__ */ new Date();
    const start = query2.start ? new Date(query2.start) : new Date(end.getTime() - 24 * 60 * 60 * 1e3);
    const result = await c.env.ANALYTICS?.query({
      timeRange: [start, end],
      filter: {
        blob5: { $ne: "" }
        // AI model이 있는 요청만
      },
      aggregations: {
        totalTokens: { sum: { field: "double3" } },
        avgTokensPerRequest: { avg: { field: "double3" } },
        totalAiDuration: { sum: { field: "double4" } },
        avgAiDuration: { avg: { field: "double4" } },
        modelUsage: {
          topK: {
            field: "blob5",
            // AI model
            k: 10
          }
        }
      }
    });
    return successResponse(c, {
      timeRange: { start, end },
      aiUsage: result || null
    });
  } catch (error3) {
    console.error("AI usage stats error:", error3);
    return errorResponse(c, "Failed to query AI usage statistics");
  }
});
app7.get("/performance", authMiddleware, async (c) => {
  try {
    const query2 = metricsQuerySchema.parse(c.req.query());
    const end = query2.end ? new Date(query2.end) : /* @__PURE__ */ new Date();
    const start = query2.start ? new Date(query2.start) : new Date(end.getTime() - 24 * 60 * 60 * 1e3);
    const result = await c.env.ANALYTICS?.query({
      timeRange: [start, end],
      filter: {
        blob1: "api_request"
      },
      aggregations: {
        p50Duration: { quantile: { field: "double1", quantile: 0.5 } },
        p75Duration: { quantile: { field: "double1", quantile: 0.75 } },
        p90Duration: { quantile: { field: "double1", quantile: 0.9 } },
        p95Duration: { quantile: { field: "double1", quantile: 0.95 } },
        p99Duration: { quantile: { field: "double1", quantile: 0.99 } },
        p50CpuTime: { quantile: { field: "double2", quantile: 0.5 } },
        p75CpuTime: { quantile: { field: "double2", quantile: 0.75 } },
        p90CpuTime: { quantile: { field: "double2", quantile: 0.9 } },
        p95CpuTime: { quantile: { field: "double2", quantile: 0.95 } },
        p99CpuTime: { quantile: { field: "double2", quantile: 0.99 } }
      },
      groupBy: query2.groupBy ? [`blob${getFieldIndex2(query2.groupBy)}`] : void 0
    });
    return successResponse(c, {
      timeRange: { start, end },
      groupBy: query2.groupBy,
      performance: result || null
    });
  } catch (error3) {
    console.error("Performance stats error:", error3);
    return errorResponse(c, "Failed to query performance statistics");
  }
});
function getFieldIndex2(field) {
  const fieldMap = {
    "path": 3,
    "status": 1,
    "country": 2
  };
  return fieldMap[field] || 1;
}
__name(getFieldIndex2, "getFieldIndex");
app7.post("/events", async (c) => {
  try {
    const { events } = await c.req.json();
    if (!Array.isArray(events)) {
      return errorResponse(c, "Events must be an array", "INVALID_INPUT", null, 400);
    }
    for (const event of events) {
      await c.env.ANALYTICS?.writeDataPoint({
        blobs: [
          "client_event",
          event.event,
          event.userId,
          event.sessionId,
          event.properties?.page || ""
        ],
        doubles: [
          event.timestamp,
          event.properties?.pageLoadTime || 0,
          event.properties?.duration || 0,
          0
        ],
        indexes: [
          event.properties?.sessionType || "",
          event.properties?.feature || "",
          event.properties?.variant || ""
        ]
      });
    }
    return successResponse(c, {
      message: "Events recorded",
      count: events.length
    });
  } catch (error3) {
    console.error("Events recording error:", error3);
    return errorResponse(c, "Failed to record events");
  }
});

// src/routes/internal.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/constants/whisper.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var WHISPER_MODELS = {
  ENGLISH_ONLY: "@cf/openai/whisper-tiny-en",
  // 영어 전용 (빠름)
  MULTILINGUAL: "@cf/openai/whisper"
  // 다국어 지원
};
var ENGLISH_LANGUAGE_CODES = [
  "en",
  // 기본 영어
  "en-US",
  // 미국 영어
  "en-GB",
  // 영국 영어
  "en-AU",
  // 호주 영어
  "en-CA",
  // 캐나다 영어
  "en-NZ",
  // 뉴질랜드 영어
  "en-IE",
  // 아일랜드 영어
  "en-ZA"
  // 남아공 영어
];
var MAJOR_SUPPORTED_LANGUAGES = {
  // 아시아 언어
  ko: "\uD55C\uAD6D\uC5B4",
  ja: "\uC77C\uBCF8\uC5B4",
  zh: "\uC911\uAD6D\uC5B4",
  vi: "\uBCA0\uD2B8\uB0A8\uC5B4",
  th: "\uD0DC\uAD6D\uC5B4",
  id: "\uC778\uB3C4\uB124\uC2DC\uC544\uC5B4",
  // 유럽 언어
  es: "\uC2A4\uD398\uC778\uC5B4",
  fr: "\uD504\uB791\uC2A4\uC5B4",
  de: "\uB3C5\uC77C\uC5B4",
  it: "\uC774\uD0C8\uB9AC\uC544\uC5B4",
  pt: "\uD3EC\uB974\uD22C\uAC08\uC5B4",
  ru: "\uB7EC\uC2DC\uC544\uC5B4",
  nl: "\uB124\uB35C\uB780\uB4DC\uC5B4",
  pl: "\uD3F4\uB780\uB4DC\uC5B4",
  sv: "\uC2A4\uC6E8\uB374\uC5B4",
  // 중동/아프리카/남아시아
  ar: "\uC544\uB78D\uC5B4",
  tr: "\uD130\uD0A4\uC5B4",
  hi: "\uD78C\uB514\uC5B4",
  he: "\uD788\uBE0C\uB9AC\uC5B4",
  fa: "\uD398\uB974\uC2DC\uC544\uC5B4"
};
var WHISPER_FILE_LIMITS = {
  MAX_SIZE: 25 * 1024 * 1024,
  // 25MB (절대 최대)
  RECOMMENDED_SIZE: 4 * 1024 * 1024,
  // 4MB (권장)
  OPTIMAL_DURATION: 30
  // 30초 (최적)
};
function selectWhisperModel(language) {
  const lang = language || "auto";
  if (ENGLISH_LANGUAGE_CODES.includes(lang)) {
    return {
      model: WHISPER_MODELS.ENGLISH_ONLY,
      isEnglishOnly: true,
      languageName: "English"
    };
  }
  const languageName = MAJOR_SUPPORTED_LANGUAGES[lang];
  return {
    model: WHISPER_MODELS.MULTILINGUAL,
    isEnglishOnly: false,
    languageName: languageName || `Language: ${lang}`
  };
}
__name(selectWhisperModel, "selectWhisperModel");
function validateAudioSize(sizeInBytes) {
  if (sizeInBytes > WHISPER_FILE_LIMITS.MAX_SIZE) {
    return {
      isValid: false,
      isOptimal: false,
      message: `File too large: ${(sizeInBytes / 1024 / 1024).toFixed(2)}MB (max: 25MB)`
    };
  }
  if (sizeInBytes > WHISPER_FILE_LIMITS.RECOMMENDED_SIZE) {
    return {
      isValid: true,
      isOptimal: false,
      message: `File is large: ${(sizeInBytes / 1024 / 1024).toFixed(2)}MB (recommended: <4MB)`
    };
  }
  return {
    isValid: true,
    isOptimal: true
  };
}
__name(validateAudioSize, "validateAudioSize");

// src/routes/internal.ts
var internalRoutes = new Hono2();
internalRoutes.use("*", internalAuth());
internalRoutes.post("/transcribe", async (c) => {
  try {
    const body = await c.req.json();
    const { audio_url, audio_base64, language, user_context } = body;
    let audioBuffer;
    if (audio_url) {
      const response = await fetch(audio_url);
      if (!response.ok) {
        return c.json({ error: "Failed to fetch audio from URL" }, 400);
      }
      audioBuffer = await response.arrayBuffer();
    } else if (audio_base64) {
      const binaryString = atob(audio_base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      audioBuffer = bytes.buffer;
    } else {
      return c.json({ error: "Either audio_url or audio_base64 must be provided" }, 400);
    }
    const sizeValidation = validateAudioSize(audioBuffer.byteLength);
    if (!sizeValidation.isValid) {
      return c.json({
        error: "Audio file too large",
        message: sizeValidation.message,
        details: {
          currentSize: audioBuffer.byteLength,
          maxSize: WHISPER_FILE_LIMITS.MAX_SIZE,
          recommendedSize: WHISPER_FILE_LIMITS.RECOMMENDED_SIZE
        }
      }, 400);
    }
    if (!sizeValidation.isOptimal) {
      const warningMessage = sizeValidation.message || "Audio file size exceeds recommended threshold";
      log3.warn(warningMessage, void 0, {
        component: "INTERNAL_API",
        audioSize: audioBuffer.byteLength
      });
    }
    let result;
    try {
      const audioArray = [...new Uint8Array(audioBuffer)];
      const modelSelection = selectWhisperModel(language);
      log3.info("Processing audio for transcription", void 0, {
        component: "INTERNAL_API",
        audioSize: audioBuffer.byteLength,
        arrayLength: audioArray.length,
        language: language || "auto",
        model: modelSelection.model,
        languageName: modelSelection.languageName
      });
      const whisperResponse = await c.env.AI.run(modelSelection.model, {
        audio: audioArray
      });
      result = {
        text: whisperResponse?.text || "",
        language: whisperResponse?.language || language || "unknown",
        vtt: whisperResponse?.vtt,
        words: whisperResponse?.words
      };
      log3.info("Transcription successful", void 0, {
        component: "INTERNAL_API",
        textLength: result.text.length,
        detectedLanguage: result.language
      });
    } catch (whisperError) {
      log3.error("Whisper processing error", whisperError instanceof Error ? whisperError : new Error(String(whisperError)), void 0, {
        component: "INTERNAL_API",
        audioSize: audioBuffer.byteLength,
        error: whisperError instanceof Error ? whisperError.message : "Unknown error"
      });
      return c.json({
        error: "Transcription failed",
        message: whisperError instanceof Error ? whisperError.message : "Unknown error",
        details: {
          audioSize: audioBuffer.byteLength,
          maxAllowedSize: WHISPER_FILE_LIMITS.MAX_SIZE
        }
      }, 500);
    }
    return successResponse(c, {
      transcript: result.text || "",
      language: result.language,
      confidence: 1,
      // Whisper doesn't provide confidence scores
      word_count: result.text ? result.text.split(/\s+/).filter((word) => word.length > 0).length : 0,
      processing_time: 0,
      // Would need to measure actual processing time
      vtt: result.vtt,
      words: result.words,
      user_context: user_context || null
    });
  } catch (error3) {
    log3.error("Internal transcription error", error3, void 0, { component: "INTERNAL_API" });
    return c.json({
      error: "Transcription failed",
      message: error3 instanceof Error ? error3.message : "Unknown error"
    }, 500);
  }
});
internalRoutes.post("/level-test", async (c) => {
  try {
    const body = await c.req.json();
    const { transcript, language, questions, user_context } = body;
    if (!transcript) {
      return c.json({ error: "Transcript is required" }, 400);
    }
    const evaluation = await evaluateLanguageLevel(
      c.env.AI,
      transcript,
      questions || "Please introduce yourself and talk about your interests."
    );
    return successResponse(c, {
      evaluation,
      analyzed_text: transcript,
      language: language || "en",
      user_context: user_context || null,
      processed_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error3) {
    log3.error("Internal level test error", error3, { component: "INTERNAL_API" });
    return c.json({
      error: "Level test evaluation failed",
      message: error3 instanceof Error ? error3.message : "Unknown error"
    }, 500);
  }
});
internalRoutes.patch("/webrtc/rooms/:roomId/metadata", async (c) => {
  const roomId = c.req.param("roomId");
  if (!roomId) {
    return c.json({ error: "roomId is required" }, 400);
  }
  try {
    const metadata = await c.req.json();
    if (!metadata || typeof metadata !== "object") {
      return c.json({ error: "metadata object is required" }, 400);
    }
    const id = c.env.ROOM.idFromName(roomId);
    const room = c.env.ROOM.get(id);
    const response = await room.fetch(new Request("http://room/metadata", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metadata)
    }));
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return c.json({
        error: "Failed to update metadata",
        details: errorBody?.message || null
      }, response.status);
    }
    const cacheKey = `room:${roomId}`;
    const cached = await c.env.CACHE.get(cacheKey);
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        const updated = {
          ...cachedData,
          metadata: {
            ...cachedData.metadata || {},
            ...metadata
          }
        };
        await c.env.CACHE.put(cacheKey, JSON.stringify(updated), { expirationTtl: 3600 });
      } catch (cacheError) {
        log3.warn("Failed to update cached room metadata", void 0, {
          component: "INTERNAL_API",
          roomId,
          error: cacheError instanceof Error ? cacheError.message : String(cacheError)
        });
      }
    }
    const activeRooms = await getActiveRooms(c.env.CACHE);
    const index = activeRooms.findIndex((room2) => room2.roomId === roomId);
    if (index >= 0) {
      const updatedRoom = {
        ...activeRooms[index],
        metadata: {
          ...activeRooms[index].metadata || {},
          ...metadata
        },
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await upsertActiveRoom(c.env.CACHE, updatedRoom);
    }
    const result = await response.json().catch(() => ({ success: true }));
    return successResponse(c, result);
  } catch (error3) {
    log3.error("WebRTC metadata sync error", error3, void 0, { component: "INTERNAL_API", roomId });
    return c.json({
      error: "Failed to sync metadata",
      message: error3 instanceof Error ? error3.message : "Unknown error"
    }, 500);
  }
});
internalRoutes.post("/conversation-feedback", async (c) => {
  try {
    const body = await c.req.json();
    const { transcript, context: context2, user_level, user_context } = body;
    if (!transcript) {
      return c.json({ error: "Transcript is required" }, 400);
    }
    const conversation = [
      {
        speaker: "user",
        text: transcript
      }
    ];
    const prompt = `Analyze this English conversation and provide detailed feedback:

Context: ${context2 || "General conversation"}
User Level: ${user_level || "Unknown"}

Conversation:
User: ${transcript}

Provide comprehensive feedback in JSON format:
{
  "overallAssessment": "general assessment of the conversation",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "corrections": [
    {
      "original": "incorrect phrase",
      "correction": "corrected phrase",
      "explanation": "why this correction is needed"
    }
  ],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "encouragement": "positive feedback message",
  "fluencyScore": 75
}`;
    const aiResponse = await generateChatCompletion(c.env.AI, [
      {
        role: "system",
        content: "You are an experienced English conversation coach. Always respond with valid JSON."
      },
      { role: "user", content: prompt }
    ], {
      temperature: 0.4,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });
    let feedback;
    try {
      const sanitized = sanitizeJsonResponse(aiResponse.text);
      feedback = JSON.parse(sanitized);
    } catch (parseError) {
      log3.warn("Conversation feedback parse error", void 0, {
        component: "INTERNAL_API",
        rawPreview: aiResponse.text?.slice(0, 500),
        sanitizedPreview: sanitizeJsonResponse(aiResponse.text)?.slice(0, 500),
        errorMessage: parseError instanceof Error ? parseError.message : String(parseError),
        model: aiResponse.model
      });
      feedback = {
        overallAssessment: "The conversation shows your effort to communicate in English.",
        strengths: ["Shows willingness to practice English"],
        weaknesses: ["Could benefit from more practice"],
        corrections: [],
        suggestions: ["Continue practicing regularly", "Focus on clear pronunciation"],
        encouragement: "Keep practicing! You're making progress.",
        fluencyScore: 70
      };
    }
    return successResponse(c, {
      feedback,
      analyzed_text: transcript,
      context: context2 || "general",
      user_level: user_level || "unknown",
      user_context: user_context || null,
      processed_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error3) {
    log3.error("Internal conversation feedback error", error3, void 0, { component: "INTERNAL_API" });
    return c.json({
      error: "Conversation feedback generation failed",
      message: error3 instanceof Error ? error3.message : "Unknown error"
    }, 500);
  }
});
internalRoutes.post("/learning-recommendations", async (c) => {
  try {
    const body = await c.req.json();
    const { user_level, weaknesses, strengths, user_context } = body;
    const recommendations = generateStaticRecommendations(user_level, weaknesses);
    return successResponse(c, {
      recommendations,
      user_level: user_level || "B1",
      based_on_weaknesses: weaknesses || [],
      based_on_strengths: strengths || [],
      user_context: user_context || null,
      generated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error3) {
    log3.error("Internal learning recommendations error", error3, void 0, { component: "INTERNAL_API" });
    return c.json({
      error: "Learning recommendations generation failed",
      message: error3 instanceof Error ? error3.message : "Unknown error"
    }, 500);
  }
});
function generateStaticRecommendations(userLevel, weaknesses) {
  const levelContent = {
    "A1": {
      contents: [
        "Basic vocabulary flashcards (colors, numbers, family)",
        "Simple conversation dialogues",
        "English learning apps for beginners",
        "Children's English books"
      ],
      exercises: [
        "Daily greeting practice",
        "Basic sentence construction",
        "Pronunciation drills for common words",
        "Simple Q&A practice"
      ],
      timePerDay: "15-20 minutes"
    },
    "A2": {
      contents: [
        "Elementary reading passages",
        "Basic grammar workbooks",
        "English learning videos for beginners",
        "Simple news articles"
      ],
      exercises: [
        "Present and past tense practice",
        "Describing daily activities",
        "Basic conversation scenarios",
        "Listening to slow English podcasts"
      ],
      timePerDay: "20-30 minutes"
    },
    "B1": {
      contents: [
        "Intermediate reading materials",
        "English podcasts for learners",
        "Grammar reference books",
        "English news articles"
      ],
      exercises: [
        "Conversation role-play scenarios",
        "Grammar pattern drills",
        "Writing short paragraphs",
        "Listening comprehension practice"
      ],
      timePerDay: "30-45 minutes"
    },
    "B2": {
      contents: [
        "Advanced reading materials",
        "TED talks and presentations",
        "English novels and literature",
        "Professional English materials"
      ],
      exercises: [
        "Debate and discussion practice",
        "Academic writing exercises",
        "Business English conversations",
        "Complex listening materials"
      ],
      timePerDay: "45-60 minutes"
    },
    "C1": {
      contents: [
        "Advanced literature excerpts",
        "Native speaker podcasts",
        "Academic papers and articles",
        "Professional development materials"
      ],
      exercises: [
        "Advanced debate topics",
        "Professional presentation practice",
        "Academic writing and research",
        "Nuanced language practice"
      ],
      timePerDay: "60+ minutes"
    },
    "C2": {
      contents: [
        "Native-level literature",
        "Specialized academic content",
        "Professional publications",
        "Cultural and historical materials"
      ],
      exercises: [
        "Advanced writing and editing",
        "Teaching and mentoring others",
        "Professional presentations",
        "Creative language use"
      ],
      timePerDay: "60+ minutes"
    }
  };
  const level = userLevel.toUpperCase();
  const baseRecommendations = levelContent[level] || levelContent["B1"];
  const weaknessRecommendations = {
    "grammar": [
      "Focus on grammar exercises and rules",
      "Use grammar checking tools",
      "Practice sentence construction"
    ],
    "vocabulary": [
      "Expand vocabulary with themed word lists",
      "Use spaced repetition flashcards",
      "Read extensively in your interest areas"
    ],
    "pronunciation": [
      "Practice with pronunciation apps",
      "Record yourself speaking",
      "Listen to native speakers carefully"
    ],
    "fluency": [
      "Practice speaking regularly",
      "Join conversation groups",
      "Think in English daily"
    ]
  };
  let additionalSuggestions = [];
  weaknesses.forEach((weakness) => {
    const suggestions = weaknessRecommendations[weakness.toLowerCase()];
    if (suggestions) {
      additionalSuggestions = additionalSuggestions.concat(suggestions);
    }
  });
  return {
    recommendedContents: baseRecommendations.contents,
    practiceExercises: baseRecommendations.exercises,
    estimatedTimePerDay: baseRecommendations.timePerDay,
    focusAreas: weaknesses,
    additionalSuggestions,
    nextLevelGoals: getNextLevelGoals(level)
  };
}
__name(generateStaticRecommendations, "generateStaticRecommendations");
function getNextLevelGoals(currentLevel) {
  const goals = {
    "A1": ["Master basic grammar patterns", "Build core vocabulary (500-1000 words)", "Have simple conversations"],
    "A2": ["Use past and future tenses confidently", "Describe experiences and events", "Understand simple texts"],
    "B1": ["Express opinions and preferences", "Handle routine tasks requiring English", "Understand main ideas of complex texts"],
    "B2": ["Discuss abstract topics", "Write clear, detailed text", "Interact fluently with native speakers"],
    "C1": ["Use language flexibly for social and professional purposes", "Write well-structured, detailed text", "Understand virtually everything"],
    "C2": ["Express yourself spontaneously and precisely", "Understand everything with ease", "Summarize and argue effectively"]
  };
  return goals[currentLevel] || goals["B1"];
}
__name(getNextLevelGoals, "getNextLevelGoals");
var internal_default = internalRoutes;

// src/routes/auth.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_errors();

// src/services/user.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
init_security();
init_errors();
function mapRowToProfile(row) {
  return {
    id: row.user_id,
    email: row.email ?? void 0,
    name: row.name ?? void 0,
    englishName: row.english_name ?? void 0,
    birthday: row.birthday ?? void 0,
    birthyear: row.birthyear ?? void 0,
    gender: row.gender ?? void 0,
    profileImage: row.profile_image ?? void 0,
    selfBio: row.self_bio ?? void 0,
    location: row.location_id ? {
      id: row.location_id,
      country: row.location_country ?? "",
      city: row.location_city ?? void 0,
      timeZone: row.location_time_zone ?? void 0
    } : void 0,
    nativeLanguage: row.native_lang_id ? {
      id: row.native_lang_id,
      name: row.native_language_name ?? "",
      code: row.native_language_code ?? ""
    } : void 0,
    onboardingCompleted: row.is_onboarding_completed === 1,
    communicationMethod: row.communication_method ?? void 0,
    dailyMinute: row.daily_minute ?? void 0,
    partnerGender: row.partner_gender ?? void 0,
    learningExpectation: row.learning_expectation ?? void 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
__name(mapRowToProfile, "mapRowToProfile");
async function getUserProfile(env2, userId) {
  const row = await queryFirst(
    env2.DB,
    `SELECT 
        u.user_id,
        u.email,
        u.name,
        u.english_name,
        u.birthday,
        u.birthyear,
        u.gender,
        u.profile_image,
        u.self_bio,
        u.location_id,
        u.native_lang_id,
        u.communication_method,
        u.daily_minute,
        u.partner_gender,
        u.learning_expectation,
        u.is_onboarding_completed,
        u.created_at,
        u.updated_at,
        l.country AS location_country,
        l.city AS location_city,
        l.time_zone AS location_time_zone,
        lang.language_name AS native_language_name,
        lang.language_code AS native_language_code
      FROM users u
      LEFT JOIN locations l ON u.location_id = l.location_id
      LEFT JOIN languages lang ON u.native_lang_id = lang.language_id
      WHERE u.user_id = ?
      LIMIT 1`,
    [userId]
  );
  if (!row) {
    return null;
  }
  return mapRowToProfile(row);
}
__name(getUserProfile, "getUserProfile");
async function updateUserProfile(env2, userId, payload) {
  const setters = [];
  const params = [];
  const map = {
    name: "name",
    englishName: "english_name",
    selfBio: "self_bio",
    gender: "gender",
    birthday: "birthday",
    birthyear: "birthyear",
    locationId: "location_id",
    nativeLanguageId: "native_lang_id",
    communicationMethod: "communication_method",
    dailyMinute: "daily_minute",
    partnerGender: "partner_gender",
    learningExpectation: "learning_expectation",
    onboardingCompleted: "is_onboarding_completed",
    profileImage: "profile_image"
  };
  for (const [key, value] of Object.entries(payload)) {
    if (value === void 0) continue;
    if (key === "onboardingCompleted") {
      setters.push(`${map[key]} = ?`);
      params.push(value ? 1 : 0);
    } else {
      setters.push(`${map[key]} = ?`);
      params.push(value === null ? null : value);
    }
  }
  if (setters.length > 0) {
    setters.push("updated_at = ?");
    params.push((/* @__PURE__ */ new Date()).toISOString());
    params.push(userId);
    await execute(env2.DB, `UPDATE users SET ${setters.join(", ")} WHERE user_id = ?`, params);
  }
  const profile3 = await getUserProfile(env2, userId);
  if (!profile3) {
    throw new Error("User not found after update");
  }
  return profile3;
}
__name(updateUserProfile, "updateUserProfile");
async function getUserSettings(env2, userId) {
  const rows = await query(
    env2.DB,
    "SELECT setting_key, setting_value FROM user_settings WHERE user_id = ? ORDER BY setting_key",
    [userId]
  );
  const result = {};
  const notificationPreferences = {};
  for (const row of rows) {
    const [section, key] = row.setting_key.split(".");
    if (!key) continue;
    const rawValue = row.setting_value;
    const normalized = rawValue === "true" ? true : rawValue === "false" ? false : rawValue ?? void 0;
    switch (section) {
      case "notifications":
        if (typeof normalized === "boolean") {
          notificationPreferences[key] = normalized;
        }
        break;
      case "preferences":
        if (key === "language" && typeof normalized === "string") {
          result.language = normalized;
        } else if (key === "timezone" && typeof normalized === "string") {
          result.timeZone = normalized;
        } else if (key === "marketingOptIn" && typeof normalized === "boolean") {
          result.marketingOptIn = normalized;
        }
        break;
      case "privacy":
        break;
      default:
        break;
    }
  }
  if (Object.keys(notificationPreferences).length > 0) {
    result.notificationPreferences = notificationPreferences;
  }
  return result;
}
__name(getUserSettings, "getUserSettings");
async function updateUserSettings(env2, userId, settings) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const entries = [];
  if (settings.language) {
    entries.push(["preferences.language", settings.language]);
  }
  if (settings.timeZone) {
    entries.push(["preferences.timezone", settings.timeZone]);
  }
  if (settings.marketingOptIn !== void 0) {
    entries.push(["preferences.marketingOptIn", String(settings.marketingOptIn)]);
  }
  if (settings.notificationPreferences) {
    for (const [key, value] of Object.entries(settings.notificationPreferences)) {
      entries.push([`notifications.${key}`, String(value)]);
    }
  }
  await transaction(
    env2.DB,
    entries.map(([key, value]) => ({
      sql: "INSERT OR REPLACE INTO user_settings (user_id, setting_key, setting_value, updated_at) VALUES (?, ?, ?, ?)",
      params: [userId, key, value, now]
    }))
  );
  return getUserSettings(env2, userId);
}
__name(updateUserSettings, "updateUserSettings");
async function saveProfileImage(env2, userId, fileName, contentType, body) {
  const safeName = sanitizeFileName(fileName) || "profile-image";
  const key = `users/${userId}/profile/${Date.now()}-${safeName}`;
  await saveToR2(env2.STORAGE, key, body, contentType, {
    userId,
    type: "profile-image"
  });
  await updateUserProfile(env2, userId, { profileImage: key });
  return `/api/v1/upload/file/${key}`;
}
__name(saveProfileImage, "saveProfileImage");
async function deleteProfileImage(env2, userId) {
  const row = await queryFirst(
    env2.DB,
    "SELECT profile_image FROM users WHERE user_id = ? LIMIT 1",
    [userId]
  );
  if (!row) {
    throw new AppError("\uC0AC\uC6A9\uC790\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", 404, "USER_NOT_FOUND");
  }
  const currentKey = row.profile_image ?? void 0;
  if (currentKey) {
    try {
      await deleteFromR2(env2.STORAGE, currentKey);
    } catch (error3) {
      console.warn("[user] Failed to delete profile image from R2", error3);
    }
  }
  await updateUserProfile(env2, userId, { profileImage: null });
}
__name(deleteProfileImage, "deleteProfileImage");
async function listLocations(env2) {
  const rows = await query(
    env2.DB,
    "SELECT location_id, country, city, time_zone FROM locations ORDER BY country, city"
  );
  return rows.map((row) => ({
    id: row.location_id,
    country: row.country,
    city: row.city ?? void 0,
    timeZone: row.time_zone ?? void 0
  }));
}
__name(listLocations, "listLocations");

// src/routes/auth.ts
init_auth();
var authRoutes = new Hono2();
var wrapAuthError = /* @__PURE__ */ __name((error3) => {
  if (error3 instanceof AppError) {
    return error3;
  }
  const message = error3 instanceof Error ? error3.message : "Authentication failure";
  return new AppError(message, 500, "AUTH_OPERATION_FAILED");
}, "wrapAuthError");
authRoutes.get("/login/:provider", async (c) => {
  const provider = c.req.param("provider");
  const target = c.req.query("target") || c.req.query("redirect_uri") || void 0;
  try {
    const result = await generateLoginUrl(c.env, provider, target);
    const acceptHeader = c.req.header("Accept") || "";
    if (!acceptHeader.includes("application/json") && result.url) {
      return c.redirect(result.url);
    }
    return successResponse(c, result);
  } catch (error3) {
    throw wrapAuthError(error3);
  }
});
authRoutes.get("/naver", async (c) => {
  const target = c.req.query("target") || void 0;
  try {
    const result = await generateLoginUrl(c.env, "naver", target);
    if (result.url) {
      return c.redirect(result.url);
    }
    return successResponse(c, result);
  } catch (error3) {
    throw wrapAuthError(error3);
  }
});
authRoutes.get("/google", async (c) => {
  const target = c.req.query("target") || void 0;
  try {
    const result = await generateLoginUrl(c.env, "google", target);
    if (result.url) {
      return c.redirect(result.url);
    }
    return successResponse(c, result);
  } catch (error3) {
    throw wrapAuthError(error3);
  }
});
authRoutes.get("/callback/:provider", async (c) => {
  const provider = c.req.param("provider");
  const code = c.req.query("code");
  const state = c.req.query("state") || void 0;
  if (!code) {
    throw new AppError("Missing OAuth code", 400, "INVALID_OAUTH_CALLBACK");
  }
  try {
    const result = await handleOAuthCallback(
      c.env,
      provider,
      { code, state },
      {
        userAgent: c.req.header("User-Agent") || void 0,
        ipAddress: c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || c.req.header("X-Real-IP") || void 0
      }
    );
    const acceptsJson = (c.req.header("Accept") || "").includes("application/json");
    if (!acceptsJson) {
      const redirectTarget = result.callbackUrl || result.redirectUri;
      if (!redirectTarget) {
        return successResponse(c, result);
      }
      const redirectUrl = new URL(redirectTarget);
      redirectUrl.searchParams.set("accessToken", result.accessToken);
      redirectUrl.searchParams.set("refreshToken", result.refreshToken);
      redirectUrl.searchParams.set("provider", provider);
      if (state) {
        redirectUrl.searchParams.set("state", state);
      }
      if (result.redirectUri && result.redirectUri !== redirectTarget) {
        redirectUrl.searchParams.set("redirect", result.redirectUri);
      }
      return c.redirect(redirectUrl.toString());
    }
    return successResponse(c, result);
  } catch (error3) {
    throw wrapAuthError(error3);
  }
});
authRoutes.post("/refresh", async (c) => {
  const authorization = c.req.header("Authorization");
  if (!authorization) {
    throw new AppError("Authorization header required", 400, "MISSING_AUTH_HEADER");
  }
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new AppError("Invalid Authorization format", 400, "INVALID_AUTH_HEADER");
  }
  const refreshToken = match[1];
  try {
    const result = await refreshTokens(
      c.env,
      refreshToken,
      {
        userAgent: c.req.header("User-Agent") || void 0,
        ipAddress: c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || c.req.header("X-Real-IP") || void 0
      }
    );
    return successResponse(c, result);
  } catch (error3) {
    throw wrapAuthError(error3);
  }
});
authRoutes.post("/logout", async (c) => {
  const authorization = c.req.header("Authorization");
  if (!authorization) {
    throw new AppError("Authorization header required", 400, "MISSING_AUTH_HEADER");
  }
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new AppError("Invalid Authorization format", 400, "INVALID_AUTH_HEADER");
  }
  const accessToken = match[1];
  const refreshToken = c.req.header("X-Refresh-Token") || void 0;
  try {
    await logoutUser(c.env, accessToken, refreshToken);
    return successResponse(c, { success: true });
  } catch (error3) {
    throw wrapAuthError(error3);
  }
});
authRoutes.get("/me", auth(), async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  }
  try {
    const profile3 = await getUserProfile(c.env, userId);
    if (!profile3) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return successResponse(c, {
      id: profile3.id,
      email: profile3.email,
      name: profile3.name ?? profile3.englishName,
      englishName: profile3.englishName,
      onboardingCompleted: profile3.onboardingCompleted
    });
  } catch (error3) {
    throw wrapAuthError(error3);
  }
});
authRoutes.get("/verify", auth(), async (c) => {
  const user = c.get("user");
  return successResponse(c, {
    valid: true,
    user: user ?? null
  });
});
var auth_default = authRoutes;

// src/routes/users.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_errors();

// src/services/onboarding.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
async function listLanguageOptions(env2) {
  return query(
    env2.DB,
    "SELECT language_id, language_name, language_code FROM languages WHERE is_active IS NULL OR is_active = 1 ORDER BY language_name"
  );
}
__name(listLanguageOptions, "listLanguageOptions");
async function listLanguageLevelTypes(env2, category) {
  const normalizedCategory = (category ?? "").trim().toUpperCase();
  return query(
    env2.DB,
    `SELECT
        lang_level_id,
        lang_level_name,
        description,
        category,
        level_order
      FROM lang_level_type
      WHERE (
        category IS NOT NULL AND UPPER(category) = ?
      ) OR (
        category IS NULL AND (
          (? = 'LANGUAGE' AND lang_level_id BETWEEN 100 AND 199) OR
          (? = 'PARTNER' AND lang_level_id BETWEEN 200 AND 299)
        )
      )
      ORDER BY
        CASE WHEN level_order IS NULL THEN 1 ELSE 0 END,
        level_order,
        lang_level_id`,
    [normalizedCategory, normalizedCategory, normalizedCategory]
  );
}
__name(listLanguageLevelTypes, "listLanguageLevelTypes");
async function listTopicOptions(env2) {
  return query(env2.DB, "SELECT topic_id, topic_name, description FROM topic WHERE is_active IS NULL OR is_active = 1 ORDER BY topic_name");
}
__name(listTopicOptions, "listTopicOptions");
async function listPartnerOptions(env2) {
  return query(
    env2.DB,
    "SELECT partner_personality_id, partner_personality, description FROM partner_personality ORDER BY partner_personality"
  );
}
__name(listPartnerOptions, "listPartnerOptions");
async function listScheduleOptions(env2) {
  return query(env2.DB, "SELECT schedule_id, day_of_week, schedule_name, time_slot FROM schedule ORDER BY schedule_id");
}
__name(listScheduleOptions, "listScheduleOptions");
async function listGroupSizeOptions(env2) {
  return query(
    env2.DB,
    "SELECT group_size_id, group_size FROM group_size ORDER BY group_size_id"
  );
}
__name(listGroupSizeOptions, "listGroupSizeOptions");
var DEFAULT_COMMUNICATION_METHODS = [
  {
    id: 1,
    code: "TEXT",
    displayName: "\uD14D\uC2A4\uD2B8 \uC911\uC2EC",
    description: "\uCC44\uD305\uC744 \uC704\uC8FC\uB85C \uD559\uC2B5\uD569\uB2C8\uB2E4.",
    sortOrder: 1
  },
  {
    id: 2,
    code: "VOICE",
    displayName: "\uC74C\uC131 \uC911\uC2EC",
    description: "\uC74C\uC131 \uD1B5\uD654\uB97C \uC911\uC2EC\uC73C\uB85C \uC5F0\uC2B5\uD569\uB2C8\uB2E4.",
    sortOrder: 2
  },
  {
    id: 3,
    code: "VIDEO",
    displayName: "\uC601\uC0C1 \uD1B5\uD654",
    description: "\uC601\uC0C1 \uD1B5\uD654\uB85C \uC2E4\uC2DC\uAC04 \uB300\uD654\uB97C \uC9C4\uD589\uD569\uB2C8\uB2E4.",
    sortOrder: 3
  },
  {
    id: 4,
    code: "HYBRID",
    displayName: "\uC0C1\uD669\uC5D0 \uB9DE\uAC8C",
    description: "\uC0C1\uD669\uC5D0 \uB530\uB77C \uD14D\uC2A4\uD2B8\uC640 \uC74C\uC131\uC744 \uD63C\uD569\uD569\uB2C8\uB2E4.",
    sortOrder: 4
  }
];
function normalizeCommunicationMethods(rows) {
  if (!rows.length) {
    return DEFAULT_COMMUNICATION_METHODS.map((item) => ({ ...item }));
  }
  return rows.map((row, index) => {
    const code = (row.method_code ?? "").trim().toUpperCase();
    if (!code) {
      return null;
    }
    return {
      id: row.communication_method_id ?? index + 1,
      code,
      displayName: row.display_name?.trim() || code,
      description: row.description ?? null,
      sortOrder: row.sort_order ?? index + 1
    };
  }).filter((item) => item !== null).sort((a, b) => {
    if (a.sortOrder === b.sortOrder) {
      return a.id - b.id;
    }
    return a.sortOrder - b.sortOrder;
  });
}
__name(normalizeCommunicationMethods, "normalizeCommunicationMethods");
async function listCommunicationMethodOptions(env2) {
  try {
    const rows = await query(
      env2.DB,
      `SELECT communication_method_id, method_code, display_name, description, sort_order, is_active
       FROM communication_method
       WHERE is_active IS NULL OR is_active = 1
       ORDER BY
         CASE WHEN sort_order IS NULL THEN 1 ELSE 0 END,
         sort_order,
         communication_method_id`
    );
    return normalizeCommunicationMethods(rows);
  } catch (error3) {
    console.warn("[onboarding] communication_method table unavailable, falling back to defaults", error3);
    return DEFAULT_COMMUNICATION_METHODS.map((item) => ({ ...item }));
  }
}
__name(listCommunicationMethodOptions, "listCommunicationMethodOptions");
var DEFAULT_DAILY_MINUTE_OPTIONS = [
  {
    code: "MINUTES_10",
    displayName: "10\uBD84",
    minutes: 10,
    description: "\uD558\uB8E8 10\uBD84 \uD559\uC2B5",
    sortOrder: 1
  },
  {
    code: "MINUTES_15",
    displayName: "15\uBD84",
    minutes: 15,
    description: "\uD558\uB8E8 15\uBD84 \uD559\uC2B5",
    sortOrder: 2
  },
  {
    code: "MINUTES_20",
    displayName: "20\uBD84",
    minutes: 20,
    description: "\uD558\uB8E8 20\uBD84 \uD559\uC2B5",
    sortOrder: 3
  },
  {
    code: "MINUTES_25",
    displayName: "25\uBD84",
    minutes: 25,
    description: "\uD558\uB8E8 25\uBD84 \uD559\uC2B5",
    sortOrder: 4
  },
  {
    code: "MINUTES_30",
    displayName: "30\uBD84",
    minutes: 30,
    description: "\uD558\uB8E8 30\uBD84 \uD559\uC2B5",
    sortOrder: 5
  }
];
async function fetchDailyMinuteRows(env2) {
  try {
    const table3 = await query(
      env2.DB,
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (?, ?)",
      ["daily_minute_option", "daily_minute"]
    );
    if (!table3.length) {
      return [];
    }
    const tableName = table3[0]?.name ?? "daily_minute_option";
    try {
      return await query(
        env2.DB,
        `SELECT
           COALESCE(method_code, code) AS code,
           COALESCE(display_name, name) AS display_name,
           minutes,
           description,
           sort_order
         FROM ${tableName}
         WHERE is_active IS NULL OR is_active = 1
         ORDER BY
           CASE WHEN sort_order IS NULL THEN 1 ELSE 0 END,
           sort_order,
           COALESCE(method_code, code, display_name)`
      );
    } catch (error3) {
      console.warn("[onboarding] daily_minute columns unavailable, falling back to defaults", error3);
      return [];
    }
  } catch (error3) {
    console.warn("[onboarding] daily_minute table unavailable, falling back to defaults", error3);
    return [];
  }
}
__name(fetchDailyMinuteRows, "fetchDailyMinuteRows");
async function listDailyMinuteOptions(env2) {
  const rows = await fetchDailyMinuteRows(env2);
  if (!rows.length) {
    return DEFAULT_DAILY_MINUTE_OPTIONS.map((item) => ({ ...item }));
  }
  return rows.map((row, index) => {
    const code = (row.code ?? "").trim().toUpperCase();
    if (!code) {
      return null;
    }
    return {
      code,
      displayName: row.display_name?.trim() || code,
      minutes: Number.isFinite(row.minutes) ? Number(row.minutes) : DEFAULT_DAILY_MINUTE_OPTIONS[index % DEFAULT_DAILY_MINUTE_OPTIONS.length].minutes,
      description: row.description ?? null,
      sortOrder: row.sort_order ?? index + 1
    };
  }).filter((item) => item !== null).sort((a, b) => {
    if (a.sortOrder === b.sortOrder) {
      return a.minutes - b.minutes;
    }
    return a.sortOrder - b.sortOrder;
  });
}
__name(listDailyMinuteOptions, "listDailyMinuteOptions");
async function listMotivationOptions(env2) {
  return query(
    env2.DB,
    "SELECT motivation_id, motivation_name, description FROM motivation WHERE is_active IS NULL OR is_active = 1 ORDER BY motivation_name"
  );
}
__name(listMotivationOptions, "listMotivationOptions");
async function listLearningStyleOptions(env2) {
  return query(
    env2.DB,
    "SELECT learning_style_id, learning_style_name, description FROM learning_style WHERE is_active IS NULL OR is_active = 1 ORDER BY learning_style_id"
  );
}
__name(listLearningStyleOptions, "listLearningStyleOptions");
async function listLearningExpectationOptions(env2) {
  return query(
    env2.DB,
    "SELECT learning_expectation_id, learning_expectation_name, description FROM learning_expectation WHERE is_active IS NULL OR is_active = 1 ORDER BY learning_expectation_id"
  );
}
__name(listLearningExpectationOptions, "listLearningExpectationOptions");
async function upsertOnboardingLanguages(env2, userId, payload) {
  await transaction(
    env2.DB,
    [
      { sql: "DELETE FROM onboarding_lang_level WHERE user_id = ?", params: [userId] },
      ...payload.map((item) => ({
        sql: `INSERT INTO onboarding_lang_level (user_id, language_id, current_level_id, target_level_id, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?)`,
        params: [
          userId,
          item.languageId,
          item.currentLevelId ?? null,
          item.targetLevelId ?? null,
          (/* @__PURE__ */ new Date()).toISOString(),
          (/* @__PURE__ */ new Date()).toISOString()
        ]
      }))
    ]
  );
}
__name(upsertOnboardingLanguages, "upsertOnboardingLanguages");
async function upsertOnboardingTopics(env2, userId, topicIds) {
  await transaction(
    env2.DB,
    [
      { sql: "DELETE FROM onboarding_topic WHERE user_id = ?", params: [userId] },
      ...topicIds.map((topicId) => ({
        sql: "INSERT INTO onboarding_topic (user_id, topic_id, created_at) VALUES (?, ?, ?)",
        params: [userId, topicId, (/* @__PURE__ */ new Date()).toISOString()]
      }))
    ]
  );
}
__name(upsertOnboardingTopics, "upsertOnboardingTopics");
async function upsertOnboardingPartner(env2, userId, preferences) {
  await transaction(
    env2.DB,
    [
      { sql: "DELETE FROM onboarding_partner WHERE user_id = ?", params: [userId] },
      ...preferences.map((pref) => ({
        sql: "INSERT INTO onboarding_partner (user_id, partner_personality_id, partner_gender, created_at) VALUES (?, ?, ?, ?)",
        params: [userId, pref.partnerPersonalityId, pref.partnerGender ?? null, (/* @__PURE__ */ new Date()).toISOString()]
      }))
    ]
  );
}
__name(upsertOnboardingPartner, "upsertOnboardingPartner");
async function upsertOnboardingSchedules(env2, userId, schedules) {
  await transaction(
    env2.DB,
    [
      { sql: "DELETE FROM onboarding_schedule WHERE user_id = ?", params: [userId] },
      ...schedules.map((item) => ({
        sql: `INSERT INTO onboarding_schedule (user_id, schedule_id, day_of_week, class_time, is_available, created_at)
              VALUES (?, ?, ?, ?, 1, ?)`,
        params: [userId, item.scheduleId, item.dayOfWeek, item.classTime ?? null, (/* @__PURE__ */ new Date()).toISOString()]
      }))
    ]
  );
}
__name(upsertOnboardingSchedules, "upsertOnboardingSchedules");
async function upsertOnboardingGroupSizes(env2, userId, groupSizeIds) {
  const normalized = Array.from(new Set(groupSizeIds.map((value) => Number(value)))).filter((value) => Number.isFinite(value));
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const operations = [
    { sql: "DELETE FROM onboarding_group_size WHERE user_id = ?", params: [userId] },
    ...normalized.map((groupSizeId) => ({
      sql: "INSERT INTO onboarding_group_size (user_id, group_size_id, created_at) VALUES (?, ?, ?)",
      params: [userId, groupSizeId, timestamp]
    }))
  ];
  await transaction(env2.DB, operations);
}
__name(upsertOnboardingGroupSizes, "upsertOnboardingGroupSizes");
async function upsertOnboardingMotivations(env2, userId, motivations) {
  await transaction(
    env2.DB,
    [
      { sql: "DELETE FROM onboarding_motivation WHERE user_id = ?", params: [userId] },
      ...motivations.map((item) => ({
        sql: "INSERT INTO onboarding_motivation (user_id, motivation_id, priority, created_at) VALUES (?, ?, ?, ?)",
        params: [userId, item.motivationId, item.priority ?? null, (/* @__PURE__ */ new Date()).toISOString()]
      }))
    ]
  );
}
__name(upsertOnboardingMotivations, "upsertOnboardingMotivations");
async function upsertOnboardingLearningStyles(env2, userId, learningStyleIds) {
  const normalized = Array.from(new Set(learningStyleIds.map((value) => Number(value)))).filter((value) => Number.isFinite(value));
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const operations = [
    { sql: "DELETE FROM onboarding_learning_style WHERE user_id = ?", params: [userId] },
    ...normalized.map((learningStyleId) => ({
      sql: "INSERT INTO onboarding_learning_style (user_id, learning_style_id, created_at) VALUES (?, ?, ?)",
      params: [userId, learningStyleId, timestamp]
    }))
  ];
  await transaction(env2.DB, operations);
}
__name(upsertOnboardingLearningStyles, "upsertOnboardingLearningStyles");
async function upsertOnboardingLearningExpectations(env2, userId, learningExpectationIds) {
  const normalized = Array.from(new Set(learningExpectationIds.map((value) => Number(value)))).filter((value) => Number.isFinite(value));
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const operations = [
    { sql: "DELETE FROM onboarding_learning_expectation WHERE user_id = ?", params: [userId] },
    ...normalized.map((learningExpectationId, index) => ({
      sql: "INSERT INTO onboarding_learning_expectation (user_id, learning_expectation_id, priority, created_at) VALUES (?, ?, ?, ?)",
      params: [userId, learningExpectationId, index + 1, timestamp]
    }))
  ];
  await transaction(env2.DB, operations);
}
__name(upsertOnboardingLearningExpectations, "upsertOnboardingLearningExpectations");
async function loadOnboardingSummary(env2, userId) {
  const [
    languagesResult,
    topicsResult,
    motivationsResult,
    learningStylesResult,
    groupSizesResult,
    partnersResult,
    schedulesResult
  ] = await env2.DB.batch([
    env2.DB.prepare(
      "SELECT language_id, current_level_id, target_level_id FROM onboarding_lang_level WHERE user_id = ?"
    ).bind(userId),
    env2.DB.prepare("SELECT topic_id FROM onboarding_topic WHERE user_id = ?").bind(userId),
    env2.DB.prepare("SELECT motivation_id, priority FROM onboarding_motivation WHERE user_id = ?").bind(userId),
    env2.DB.prepare("SELECT learning_style_id FROM onboarding_learning_style WHERE user_id = ?").bind(userId),
    env2.DB.prepare("SELECT group_size_id FROM onboarding_group_size WHERE user_id = ?").bind(userId),
    env2.DB.prepare(
      "SELECT partner_personality_id, partner_gender FROM onboarding_partner WHERE user_id = ?"
    ).bind(userId),
    env2.DB.prepare(
      "SELECT schedule_id, day_of_week, class_time FROM onboarding_schedule WHERE user_id = ?"
    ).bind(userId)
  ]);
  const languages = languagesResult.results ?? [];
  const topics = topicsResult.results ?? [];
  const motivations = motivationsResult.results ?? [];
  const learningStyles = learningStylesResult.results ?? [];
  const groupSizes = groupSizesResult.results ?? [];
  const partners = partnersResult.results ?? [];
  const scheduleRows = schedulesResult.results ?? [];
  const profile3 = await getUserProfile(env2, userId);
  return {
    languages: languages.map((item) => ({
      languageId: item.language_id,
      currentLevelId: item.current_level_id ?? void 0,
      targetLevelId: item.target_level_id ?? void 0
    })),
    topics: topics.map((item) => item.topic_id),
    motivations: motivations.map((item) => ({
      motivationId: item.motivation_id,
      priority: item.priority ?? void 0
    })),
    learningStyles: learningStyles.map((item) => item.learning_style_id),
    groupSizes: groupSizes.map((item) => item.group_size_id),
    partnerPreferences: partners.map((item) => ({
      partnerPersonalityId: item.partner_personality_id,
      partnerGender: item.partner_gender ?? void 0
    })),
    schedules: scheduleRows.map((item) => ({
      scheduleId: item.schedule_id,
      dayOfWeek: item.day_of_week,
      classTime: item.class_time ?? void 0
    })),
    communicationMethod: profile3?.communicationMethod ?? void 0
  };
}
__name(loadOnboardingSummary, "loadOnboardingSummary");
async function completeOnboarding(env2, userId, payload = {}) {
  if (payload.targetLanguages) {
    await upsertOnboardingLanguages(env2, userId, payload.targetLanguages);
  }
  if (payload.topicIds) {
    await upsertOnboardingTopics(env2, userId, payload.topicIds);
  }
  if (payload.motivationIds) {
    await upsertOnboardingMotivations(
      env2,
      userId,
      payload.motivationIds.map((id, index) => ({ motivationId: id, priority: index + 1 }))
    );
  }
  if (payload.partnerPersonalityIds) {
    const preferences = payload.partnerPersonalityIds.map(
      (item) => typeof item === "number" ? { partnerPersonalityId: item } : item
    );
    await upsertOnboardingPartner(env2, userId, preferences);
  }
  if (payload.groupSizeIds) {
    await upsertOnboardingGroupSizes(env2, userId, payload.groupSizeIds);
  }
  if (payload.scheduleIds) {
    const schedules = payload.scheduleIds.map(
      (item) => typeof item === "number" ? { scheduleId: item, dayOfWeek: "UNKNOWN", classTime: null } : item
    );
    await upsertOnboardingSchedules(env2, userId, schedules);
  }
  if (payload.learningStyleIds) {
    await upsertOnboardingLearningStyles(env2, userId, payload.learningStyleIds);
  }
  if (payload.learningExpectationIds) {
    await upsertOnboardingLearningExpectations(env2, userId, payload.learningExpectationIds);
  }
  const profileUpdates = {
    nativeLanguageId: payload.nativeLanguageId ?? null,
    onboardingCompleted: true
  };
  if (typeof payload.communicationMethod === "string" && payload.communicationMethod.trim()) {
    profileUpdates.communicationMethod = payload.communicationMethod.trim().toUpperCase();
  }
  await updateUserProfile(env2, userId, profileUpdates);
}
__name(completeOnboarding, "completeOnboarding");

// src/routes/users.ts
function toUpdatePayload(body) {
  const payload = {};
  if (typeof body.name === "string") payload.name = body.name.trim();
  if (typeof body.englishName === "string") payload.englishName = body.englishName.trim();
  if (typeof body.selfBio === "string") payload.selfBio = body.selfBio.trim();
  if (typeof body.gender === "string") payload.gender = body.gender;
  if (typeof body.birthday === "string") payload.birthday = body.birthday;
  if (typeof body.birthyear === "string") payload.birthyear = body.birthyear;
  if (typeof body.communicationMethod === "string") payload.communicationMethod = body.communicationMethod;
  if (typeof body.dailyMinute === "string") payload.dailyMinute = body.dailyMinute;
  if (typeof body.partnerGender === "string") payload.partnerGender = body.partnerGender;
  if (typeof body.learningExpectation === "string") payload.learningExpectation = body.learningExpectation;
  if (typeof body.onboardingCompleted === "boolean") payload.onboardingCompleted = body.onboardingCompleted;
  const locationId = typeof body.locationId === "number" ? body.locationId : typeof body.location === "object" && body.location !== null && typeof body.location.id === "number" ? body.location.id : void 0;
  if (locationId !== void 0) payload.locationId = locationId;
  const nativeLanguageId = typeof body.nativeLanguageId === "number" ? body.nativeLanguageId : typeof body.nativeLanguage === "object" && body.nativeLanguage !== null && typeof body.nativeLanguage.id === "number" ? body.nativeLanguage.id : void 0;
  if (nativeLanguageId !== void 0) payload.nativeLanguageId = nativeLanguageId;
  return payload;
}
__name(toUpdatePayload, "toUpdatePayload");
async function processProfileImageUpload(c, userId) {
  const contentType = c.req.header("Content-Type");
  if (!contentType?.startsWith("multipart/form-data")) {
    throw new AppError("multipart/form-data required", 400, "INVALID_CONTENT_TYPE");
  }
  const formData = await c.req.formData();
  const fileEntry = formData.get("file") ?? formData.get("image");
  if (!fileEntry || typeof fileEntry === "string") {
    throw new AppError("image field required", 400, "INVALID_FORM_DATA");
  }
  const uploadFile = fileEntry;
  const arrayBuffer = await uploadFile.arrayBuffer();
  return saveProfileImage(
    c.env,
    userId,
    uploadFile.name,
    uploadFile.type || "application/octet-stream",
    arrayBuffer
  );
}
__name(processProfileImageUpload, "processProfileImageUpload");
var usersRoutes = new Hono2();
var requireAuth = auth();
var wrapError = /* @__PURE__ */ __name((error3, feature) => {
  if (error3 instanceof AppError) {
    return error3;
  }
  const message = error3 instanceof Error ? error3.message : `${feature} failed`;
  return new AppError(message, 500, "USER_OPERATION_FAILED");
}, "wrapError");
async function buildLanguageInfo(env2, userId) {
  const [profile3, summary, languageOptions] = await Promise.all([
    getUserProfile(env2, userId),
    loadOnboardingSummary(env2, userId),
    listLanguageOptions(env2)
  ]);
  const languageMap = new Map(
    languageOptions.map((item) => [item.language_id, item])
  );
  const nativeLanguageId = profile3?.nativeLanguage?.id ?? (summary.languages.length > 0 ? summary.languages[0].languageId : void 0);
  const nativeLanguage = nativeLanguageId ? {
    languageId: nativeLanguageId,
    languageName: languageMap.get(nativeLanguageId)?.language_name ?? null,
    languageCode: languageMap.get(nativeLanguageId)?.language_code ?? null
  } : null;
  const targetLanguages = summary.languages.filter((item) => item.languageId !== nativeLanguageId).map((item) => ({
    languageId: item.languageId,
    languageName: languageMap.get(item.languageId)?.language_name ?? null,
    currentLevelId: item.currentLevelId ?? void 0,
    targetLevelId: item.targetLevelId ?? void 0
  }));
  return {
    nativeLanguage,
    targetLanguages
  };
}
__name(buildLanguageInfo, "buildLanguageInfo");
async function buildMotivationInfo(env2, userId) {
  const [summary, motivationOptions, topicOptions] = await Promise.all([
    loadOnboardingSummary(env2, userId),
    listMotivationOptions(env2),
    listTopicOptions(env2)
  ]);
  const motivationMap = new Map(motivationOptions.map((item) => [item.motivation_id, item.motivation_name]));
  const topicMap = new Map(topicOptions.map((item) => [item.topic_id, item.topic_name]));
  return {
    motivations: summary.motivations.map((item) => ({
      motivationId: item.motivationId,
      priority: item.priority,
      name: motivationMap.get(item.motivationId) ?? null
    })),
    topics: summary.topics.map((id) => ({
      topicId: id,
      name: topicMap.get(id) ?? null
    }))
  };
}
__name(buildMotivationInfo, "buildMotivationInfo");
async function buildPartnerInfo(env2, userId) {
  const summary = await loadOnboardingSummary(env2, userId);
  return {
    partners: summary.partnerPreferences,
    groupSizes: summary.groupSizes
  };
}
__name(buildPartnerInfo, "buildPartnerInfo");
async function buildScheduleInfo(env2, userId) {
  const summary = await loadOnboardingSummary(env2, userId);
  return {
    schedules: summary.schedules
  };
}
__name(buildScheduleInfo, "buildScheduleInfo");
usersRoutes.use("*", requireAuth);
usersRoutes.get("/me/profile", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    const profile3 = await getUserProfile(c.env, userId);
    if (!profile3) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return successResponse(c, profile3);
  } catch (error3) {
    throw wrapError(error3, "GET /api/v1/users/me/profile");
  }
});
usersRoutes.get("/profile", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    const profile3 = await getUserProfile(c.env, userId);
    if (!profile3) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return successResponse(c, profile3);
  } catch (error3) {
    throw wrapError(error3, "GET /api/v1/user/profile");
  }
});
usersRoutes.put("/me/profile", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  const body = await c.req.json();
  const payload = toUpdatePayload(body);
  try {
    const profile3 = await updateUserProfile(c.env, userId, payload);
    return successResponse(c, profile3);
  } catch (error3) {
    throw wrapError(error3, "PUT /api/v1/users/me/profile");
  }
});
usersRoutes.patch("/profile", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  const body = await c.req.json();
  const payload = toUpdatePayload(body);
  try {
    const profile3 = await updateUserProfile(c.env, userId, payload);
    return successResponse(c, profile3);
  } catch (error3) {
    throw wrapError(error3, "PATCH /api/v1/user/profile");
  }
});
usersRoutes.get("/complete-profile", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    const profile3 = await getUserProfile(c.env, userId);
    return successResponse(c, profile3);
  } catch (error3) {
    throw wrapError(error3, "GET /api/v1/user/complete-profile");
  }
});
usersRoutes.put("/complete-profile", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  const body = await c.req.json();
  const payload = toUpdatePayload(body);
  try {
    const profile3 = await updateUserProfile(c.env, userId, payload);
    return successResponse(c, profile3);
  } catch (error3) {
    throw wrapError(error3, "PUT /api/v1/user/complete-profile");
  }
});
usersRoutes.get("/me/settings", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    const settings = await getUserSettings(c.env, userId);
    return successResponse(c, settings);
  } catch (error3) {
    throw wrapError(error3, "GET /api/v1/users/me/settings");
  }
});
usersRoutes.get("/settings", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    const settings = await getUserSettings(c.env, userId);
    return successResponse(c, settings);
  } catch (error3) {
    throw wrapError(error3, "GET /api/v1/user/settings");
  }
});
usersRoutes.put("/me/settings", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  const body = await c.req.json();
  try {
    const settings = await updateUserSettings(c.env, userId, body);
    return successResponse(c, settings);
  } catch (error3) {
    throw wrapError(error3, "PUT /api/v1/users/me/settings");
  }
});
usersRoutes.put("/settings", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  const body = await c.req.json();
  try {
    const settings = await updateUserSettings(c.env, userId, body);
    return successResponse(c, settings);
  } catch (error3) {
    throw wrapError(error3, "PUT /api/v1/user/settings");
  }
});
usersRoutes.post("/me/profile-image", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    const location = await processProfileImageUpload(c, userId);
    return successResponse(c, { url: location });
  } catch (error3) {
    throw wrapError(error3, "POST /api/v1/users/me/profile-image");
  }
});
usersRoutes.get("/language-info", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    const info3 = await buildLanguageInfo(c.env, userId);
    return successResponse(c, info3);
  } catch (error3) {
    throw wrapError(error3, "GET /api/v1/user/language-info");
  }
});
usersRoutes.patch("/language-info", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  const body = await c.req.json();
  const languages = Array.isArray(body?.languages) ? body.languages : [];
  const languagePayload = [];
  for (const raw2 of languages) {
    const languageId = Number(raw2.languageId ?? raw2.language_id);
    if (!Number.isFinite(languageId)) {
      continue;
    }
    languagePayload.push({
      languageId,
      currentLevelId: raw2.currentLevelId ?? raw2.current_level_id ?? void 0,
      targetLevelId: raw2.targetLevelId ?? raw2.target_level_id ?? void 0
    });
  }
  await upsertOnboardingLanguages(c.env, userId, languagePayload);
  if (Number.isFinite(body?.nativeLanguageId)) {
    await updateUserProfile(c.env, userId, { nativeLanguageId: Number(body.nativeLanguageId) });
  }
  const info3 = await buildLanguageInfo(c.env, userId);
  return successResponse(c, info3);
});
usersRoutes.get("/motivation-info", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    const info3 = await buildMotivationInfo(c.env, userId);
    return successResponse(c, info3);
  } catch (error3) {
    throw wrapError(error3, "GET /api/v1/user/motivation-info");
  }
});
usersRoutes.patch("/motivation-info", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  const body = await c.req.json();
  const motivationIds = Array.isArray(body?.motivationIds) ? body.motivationIds : [];
  const motivationPayload = [];
  motivationIds.forEach((raw2, index) => {
    const motivationId = Number(raw2);
    if (!Number.isFinite(motivationId)) {
      return;
    }
    motivationPayload.push({
      motivationId,
      priority: index + 1
    });
  });
  await upsertOnboardingMotivations(c.env, userId, motivationPayload);
  const info3 = await buildMotivationInfo(c.env, userId);
  return successResponse(c, info3);
});
usersRoutes.get("/partner-info", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    const info3 = await buildPartnerInfo(c.env, userId);
    return successResponse(c, info3);
  } catch (error3) {
    throw wrapError(error3, "GET /api/v1/user/partner-info");
  }
});
usersRoutes.patch("/partner-info", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  const body = await c.req.json();
  const preferences = Array.isArray(body?.partnerPreferences) ? body.partnerPreferences : [];
  const partnerPayload = [];
  preferences.forEach((raw2) => {
    const partnerPersonalityId = Number(raw2.partnerPersonalityId ?? raw2.partner_personality_id ?? raw2);
    if (!Number.isFinite(partnerPersonalityId)) {
      return;
    }
    partnerPayload.push({
      partnerPersonalityId,
      partnerGender: raw2.partnerGender ?? raw2.partner_gender ?? void 0
    });
  });
  await upsertOnboardingPartner(c.env, userId, partnerPayload);
  const info3 = await buildPartnerInfo(c.env, userId);
  return successResponse(c, info3);
});
usersRoutes.get("/schedule-info", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    const info3 = await buildScheduleInfo(c.env, userId);
    return successResponse(c, info3);
  } catch (error3) {
    throw wrapError(error3, "GET /api/v1/user/schedule-info");
  }
});
usersRoutes.patch("/schedule-info", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  const body = await c.req.json();
  const schedules = Array.isArray(body?.schedules) ? body.schedules : [];
  const normalized = [];
  schedules.forEach((raw2) => {
    const scheduleId = Number(raw2.scheduleId ?? raw2.schedule_id);
    if (!Number.isFinite(scheduleId)) {
      return;
    }
    normalized.push({
      scheduleId,
      dayOfWeek: raw2.dayOfWeek ?? raw2.day_of_week ?? "UNKNOWN",
      classTime: raw2.classTime ?? raw2.class_time ?? void 0
    });
  });
  await upsertOnboardingSchedules(c.env, userId, normalized);
  const info3 = await buildScheduleInfo(c.env, userId);
  return successResponse(c, info3);
});
usersRoutes.get("/me/profile-image", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    const profile3 = await getUserProfile(c.env, userId);
    if (!profile3) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return successResponse(c, { profileImage: profile3.profileImage });
  } catch (error3) {
    throw wrapError(error3, "GET /api/v1/users/me/profile-image");
  }
});
usersRoutes.post("/profile-image", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    const location = await processProfileImageUpload(c, userId);
    return successResponse(c, { url: location });
  } catch (error3) {
    throw wrapError(error3, "POST /api/v1/user/profile-image");
  }
});
usersRoutes.post("/profile/image", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    const location = await processProfileImageUpload(c, userId);
    return successResponse(c, { url: location });
  } catch (error3) {
    throw wrapError(error3, "POST /api/v1/users/profile/image");
  }
});
usersRoutes.delete("/profile-image", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    await deleteProfileImage(c.env, userId);
    return successResponse(c, { success: true });
  } catch (error3) {
    throw wrapError(error3, "DELETE /api/v1/user/profile-image");
  }
});
usersRoutes.delete("/profile/image", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    await deleteProfileImage(c.env, userId);
    return successResponse(c, { success: true });
  } catch (error3) {
    throw wrapError(error3, "DELETE /api/v1/users/profile/image");
  }
});
usersRoutes.get("/profile-image", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    const profile3 = await getUserProfile(c.env, userId);
    if (!profile3) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return successResponse(c, { profileImage: profile3.profileImage });
  } catch (error3) {
    throw wrapError(error3, "GET /api/v1/user/profile-image");
  }
});
usersRoutes.get("/me/name", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    const profile3 = await getUserProfile(c.env, userId);
    if (!profile3) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return successResponse(c, { name: profile3.name });
  } catch (error3) {
    throw wrapError(error3, "GET /api/v1/users/me/name");
  }
});
usersRoutes.get("/info", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    const profile3 = await getUserProfile(c.env, userId);
    if (!profile3) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return successResponse(c, {
      id: profile3.id,
      email: profile3.email,
      englishName: profile3.englishName,
      name: profile3.name,
      onboardingCompleted: profile3.onboardingCompleted
    });
  } catch (error3) {
    throw wrapError(error3, "GET /api/v1/user/info");
  }
});
usersRoutes.get("/name", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    const profile3 = await getUserProfile(c.env, userId);
    if (!profile3) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return successResponse(c, { name: profile3.name ?? profile3.englishName });
  } catch (error3) {
    throw wrapError(error3, "GET /api/v1/user/name");
  }
});
usersRoutes.get("/me/onboarding-status", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  try {
    const profile3 = await getUserProfile(c.env, userId);
    if (!profile3) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return successResponse(c, { completed: profile3.onboardingCompleted });
  } catch (error3) {
    throw wrapError(error3, "GET /api/v1/users/me/onboarding-status");
  }
});
usersRoutes.get("/onboarding-status", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  const profile3 = await getUserProfile(c.env, userId);
  if (!profile3) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }
  return successResponse(c, { completed: profile3.onboardingCompleted });
});
usersRoutes.post("/complete-onboarding", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  const body = await c.req.json().catch(() => ({}));
  await completeOnboarding(c.env, userId, body ?? {});
  return successResponse(c, { completed: true });
});
usersRoutes.post("/me/english-name", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  if (typeof body.englishName !== "string" || !body.englishName.trim()) {
    throw new AppError("englishName is required", 400, "INVALID_PAYLOAD");
  }
  await updateUserProfile(c.env, userId, { englishName: body.englishName.trim() });
  return successResponse(c, { englishName: body.englishName.trim() });
});
usersRoutes.post("/english-name", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  if (typeof body.englishName !== "string" || !body.englishName.trim()) {
    throw new AppError("englishName is required", 400, "INVALID_PAYLOAD");
  }
  await updateUserProfile(c.env, userId, { englishName: body.englishName.trim() });
  return successResponse(c, { englishName: body.englishName.trim() });
});
usersRoutes.post("/me/birthyear", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  if (typeof body.birthyear !== "string" || !body.birthyear.trim()) {
    throw new AppError("birthyear is required", 400, "INVALID_PAYLOAD");
  }
  await updateUserProfile(c.env, userId, { birthyear: body.birthyear.trim() });
  return successResponse(c, { birthyear: body.birthyear.trim() });
});
usersRoutes.post("/birthyear", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  if (typeof body.birthYear !== "string" && typeof body.birthyear !== "string") {
    throw new AppError("birthyear is required", 400, "INVALID_PAYLOAD");
  }
  const value = (body.birthYear ?? body.birthyear).toString().trim();
  if (!value) {
    throw new AppError("birthyear is required", 400, "INVALID_PAYLOAD");
  }
  await updateUserProfile(c.env, userId, { birthyear: value });
  return successResponse(c, { birthyear: value });
});
usersRoutes.post("/me/birthday", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  if (typeof body.birthday !== "string" || !body.birthday.trim()) {
    throw new AppError("birthday is required", 400, "INVALID_PAYLOAD");
  }
  await updateUserProfile(c.env, userId, { birthday: body.birthday.trim() });
  return successResponse(c, { birthday: body.birthday.trim() });
});
usersRoutes.post("/birthday", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  const value = typeof body.birthday === "string" ? body.birthday.trim() : "";
  if (!value) {
    throw new AppError("birthday is required", 400, "INVALID_PAYLOAD");
  }
  await updateUserProfile(c.env, userId, { birthday: value });
  return successResponse(c, { birthday: value });
});
usersRoutes.post("/me/gender", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  if (typeof body.gender !== "string" || !body.gender.trim()) {
    throw new AppError("gender is required", 400, "INVALID_PAYLOAD");
  }
  await updateUserProfile(c.env, userId, { gender: body.gender.trim() });
  return successResponse(c, { gender: body.gender.trim() });
});
usersRoutes.post("/gender", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  const gender = (body.gender ?? body.genderType)?.toString().trim();
  if (!gender) {
    throw new AppError("gender is required", 400, "INVALID_PAYLOAD");
  }
  await updateUserProfile(c.env, userId, { gender });
  return successResponse(c, { gender });
});
usersRoutes.post("/me/self-bio", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  if (typeof body.selfBio !== "string") {
    throw new AppError("selfBio is required", 400, "INVALID_PAYLOAD");
  }
  await updateUserProfile(c.env, userId, { selfBio: body.selfBio });
  return successResponse(c, { selfBio: body.selfBio });
});
usersRoutes.post("/self-bio", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  const selfBio = typeof body.selfBio === "string" ? body.selfBio : "";
  await updateUserProfile(c.env, userId, { selfBio });
  return successResponse(c, { selfBio });
});
usersRoutes.post("/me/location", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  const locationId = typeof body.locationId === "number" ? body.locationId : void 0;
  if (locationId === void 0) {
    throw new AppError("locationId is required", 400, "INVALID_PAYLOAD");
  }
  await updateUserProfile(c.env, userId, { locationId });
  return successResponse(c, { locationId });
});
usersRoutes.post("/location", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  const locationId = Number(body.locationId ?? body.location_id);
  if (!Number.isFinite(locationId)) {
    throw new AppError("locationId is required", 400, "INVALID_PAYLOAD");
  }
  await updateUserProfile(c.env, userId, { locationId });
  return successResponse(c, { locationId });
});
usersRoutes.get("/stats", async (c) => {
  return successResponse(c, {
    sessionsThisWeek: 0,
    totalSessions: 0,
    totalMinutes: 0
  });
});
usersRoutes.delete("/account", async (c) => {
  return successResponse(c, {
    success: false,
    message: "Account deletion is not supported on the Workers API yet."
  });
});
usersRoutes.get("/gender-type", async (c) => {
  return successResponse(c, [
    { id: "MALE", name: "\uB0A8\uC131" },
    { id: "FEMALE", name: "\uC5EC\uC131" },
    { id: "OTHER", name: "\uAE30\uD0C0" }
  ]);
});
usersRoutes.get("/locations", async (c) => {
  try {
    const locations = await listLocations(c.env);
    return successResponse(c, locations);
  } catch (error3) {
    throw wrapError(error3, "GET /api/v1/users/locations");
  }
});
var users_default = usersRoutes;

// src/routes/onboarding.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_errors();

// src/services/onboardingState.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var PREFIX = "onboarding";
var STEP_PREFIX = `${PREFIX}:step`;
var PROGRESS_PREFIX = `${PREFIX}:progress`;
var SESSION_PREFIX = `${PREFIX}:session`;
var DEFAULT_STEP_TTL = 60 * 60 * 24 * 7;
var SESSION_TTL = 60 * 60 * 2;
function buildStepKey(userId, stepNumber) {
  return `${STEP_PREFIX}:${userId}:${stepNumber}`;
}
__name(buildStepKey, "buildStepKey");
function buildProgressKey(userId) {
  return `${PROGRESS_PREFIX}:${userId}`;
}
__name(buildProgressKey, "buildProgressKey");
function buildSessionKey(userId) {
  return `${SESSION_PREFIX}:${userId}`;
}
__name(buildSessionKey, "buildSessionKey");
async function saveOnboardingStep(env2, userId, stepNumber, payload, totalSteps, estimatedMinutesRemaining) {
  const stepKey = buildStepKey(userId, stepNumber);
  const nowIso7 = (/* @__PURE__ */ new Date()).toISOString();
  const stepData = {
    stepNumber,
    savedAt: nowIso7,
    isCompleted: true,
    payload
  };
  await env2.CACHE.put(stepKey, JSON.stringify(stepData), { expirationTtl: DEFAULT_STEP_TTL });
  await updateOnboardingProgress(env2, userId, stepNumber, totalSteps, estimatedMinutesRemaining);
}
__name(saveOnboardingStep, "saveOnboardingStep");
async function getOnboardingStep(env2, userId, stepNumber) {
  const raw2 = await env2.CACHE.get(buildStepKey(userId, stepNumber), { type: "json" });
  return raw2 ?? null;
}
__name(getOnboardingStep, "getOnboardingStep");
async function saveOnboardingSessionDraft(env2, userId, payload) {
  const draft = {
    lastAutoSavedAt: (/* @__PURE__ */ new Date()).toISOString(),
    payload
  };
  await env2.CACHE.put(buildSessionKey(userId), JSON.stringify(draft), { expirationTtl: SESSION_TTL });
}
__name(saveOnboardingSessionDraft, "saveOnboardingSessionDraft");
async function getOnboardingSessionDraft(env2, userId) {
  const raw2 = await env2.CACHE.get(buildSessionKey(userId), { type: "json" });
  return raw2 ?? null;
}
__name(getOnboardingSessionDraft, "getOnboardingSessionDraft");
async function clearOnboardingState(env2, userId) {
  const progressKey2 = buildProgressKey(userId);
  const list = await env2.CACHE.list({ prefix: `${STEP_PREFIX}:${userId}` });
  await Promise.all([
    env2.CACHE.delete(progressKey2),
    env2.CACHE.delete(buildSessionKey(userId)),
    ...list.keys.map((key) => env2.CACHE.delete(key.name))
  ]);
}
__name(clearOnboardingState, "clearOnboardingState");
async function getOnboardingProgress(env2, userId, totalSteps) {
  const progressKey2 = buildProgressKey(userId);
  const raw2 = await env2.CACHE.get(progressKey2, { type: "json" });
  if (raw2) {
    return raw2;
  }
  return {
    completedSteps: {},
    currentStep: 1,
    progressPercentage: 0,
    totalSteps,
    lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    completed: false
  };
}
__name(getOnboardingProgress, "getOnboardingProgress");
async function updateOnboardingProgress(env2, userId, completedStep, totalSteps, estimatedMinutesRemaining) {
  const progressKey2 = buildProgressKey(userId);
  const current = await getOnboardingProgress(env2, userId, totalSteps);
  const completedSteps = { ...current.completedSteps, [`step${completedStep}`]: true };
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercentage = Math.min(completedCount / totalSteps * 100, 100);
  const progress = {
    completedSteps,
    currentStep: Math.min(completedStep + 1, totalSteps),
    progressPercentage,
    totalSteps,
    lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    completed: completedCount >= totalSteps,
    estimatedMinutesRemaining
  };
  await env2.CACHE.put(progressKey2, JSON.stringify(progress), {
    expirationTtl: DEFAULT_STEP_TTL
  });
}
__name(updateOnboardingProgress, "updateOnboardingProgress");
async function resetOnboardingProgress(env2, userId, totalSteps) {
  const progress = {
    completedSteps: {},
    currentStep: 1,
    progressPercentage: 0,
    totalSteps,
    lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    completed: false
  };
  await env2.CACHE.put(buildProgressKey(userId), JSON.stringify(progress), {
    expirationTtl: DEFAULT_STEP_TTL
  });
}
__name(resetOnboardingProgress, "resetOnboardingProgress");

// src/routes/onboarding.ts
var onboardingRoutes = new Hono2();
var requireAuth2 = auth();
var TOTAL_ONBOARDING_STEPS = 8;
var wrapError2 = /* @__PURE__ */ __name((error3, fallback) => {
  if (error3 instanceof AppError) {
    return error3;
  }
  const message = error3 instanceof Error ? error3.message : fallback;
  return new AppError(message, 500, "ONBOARDING_ERROR");
}, "wrapError");
function normalizeStepPayload(raw2) {
  if (raw2 && typeof raw2.stepData === "object" && raw2.stepData !== null) {
    return raw2.stepData;
  }
  return raw2;
}
__name(normalizeStepPayload, "normalizeStepPayload");
async function getStepPayload(env2, userId, step) {
  const record = await getOnboardingStep(env2, userId, step);
  return record?.payload ?? null;
}
__name(getStepPayload, "getStepPayload");
async function buildOnboardingData(env2, userId) {
  const [
    profile3,
    step1,
    step2,
    step3,
    step4,
    progress,
    languages,
    motivations,
    topics,
    learningStyles,
    learningExpectations
  ] = await Promise.all([
    getUserProfile(env2, userId),
    getStepPayload(env2, userId, 1),
    getStepPayload(env2, userId, 2),
    getStepPayload(env2, userId, 3),
    getStepPayload(env2, userId, 4),
    getOnboardingProgress(env2, userId, TOTAL_ONBOARDING_STEPS),
    listLanguageOptions(env2),
    listMotivationOptions(env2),
    listTopicOptions(env2),
    listLearningStyleOptions(env2),
    listLearningExpectationOptions(env2)
  ]);
  const step1Payload = step1 ?? {};
  const step2Payload = step2 ?? {};
  const step3Payload = step3 ?? {};
  const step4Payload = step4 ?? {};
  const userOnboardingData = {
    englishName: step1Payload?.englishName ?? profile3?.englishName ?? profile3?.name,
    profileImageUrl: step1Payload?.profileImage ?? profile3?.profileImage,
    residence: step1Payload?.residence ?? profile3?.location?.country ?? null,
    intro: step1Payload?.intro ?? profile3?.selfBio ?? "",
    nativeLanguageId: step2Payload?.nativeLanguageId ?? step2Payload?.languageId ?? profile3?.nativeLanguage?.id ?? null,
    targetLanguages: step2Payload?.targetLanguages ?? [],
    motivationIds: step3Payload?.motivationIds ?? step3Payload?.motivations ?? [],
    topicIds: step4Payload?.topicIds ?? step3Payload?.topicIds ?? [],
    learningStyleIds: step4Payload?.learningStyleIds ?? [],
    learningExpectationIds: step4Payload?.learningExpectationIds ?? [],
    completed: progress.completed
  };
  return {
    userOnboardingData,
    availableOptions: {
      languages,
      motivations,
      topics,
      learningStyles: learningStyles.map((item) => ({
        id: item.learning_style_id,
        name: item.learning_style_name,
        description: item.description ?? void 0
      })),
      learningExpectations: learningExpectations.map((item) => ({
        id: item.learning_expectation_id,
        name: item.learning_expectation_name,
        description: item.description ?? void 0
      }))
    }
  };
}
__name(buildOnboardingData, "buildOnboardingData");
onboardingRoutes.get("/languages", async (c) => {
  try {
    const data = await listLanguageOptions(c.env);
    return successResponse(c, data);
  } catch (error3) {
    throw wrapError2(error3, "Failed to load language options");
  }
});
onboardingRoutes.get("/language/languages", async (c) => {
  try {
    const data = await listLanguageOptions(c.env);
    return successResponse(c, data);
  } catch (error3) {
    throw wrapError2(error3, "Failed to load language options");
  }
});
onboardingRoutes.get("/language/level-types-language", async (c) => {
  try {
    const rows = await listLanguageLevelTypes(c.env, "LANGUAGE");
    const data = rows.map((row) => ({
      id: row.lang_level_id,
      name: row.lang_level_name,
      description: row.description ?? void 0,
      category: row.category ?? void 0,
      order: row.level_order ?? void 0
    }));
    return successResponse(c, data);
  } catch (error3) {
    throw wrapError2(error3, "Failed to load language level types");
  }
});
onboardingRoutes.get("/language/level-types-partner", async (c) => {
  try {
    const rows = await listLanguageLevelTypes(c.env, "PARTNER");
    const data = rows.map((row) => ({
      id: row.lang_level_id,
      name: row.lang_level_name,
      description: row.description ?? void 0,
      category: row.category ?? void 0,
      order: row.level_order ?? void 0
    }));
    return successResponse(c, data);
  } catch (error3) {
    throw wrapError2(error3, "Failed to load partner level types");
  }
});
onboardingRoutes.get("/interests", async (c) => {
  try {
    const data = await listTopicOptions(c.env);
    return successResponse(c, data);
  } catch (error3) {
    throw wrapError2(error3, "Failed to load interests");
  }
});
onboardingRoutes.get("/interest/motivations", async (c) => {
  try {
    const data = await listMotivationOptions(c.env);
    return successResponse(c, data);
  } catch (error3) {
    throw wrapError2(error3, "Failed to load motivation options");
  }
});
onboardingRoutes.get("/interest/topics", async (c) => {
  try {
    const data = await listTopicOptions(c.env);
    return successResponse(c, data);
  } catch (error3) {
    throw wrapError2(error3, "Failed to load interests");
  }
});
onboardingRoutes.get("/interest/learning-styles", async (c) => {
  try {
    const rows = await listLearningStyleOptions(c.env);
    const data = rows.map((item) => ({
      learningStyleId: item.learning_style_id,
      learningStyleName: item.learning_style_name,
      description: item.description ?? void 0
    }));
    return successResponse(c, data);
  } catch (error3) {
    throw wrapError2(error3, "Failed to load learning style options");
  }
});
onboardingRoutes.get("/interest/learning-expectations", async (c) => {
  try {
    const rows = await listLearningExpectationOptions(c.env);
    const data = rows.map((item) => ({
      learningExpectationId: item.learning_expectation_id,
      learningExpectationName: item.learning_expectation_name,
      description: item.description ?? void 0
    }));
    return successResponse(c, data);
  } catch (error3) {
    throw wrapError2(error3, "Failed to load learning expectation options");
  }
});
onboardingRoutes.get("/partner-preferences", async (c) => {
  try {
    const data = await listPartnerOptions(c.env);
    return successResponse(c, data);
  } catch (error3) {
    throw wrapError2(error3, "Failed to load partner preferences");
  }
});
onboardingRoutes.get("/partner/personalities", async (c) => {
  try {
    const rows = await listPartnerOptions(c.env);
    const data = rows.map((item) => ({
      partnerPersonalityId: item.partner_personality_id,
      partnerPersonality: item.partner_personality,
      description: item.description ?? void 0,
      id: item.partner_personality_id,
      name: item.partner_personality
    }));
    return successResponse(c, data);
  } catch (error3) {
    throw wrapError2(error3, "Failed to load partner personalities");
  }
});
onboardingRoutes.get("/partner/gender-type", async (c) => {
  const genderTypes = [
    { name: "MALE", description: "\uB0A8\uC131" },
    { name: "FEMALE", description: "\uC5EC\uC131" },
    { name: "ANY", description: "\uC0C1\uAD00\uC5C6\uC74C" }
  ];
  return successResponse(c, genderTypes);
});
onboardingRoutes.get("/schedule/communication-methods", async (c) => {
  try {
    const methods = await listCommunicationMethodOptions(c.env);
    const data = methods.map((item) => ({
      communicationMethodId: item.id,
      code: item.code,
      name: item.code,
      label: item.displayName,
      displayName: item.displayName,
      description: item.description ?? void 0,
      sortOrder: item.sortOrder
    }));
    return successResponse(c, data);
  } catch (error3) {
    throw wrapError2(error3, "Failed to load communication methods");
  }
});
onboardingRoutes.get("/schedule/daily-methods", async (c) => {
  try {
    const options = await listDailyMinuteOptions(c.env);
    const data = options.map((item, index) => ({
      id: index + 1,
      name: item.code,
      code: item.code,
      minutes: item.minutes,
      label: item.displayName,
      displayName: item.displayName,
      description: item.description ?? item.displayName,
      sortOrder: item.sortOrder
    }));
    return successResponse(c, data);
  } catch (error3) {
    throw wrapError2(error3, "Failed to load daily minute options");
  }
});
onboardingRoutes.get("/schedule-options", async (c) => {
  try {
    const data = await listScheduleOptions(c.env);
    return successResponse(c, data);
  } catch (error3) {
    throw wrapError2(error3, "Failed to load schedule options");
  }
});
onboardingRoutes.get("/motivation-options", async (c) => {
  try {
    const data = await listMotivationOptions(c.env);
    return successResponse(c, data);
  } catch (error3) {
    throw wrapError2(error3, "Failed to load motivation options");
  }
});
onboardingRoutes.use("/*", requireAuth2);
onboardingRoutes.use("/steps/*", requireAuth2);
onboardingRoutes.use("/steps", requireAuth2);
onboardingRoutes.get("/schedule/group-sizes", async (c) => {
  try {
    const rows = await listGroupSizeOptions(c.env);
    const data = rows.map((item) => ({
      groupSizeId: item.group_size_id,
      groupSize: item.group_size,
      id: item.group_size_id,
      name: item.group_size,
      label: item.group_size
    }));
    return successResponse(c, data);
  } catch (error3) {
    throw wrapError2(error3, "Failed to load group size options");
  }
});
onboardingRoutes.post("/partner/gender", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  const body = await c.req.json().catch(() => ({}));
  const raw2 = typeof body.partnerGenderType === "string" ? body.partnerGenderType : typeof body.partnerGender === "string" ? body.partnerGender : typeof body.genderType === "string" ? body.genderType : void 0;
  if (!raw2) {
    throw new AppError("partner gender is required", 400, "INVALID_PAYLOAD");
  }
  const normalized = String(raw2).trim().toUpperCase();
  const allowed = /* @__PURE__ */ new Set(["MALE", "FEMALE", "ANY", "OTHER"]);
  if (!allowed.has(normalized)) {
    throw new AppError("invalid partner gender type", 400, "INVALID_PAYLOAD");
  }
  try {
    await updateUserProfile(c.env, userId, { partnerGender: normalized });
    const summary = await loadOnboardingSummary(c.env, userId);
    return successResponse(c, {
      partnerGender: normalized,
      partnerPreferences: summary.partnerPreferences
    });
  } catch (error3) {
    throw wrapError2(error3, "Failed to save partner gender");
  }
});
onboardingRoutes.post("/schedule/communication-method", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  const body = await c.req.json().catch(() => ({}));
  const raw2 = typeof body.communicationMethodType === "string" ? body.communicationMethodType : typeof body.communicationMethod === "string" ? body.communicationMethod : typeof body.methodCode === "string" ? body.methodCode : typeof body.code === "string" ? body.code : typeof body.value === "string" ? body.value : Array.isArray(body) && body.length > 0 && typeof body[0] === "string" ? body[0] : void 0;
  if (!raw2) {
    throw new AppError("communication method is required", 400, "INVALID_PAYLOAD");
  }
  const normalized = String(raw2).trim().toUpperCase();
  if (!normalized) {
    throw new AppError("communication method is required", 400, "INVALID_PAYLOAD");
  }
  const methods = await listCommunicationMethodOptions(c.env);
  const selected = methods.find((item) => item.code.toUpperCase() === normalized);
  if (!selected) {
    throw new AppError("invalid communication method", 400, "INVALID_COMMUNICATION_METHOD");
  }
  try {
    await updateUserProfile(c.env, userId, { communicationMethod: normalized });
    await saveOnboardingStep(c.env, userId, 5, { communicationMethod: normalized }, TOTAL_ONBOARDING_STEPS);
    const progress = await getOnboardingProgress(c.env, userId, TOTAL_ONBOARDING_STEPS);
    return successResponse(c, {
      communicationMethod: normalized,
      label: selected.displayName,
      progress
    });
  } catch (error3) {
    throw wrapError2(error3, "Failed to save communication method");
  }
});
onboardingRoutes.post("/schedule/daily-minute", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  const payload = await c.req.json().catch(() => ({}));
  const candidates = [];
  const pushCandidate = /* @__PURE__ */ __name((value) => {
    if (value === void 0 || value === null) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((nested) => pushCandidate(nested));
      return;
    }
    candidates.push(value);
  }, "pushCandidate");
  const lookupKeys = [
    "dailyMinutesType",
    "dailyMinuteType",
    "dailyMinute",
    "dailyMinutes",
    "code",
    "value",
    "selection"
  ];
  for (const key of lookupKeys) {
    pushCandidate(payload?.[key]);
  }
  pushCandidate(payload);
  const stringCandidate = candidates.find(
    (item) => typeof item === "string" && item.trim().length > 0
  );
  const numericCandidate = candidates.find((item) => typeof item === "number" && Number.isFinite(item)) ?? (() => {
    if (!stringCandidate) {
      return void 0;
    }
    const maybeNumber = Number(stringCandidate.trim());
    return Number.isFinite(maybeNumber) ? maybeNumber : void 0;
  })();
  if (!stringCandidate && numericCandidate === void 0) {
    throw new AppError("daily minute selection is required", 400, "INVALID_PAYLOAD");
  }
  const options = await listDailyMinuteOptions(c.env);
  let selectedOption = void 0;
  if (stringCandidate) {
    const normalizedCode2 = stringCandidate.trim().toUpperCase();
    selectedOption = options.find((item) => item.code.toUpperCase() === normalizedCode2);
  }
  if (!selectedOption && numericCandidate !== void 0) {
    const normalizedMinutes = Math.round(numericCandidate);
    selectedOption = options.find((item) => item.minutes === normalizedMinutes);
  }
  if (!selectedOption) {
    throw new AppError("invalid daily minute option", 400, "INVALID_DAILY_MINUTE_OPTION");
  }
  const normalizedCode = selectedOption.code.toUpperCase();
  try {
    await updateUserProfile(c.env, userId, { dailyMinute: normalizedCode });
    await saveOnboardingStep(c.env, userId, 7, { dailyMinute: normalizedCode }, TOTAL_ONBOARDING_STEPS);
    const progress = await getOnboardingProgress(c.env, userId, TOTAL_ONBOARDING_STEPS);
    return successResponse(c, {
      dailyMinute: normalizedCode,
      minutes: selectedOption.minutes,
      label: selectedOption.displayName,
      description: selectedOption.description ?? void 0,
      progress
    });
  } catch (error3) {
    throw wrapError2(error3, "Failed to save daily minute preference");
  }
});
onboardingRoutes.post("/schedule/group-size", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  }
  const body = await c.req.json().catch(() => ({}));
  const candidates = Array.isArray(body) ? body : body.groupSizeIds ?? body.group_size_ids ?? body.ids ?? [];
  const normalized = Array.from(new Set((Array.isArray(candidates) ? candidates : []).map((value) => Number(value)))).filter((value) => Number.isFinite(value));
  if (!normalized.length) {
    throw new AppError("groupSizeIds array required", 400, "INVALID_PAYLOAD");
  }
  try {
    await upsertOnboardingGroupSizes(c.env, userId, normalized);
    await saveOnboardingStep(c.env, userId, 6, { groupSizeIds: normalized }, TOTAL_ONBOARDING_STEPS);
    const progress = await getOnboardingProgress(c.env, userId, TOTAL_ONBOARDING_STEPS);
    const summary = await loadOnboardingSummary(c.env, userId);
    return successResponse(c, {
      groupSizeIds: normalized,
      groupSizes: summary.groupSizes,
      progress
    });
  } catch (error3) {
    throw wrapError2(error3, "Failed to save group sizes");
  }
});
var STATIC_STEP_NUMBERS = [1, 2, 3, 4];
for (const staticStep of STATIC_STEP_NUMBERS) {
  onboardingRoutes.post(`/steps/${staticStep}/save`, async (c) => {
    const userId = c.get("userId");
    if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
    const payload = normalizeStepPayload(await c.req.json().catch(() => ({})));
    await saveOnboardingStep(c.env, userId, staticStep, payload, TOTAL_ONBOARDING_STEPS);
    const progress = await getOnboardingProgress(c.env, userId, TOTAL_ONBOARDING_STEPS);
    return successResponse(c, { saved: true, progress });
  });
}
onboardingRoutes.post("/steps/:step/save", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const step = Number(c.req.param("step"));
  if (!Number.isInteger(step) || step < 1 || step > TOTAL_ONBOARDING_STEPS) {
    throw new AppError("Invalid onboarding step", 400, "INVALID_PATH_PARAM");
  }
  const body = await c.req.json().catch(() => ({}));
  const payload = normalizeStepPayload(body);
  await saveOnboardingStep(c.env, userId, step, payload, TOTAL_ONBOARDING_STEPS);
  const progress = await getOnboardingProgress(c.env, userId, TOTAL_ONBOARDING_STEPS);
  return successResponse(c, { saved: true, progress });
});
onboardingRoutes.post("/steps/:step/skip", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const step = Number(c.req.param("step"));
  if (!Number.isInteger(step) || step < 1 || step > TOTAL_ONBOARDING_STEPS) {
    throw new AppError("Invalid onboarding step", 400, "INVALID_PATH_PARAM");
  }
  await saveOnboardingStep(c.env, userId, step, { skipped: true }, TOTAL_ONBOARDING_STEPS);
  const progress = await getOnboardingProgress(c.env, userId, TOTAL_ONBOARDING_STEPS);
  return successResponse(c, { skipped: true, progress });
});
onboardingRoutes.post("/state/:step", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const step = Number(c.req.param("step"));
  if (!Number.isInteger(step) || step < 1 || step > TOTAL_ONBOARDING_STEPS) {
    throw new AppError("Invalid onboarding step", 400, "INVALID_PATH_PARAM");
  }
  const body = await c.req.json().catch(() => ({}));
  try {
    await saveOnboardingStep(c.env, userId, step, body, TOTAL_ONBOARDING_STEPS);
    const progress = await getOnboardingProgress(c.env, userId, TOTAL_ONBOARDING_STEPS);
    return successResponse(c, { saved: true, progress });
  } catch (error3) {
    throw wrapError2(error3, "Failed to save onboarding step");
  }
});
onboardingRoutes.get("/state/:step", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const step = Number(c.req.param("step"));
  if (!Number.isInteger(step) || step < 1 || step > TOTAL_ONBOARDING_STEPS) {
    throw new AppError("Invalid onboarding step", 400, "INVALID_PATH_PARAM");
  }
  try {
    const state = await getOnboardingStep(c.env, userId, step);
    return successResponse(c, state ?? {});
  } catch (error3) {
    throw wrapError2(error3, "Failed to load onboarding step");
  }
});
onboardingRoutes.get("/steps/current", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const progress = await getOnboardingProgress(c.env, userId, TOTAL_ONBOARDING_STEPS);
  return successResponse(c, {
    currentStep: progress.currentStep,
    progress
  });
});
onboardingRoutes.get("/progress", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const progress = await getOnboardingProgress(c.env, userId, TOTAL_ONBOARDING_STEPS);
  return successResponse(c, progress);
});
onboardingRoutes.get("/data", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  try {
    const data = await buildOnboardingData(c.env, userId);
    return successResponse(c, data);
  } catch (error3) {
    throw wrapError2(error3, "Failed to load onboarding data");
  }
});
onboardingRoutes.get("/state/progress", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  try {
    const progress = await getOnboardingProgress(c.env, userId, TOTAL_ONBOARDING_STEPS);
    return successResponse(c, progress);
  } catch (error3) {
    throw wrapError2(error3, "Failed to load onboarding progress");
  }
});
onboardingRoutes.post("/state/session", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  try {
    await saveOnboardingSessionDraft(c.env, userId, body);
    return successResponse(c, { saved: true });
  } catch (error3) {
    throw wrapError2(error3, "Failed to save onboarding session");
  }
});
onboardingRoutes.get("/state/session", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  try {
    const draft = await getOnboardingSessionDraft(c.env, userId);
    return successResponse(c, draft ?? {});
  } catch (error3) {
    throw wrapError2(error3, "Failed to load onboarding session");
  }
});
onboardingRoutes.post("/state/reset", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  try {
    await clearOnboardingState(c.env, userId);
    await resetOnboardingProgress(c.env, userId, TOTAL_ONBOARDING_STEPS);
    return successResponse(c, { reset: true });
  } catch (error3) {
    throw wrapError2(error3, "Failed to reset onboarding state");
  }
});
onboardingRoutes.post("/languages", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  if (!Array.isArray(body)) {
    throw new AppError("Expected array payload", 400, "INVALID_PAYLOAD");
  }
  const payload = body.map((item) => ({
    languageId: Number(item.languageId ?? item.language_id),
    currentLevelId: item.currentLevelId ?? item.current_level_id ?? void 0,
    targetLevelId: item.targetLevelId ?? item.target_level_id ?? void 0
  })).filter((item) => Number.isFinite(item.languageId));
  try {
    await upsertOnboardingLanguages(c.env, userId, payload);
    return successResponse(c, { count: payload.length });
  } catch (error3) {
    throw wrapError2(error3, "Failed to save language selections");
  }
});
onboardingRoutes.post("/language/native-language", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  const languageId = Number(body.languageId ?? body.nativeLanguageId);
  if (!Number.isFinite(languageId)) {
    throw new AppError("languageId is required", 400, "INVALID_PAYLOAD");
  }
  await updateUserProfile(c.env, userId, { nativeLanguageId: languageId });
  return successResponse(c, { languageId });
});
onboardingRoutes.post("/language/language-level", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  const languages = Array.isArray(body?.languages) ? body.languages : [];
  const payload = [];
  for (const raw2 of languages) {
    const languageId = Number(raw2.languageId ?? raw2.language_id);
    if (!Number.isFinite(languageId)) {
      continue;
    }
    payload.push({
      languageId,
      currentLevelId: raw2.currentLevelId ?? raw2.current_level_id ?? void 0,
      targetLevelId: raw2.targetLevelId ?? raw2.target_level_id ?? void 0
    });
  }
  await upsertOnboardingLanguages(c.env, userId, payload);
  return successResponse(c, { count: payload.length });
});
onboardingRoutes.post("/interests", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  const topicIds = Array.isArray(body) ? body : body?.topicIds;
  if (!Array.isArray(topicIds)) {
    throw new AppError("topicIds array required", 400, "INVALID_PAYLOAD");
  }
  const casted = topicIds.map(Number).filter((id) => Number.isFinite(id));
  try {
    await upsertOnboardingTopics(c.env, userId, casted);
    return successResponse(c, { count: casted.length });
  } catch (error3) {
    throw wrapError2(error3, "Failed to save interests");
  }
});
onboardingRoutes.post("/interest/motivation", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  const motivationIds = Array.isArray(body?.motivationIds) ? body.motivationIds : Array.isArray(body) ? body : [];
  const normalized = [];
  motivationIds.forEach((value, index) => {
    const motivationId = Number(value);
    if (!Number.isFinite(motivationId)) {
      return;
    }
    normalized.push({
      motivationId,
      priority: index + 1
    });
  });
  await upsertOnboardingMotivations(c.env, userId, normalized);
  return successResponse(c, { count: normalized.length });
});
onboardingRoutes.post("/interest/topic", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  const topicIds = Array.isArray(body?.topicIds) ? body.topicIds : Array.isArray(body) ? body : [];
  const normalized = topicIds.map((value) => Number(value)).filter((id) => Number.isFinite(id));
  await upsertOnboardingTopics(c.env, userId, normalized);
  return successResponse(c, { count: normalized.length });
});
onboardingRoutes.post("/interest/learning-style", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  const raw2 = Array.isArray(body?.learningStyleIds) ? body.learningStyleIds : Array.isArray(body) ? body : [];
  const normalized = raw2.map((value) => Number(value)).filter((value) => Number.isFinite(value));
  try {
    await upsertOnboardingLearningStyles(c.env, userId, normalized);
    return successResponse(c, { count: normalized.length });
  } catch (error3) {
    throw wrapError2(error3, "Failed to save learning styles");
  }
});
onboardingRoutes.post("/interest/learning-expectation", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  const raw2 = Array.isArray(body?.learningExpectationIds) ? body.learningExpectationIds : Array.isArray(body) ? body : [];
  const normalized = raw2.map((value) => Number(value)).filter((value) => Number.isFinite(value));
  try {
    await upsertOnboardingLearningExpectations(c.env, userId, normalized);
    return successResponse(c, { count: normalized.length });
  } catch (error3) {
    throw wrapError2(error3, "Failed to save learning expectations");
  }
});
onboardingRoutes.post("/partner-preferences", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  const preferences = Array.isArray(body) ? body : body?.partnerPreferences;
  if (!Array.isArray(preferences)) {
    throw new AppError("partner preferences array required", 400, "INVALID_PAYLOAD");
  }
  const normalized = preferences.map(
    (item) => typeof item === "number" ? { partnerPersonalityId: item } : {
      partnerPersonalityId: Number(item.partnerPersonalityId ?? item.partner_personality_id),
      partnerGender: item.partnerGender ?? item.partner_gender
    }
  ).filter((item) => Number.isFinite(item.partnerPersonalityId));
  try {
    await upsertOnboardingPartner(c.env, userId, normalized);
    return successResponse(c, { count: normalized.length });
  } catch (error3) {
    throw wrapError2(error3, "Failed to save partner preferences");
  }
});
onboardingRoutes.post("/partner/personality", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  const raw2 = Array.isArray(body.personalPartnerIds) ? body.personalPartnerIds : Array.isArray(body.partnerPersonalityIds) ? body.partnerPersonalityIds : Array.isArray(body) ? body : [];
  if (!Array.isArray(raw2) || raw2.length === 0) {
    await upsertOnboardingPartner(c.env, userId, []);
    return successResponse(c, { count: 0 });
  }
  const normalized = raw2.map(
    (item) => typeof item === "number" ? { partnerPersonalityId: item } : {
      partnerPersonalityId: Number(item.partnerPersonalityId ?? item.partner_personality_id ?? item.id),
      partnerGender: item.partnerGender ?? item.partner_gender ?? void 0
    }
  ).filter((item) => Number.isFinite(item.partnerPersonalityId));
  try {
    await upsertOnboardingPartner(c.env, userId, normalized);
    return successResponse(c, { count: normalized.length });
  } catch (error3) {
    throw wrapError2(error3, "Failed to save partner personalities");
  }
});
onboardingRoutes.post("/schedules", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  const schedules = Array.isArray(body) ? body : body?.schedules;
  if (!Array.isArray(schedules)) {
    throw new AppError("schedules array required", 400, "INVALID_PAYLOAD");
  }
  const normalized = [];
  for (const raw2 of schedules) {
    const scheduleId = Number(raw2.scheduleId ?? raw2.schedule_id);
    if (!Number.isFinite(scheduleId)) {
      continue;
    }
    normalized.push({
      scheduleId,
      dayOfWeek: raw2.dayOfWeek ?? raw2.day_of_week ?? "UNKNOWN",
      classTime: raw2.classTime ?? raw2.class_time ?? void 0
    });
  }
  try {
    await upsertOnboardingSchedules(c.env, userId, normalized);
    return successResponse(c, { count: normalized.length });
  } catch (error3) {
    throw wrapError2(error3, "Failed to save schedules");
  }
});
onboardingRoutes.post("/schedule", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  const schedules = Array.isArray(body?.schedules) ? body.schedules : [];
  const normalized = [];
  for (const raw2 of schedules) {
    const scheduleId = Number(raw2.scheduleId ?? raw2.schedule_id);
    if (!Number.isFinite(scheduleId)) {
      continue;
    }
    normalized.push({
      scheduleId,
      dayOfWeek: raw2.dayOfWeek ?? raw2.day_of_week ?? "UNKNOWN",
      classTime: raw2.classTime ?? raw2.class_time ?? void 0
    });
  }
  await upsertOnboardingSchedules(c.env, userId, normalized);
  return successResponse(c, { count: normalized.length });
});
onboardingRoutes.post("/motivations", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  const motivations = Array.isArray(body) ? body : body?.motivationIds;
  if (!Array.isArray(motivations)) {
    throw new AppError("motivationIds array required", 400, "INVALID_PAYLOAD");
  }
  const normalized = [];
  motivations.forEach((raw2, index) => {
    const motivationId = typeof raw2 === "number" ? raw2 : Number(raw2.motivationId ?? raw2.motivation_id);
    if (!Number.isFinite(motivationId)) {
      return;
    }
    normalized.push({
      motivationId,
      priority: raw2?.priority ?? index + 1
    });
  });
  try {
    await upsertOnboardingMotivations(c.env, userId, normalized);
    return successResponse(c, { count: normalized.length });
  } catch (error3) {
    throw wrapError2(error3, "Failed to save motivations");
  }
});
onboardingRoutes.get("/summary", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  try {
    const summary = await loadOnboardingSummary(c.env, userId);
    return successResponse(c, summary);
  } catch (error3) {
    throw wrapError2(error3, "Failed to load onboarding summary");
  }
});
onboardingRoutes.post("/complete", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  try {
    await completeOnboarding(c.env, userId, body ?? {});
    await clearOnboardingState(c.env, userId);
    return successResponse(c, { completed: true });
  } catch (error3) {
    throw wrapError2(error3, "Failed to complete onboarding");
  }
});
var onboarding_default = onboardingRoutes;

// src/routes/sessions.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_errors();

// src/services/session.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
var SESSION_STATUS = {
  SCHEDULED: "SCHEDULED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
};
var BOOKING_STATUS = {
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW"
};
var DEFAULT_INVITE_EXPIRATION_HOURS = 24;
var NOTIFICATION_DEFAULTS = {
  reminderBefore: 30,
  enableEmailReminder: true,
  enablePushReminder: true,
  enableSmsReminder: false,
  updatedAt: (/* @__PURE__ */ new Date(0)).toISOString()
};
function intToBool(value) {
  return value === 1;
}
__name(intToBool, "intToBool");
function boolToInt(value) {
  return value ? 1 : 0;
}
__name(boolToInt, "boolToInt");
async function fetchNotificationRow(env2, sessionId, userId) {
  return queryFirst(
    env2.DB,
    `SELECT * FROM session_notifications WHERE session_id = ? AND user_id = ? LIMIT 1`,
    [sessionId, userId]
  );
}
__name(fetchNotificationRow, "fetchNotificationRow");
async function upsertNotificationRow(env2, sessionId, userId, settings) {
  await execute(
    env2.DB,
    `INSERT INTO session_notifications (
        session_id,
        user_id,
        reminder_before,
        enable_email,
        enable_push,
        enable_sms,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id, user_id) DO UPDATE SET
        reminder_before = excluded.reminder_before,
        enable_email = excluded.enable_email,
        enable_push = excluded.enable_push,
        enable_sms = excluded.enable_sms,
        updated_at = excluded.updated_at`,
    [
      sessionId,
      userId,
      settings.reminderBefore,
      boolToInt(settings.enableEmailReminder),
      boolToInt(settings.enablePushReminder),
      boolToInt(settings.enableSmsReminder),
      settings.updatedAt
    ]
  );
}
__name(upsertNotificationRow, "upsertNotificationRow");
async function fetchRecordingRow(env2, sessionId) {
  return queryFirst(
    env2.DB,
    "SELECT * FROM session_recordings WHERE session_id = ? LIMIT 1",
    [sessionId]
  );
}
__name(fetchRecordingRow, "fetchRecordingRow");
async function upsertRecordingRow(env2, sessionId, status) {
  await execute(
    env2.DB,
    `INSERT INTO session_recordings (
        session_id,
        status,
        record_audio,
        record_video,
        record_transcript,
        download_url,
        message,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        status = excluded.status,
        record_audio = excluded.record_audio,
        record_video = excluded.record_video,
        record_transcript = excluded.record_transcript,
        download_url = excluded.download_url,
        message = excluded.message,
        updated_at = excluded.updated_at`,
    [
      sessionId,
      status.status,
      boolToInt(status.recordAudio),
      boolToInt(status.recordVideo),
      boolToInt(status.recordTranscript),
      status.downloadUrl ?? null,
      status.message ?? null,
      status.updatedAt
    ]
  );
}
__name(upsertRecordingRow, "upsertRecordingRow");
async function fetchInviteRow(env2, token) {
  return queryFirst(
    env2.DB,
    "SELECT * FROM session_invites WHERE invite_token = ? LIMIT 1",
    [token]
  );
}
__name(fetchInviteRow, "fetchInviteRow");
async function insertInviteRow(env2, record) {
  await execute(
    env2.DB,
    `INSERT INTO session_invites (
        invite_token,
        session_id,
        inviter_user_id,
        expires_at,
        created_at,
        used_at,
        used_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(invite_token) DO UPDATE SET
        session_id = excluded.session_id,
        inviter_user_id = excluded.inviter_user_id,
        expires_at = excluded.expires_at,
        created_at = excluded.created_at,
        used_at = excluded.used_at,
        used_by = excluded.used_by`,
    [
      record.invite_token,
      record.session_id,
      record.inviter_user_id,
      record.expires_at,
      record.created_at,
      record.used_at,
      record.used_by
    ]
  );
}
__name(insertInviteRow, "insertInviteRow");
async function markInviteUsed(env2, token, usedBy, usedAt) {
  await execute(
    env2.DB,
    "UPDATE session_invites SET used_at = ?, used_by = ? WHERE invite_token = ?",
    [usedAt, usedBy, token]
  );
}
__name(markInviteUsed, "markInviteUsed");
async function fetchSummaryRow(env2, sessionId) {
  return queryFirst(
    env2.DB,
    "SELECT * FROM session_summaries WHERE session_id = ? LIMIT 1",
    [sessionId]
  );
}
__name(fetchSummaryRow, "fetchSummaryRow");
async function upsertSummaryRow(env2, row) {
  await execute(
    env2.DB,
    `INSERT INTO session_summaries (
        session_id,
        notes,
        duration_minutes,
        rating,
        highlights,
        action_items,
        feedback,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        notes = excluded.notes,
        duration_minutes = excluded.duration_minutes,
        rating = excluded.rating,
        highlights = excluded.highlights,
        action_items = excluded.action_items,
        feedback = excluded.feedback,
        updated_at = excluded.updated_at`,
    [
      row.session_id,
      row.notes,
      row.duration_minutes,
      row.rating,
      row.highlights,
      row.action_items,
      row.feedback,
      row.updated_at
    ]
  );
}
__name(upsertSummaryRow, "upsertSummaryRow");
async function fetchTranscriptRow(env2, sessionId, language) {
  return queryFirst(
    env2.DB,
    "SELECT * FROM session_transcripts WHERE session_id = ? AND language = ? LIMIT 1",
    [sessionId, language]
  );
}
__name(fetchTranscriptRow, "fetchTranscriptRow");
async function upsertTranscriptRow(env2, row) {
  await execute(
    env2.DB,
    `INSERT INTO session_transcripts (
        session_id,
        language,
        segments,
        generated_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(session_id, language) DO UPDATE SET
        segments = excluded.segments,
        generated_at = excluded.generated_at,
        updated_at = excluded.updated_at`,
    [
      row.session_id,
      row.language,
      row.segments,
      row.generated_at,
      row.updated_at
    ]
  );
}
__name(upsertTranscriptRow, "upsertTranscriptRow");
function deserializeSummaryRow(row) {
  const highlights = row.highlights ? safeParseStringArray(row.highlights) : [];
  const actionItems = row.action_items ? safeParseStringArray(row.action_items) : [];
  const feedback = row.feedback ? safeParseObject(row.feedback) : void 0;
  return {
    sessionId: row.session_id,
    notes: row.notes ?? void 0,
    durationMinutes: row.duration_minutes ?? void 0,
    rating: row.rating ?? void 0,
    highlights,
    actionItems,
    feedback,
    updatedAt: row.updated_at
  };
}
__name(deserializeSummaryRow, "deserializeSummaryRow");
function serializeSummaryResponse(summary) {
  return {
    session_id: summary.sessionId,
    notes: summary.notes ?? null,
    duration_minutes: summary.durationMinutes ?? null,
    rating: summary.rating ?? null,
    highlights: JSON.stringify(summary.highlights ?? []),
    action_items: JSON.stringify(summary.actionItems ?? []),
    feedback: summary.feedback ? JSON.stringify(summary.feedback) : null,
    updated_at: summary.updatedAt
  };
}
__name(serializeSummaryResponse, "serializeSummaryResponse");
function deserializeTranscriptRow(row) {
  const segments = row.segments ? safeParseSegments(row.segments) : [];
  return {
    sessionId: row.session_id,
    language: row.language,
    segments,
    generatedAt: row.generated_at
  };
}
__name(deserializeTranscriptRow, "deserializeTranscriptRow");
function safeParseStringArray(payload) {
  try {
    const parsed = JSON.parse(payload);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
__name(safeParseStringArray, "safeParseStringArray");
function safeParseObject(payload) {
  try {
    const parsed = JSON.parse(payload);
    return typeof parsed === "object" && parsed !== null ? parsed : void 0;
  } catch {
    return void 0;
  }
}
__name(safeParseObject, "safeParseObject");
function safeParseSegments(payload) {
  try {
    const parsed = JSON.parse(payload);
    if (Array.isArray(parsed)) {
      return parsed.map((segment) => {
        if (segment && typeof segment === "object") {
          return {
            speaker: String(segment.speaker ?? ""),
            content: String(segment.content ?? ""),
            startTime: segment.startTime ?? void 0,
            endTime: segment.endTime ?? void 0
          };
        }
        return {
          speaker: "",
          content: String(segment ?? "")
        };
      });
    }
    return [];
  } catch {
    return [];
  }
}
__name(safeParseSegments, "safeParseSegments");
function nowIso() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(nowIso, "nowIso");
function mapSessionRow(row, currentUserId) {
  const scheduledAt = row.scheduled_at;
  const duration = Number(row.duration_minutes ?? 0);
  const startDate = scheduledAt ? new Date(scheduledAt) : null;
  const startedAt = row.started_at ?? void 0;
  const endedAt = row.ended_at ?? void 0;
  let canJoin;
  let isHost;
  let isParticipant;
  if (currentUserId) {
    isHost = row.host_user_id === currentUserId;
    isParticipant = row.guest_user_id === currentUserId;
    canJoin = row.status === SESSION_STATUS.SCHEDULED && !isHost && Number(row.current_participants ?? 0) < Number(row.max_participants ?? 1);
  }
  return {
    sessionId: row.session_id,
    hostUserId: row.host_user_id,
    hostUserName: row.host_name ?? void 0,
    hostUserProfileImage: row.host_profile_image ?? void 0,
    guestUserId: row.guest_user_id ?? void 0,
    guestUserName: row.guest_name ?? void 0,
    guestUserProfileImage: row.guest_profile_image ?? void 0,
    title: row.title,
    description: row.description ?? void 0,
    sessionType: row.session_type,
    languageCode: row.language_code ?? void 0,
    skillFocus: row.skill_focus ?? void 0,
    levelRequirement: row.level_requirement ?? void 0,
    scheduledAt,
    durationMinutes: duration,
    maxParticipants: row.max_participants !== null ? Number(row.max_participants) : void 0,
    currentParticipants: Number(row.current_participants ?? 0),
    status: row.status,
    meetingUrl: row.meeting_url ?? void 0,
    isRecurring: Boolean(row.is_recurring),
    recurrencePattern: row.recurrence_pattern ?? void 0,
    recurrenceEndDate: row.recurrence_end_date ?? void 0,
    isPublic: Boolean(row.is_public ?? 1),
    tags: row.tags ?? void 0,
    preparationNotes: row.preparation_notes ?? void 0,
    startedAt,
    endedAt,
    canJoin,
    isHost,
    isParticipant
  };
}
__name(mapSessionRow, "mapSessionRow");
function mapBookingRow(row) {
  return {
    bookingId: row.booking_id,
    sessionId: row.session_id,
    sessionTitle: row.session_title,
    sessionScheduledAt: row.session_scheduled_at,
    sessionDurationMinutes: Number(row.session_duration_minutes ?? 0),
    sessionLanguageCode: row.session_language_code ?? void 0,
    hostUserId: row.host_user_id,
    hostUserName: row.host_user_name ?? void 0,
    hostUserProfileImage: row.host_user_profile_image ?? void 0,
    status: row.status,
    bookingMessage: row.booking_message ?? void 0,
    bookedAt: row.created_at,
    cancelledAt: row.cancelled_at ?? void 0,
    cancellationReason: row.cancellation_reason ?? void 0,
    attended: Boolean(row.attended),
    feedbackRating: row.feedback_rating !== null ? Number(row.feedback_rating) : void 0,
    feedbackComment: row.feedback_comment ?? void 0,
    reminderSent: Boolean(row.reminder_sent),
    canCancel: calculateCanCancel(row.session_scheduled_at)
  };
}
__name(mapBookingRow, "mapBookingRow");
function calculateCanCancel(scheduledAt) {
  if (!scheduledAt) return false;
  const sessionTime = new Date(scheduledAt);
  const threshold = /* @__PURE__ */ new Date();
  threshold.setUTCHours(threshold.getUTCHours() + 1);
  return sessionTime > threshold;
}
__name(calculateCanCancel, "calculateCanCancel");
async function getSessionRow(env2, sessionId) {
  return queryFirst(
    env2.DB,
    `SELECT s.*, 
            host.name AS host_name,
            host.profile_image AS host_profile_image,
            guest.name AS guest_name,
            guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      WHERE s.session_id = ?
      LIMIT 1`,
    [sessionId]
  );
}
__name(getSessionRow, "getSessionRow");
async function ensureSessionExists(env2, sessionId) {
  const row = await getSessionRow(env2, sessionId);
  if (!row) throw new Error("\uC138\uC158\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  return row;
}
__name(ensureSessionExists, "ensureSessionExists");
async function createSession2(env2, hostUserId, payload) {
  const now = nowIso();
  const title2 = payload.title ?? payload.topic ?? "Study Session";
  const sessionType = payload.sessionType ?? payload.sessionType ?? "VIDEO";
  const scheduledAt = payload.scheduledAt;
  const durationMinutes = payload.durationMinutes ?? payload.duration ?? 30;
  const maxParticipants = payload.maxParticipants ?? (payload.partnerId ? 2 : 1);
  const isPublic = payload.isPublic ?? !payload.partnerId;
  const languageCode = payload.languageCode ?? payload.language ?? null;
  const skillFocus = payload.skillFocus ?? payload.targetLanguage ?? null;
  const description = payload.description ?? payload.topic ?? null;
  const guestUserId = payload.partnerId ?? null;
  const metadata = {
    webRtcRoomId: payload.webRtcRoomId ?? null,
    webRtcRoomType: payload.webRtcRoomType ?? null,
    targetLanguage: payload.targetLanguage ?? null,
    topic: payload.topic ?? null,
    language: payload.language ?? null
  };
  const preparationNotes = payload.preparationNotes ?? JSON.stringify(metadata);
  const meetingUrl = payload.meetingUrl ?? (payload.webRtcRoomId ? `webrtc:${payload.webRtcRoomId}` : null);
  await execute(
    env2.DB,
    `INSERT INTO sessions (
        host_user_id,
        guest_user_id,
        title,
        description,
        session_type,
        language_code,
        skill_focus,
        level_requirement,
        scheduled_at,
        duration_minutes,
        max_participants,
        current_participants,
        status,
        meeting_url,
        meeting_password,
        is_recurring,
        recurrence_pattern,
        recurrence_end_date,
        is_public,
        tags,
        preparation_notes,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      hostUserId,
      guestUserId,
      title2,
      description,
      sessionType,
      languageCode,
      skillFocus,
      payload.levelRequirement ?? null,
      scheduledAt,
      durationMinutes,
      maxParticipants,
      SESSION_STATUS.SCHEDULED,
      meetingUrl,
      payload.isRecurring ? 1 : 0,
      payload.recurrencePattern ?? null,
      payload.recurrenceEndDate ?? null,
      isPublic ? 1 : 0,
      payload.tags ?? null,
      preparationNotes,
      now,
      now
    ]
  );
  const idRow = await queryFirst(
    env2.DB,
    "SELECT last_insert_rowid() as id"
  );
  const sessionId = Number(idRow?.id ?? 0);
  if (!sessionId) {
    throw new Error("\uC138\uC158 ID\uB97C \uD655\uC778\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  const row = await getSessionRow(env2, sessionId);
  if (!row) {
    throw new Error("\uC138\uC158 \uC0DD\uC131 \uD6C4 \uB370\uC774\uD130\uB97C \uB85C\uB4DC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  return mapSessionRow(row, hostUserId);
}
__name(createSession2, "createSession");
async function listSessions(env2, page, size, statusFilter) {
  const offset = (page - 1) * size;
  const filters = [];
  const params = [];
  const status = statusFilter?.toLowerCase();
  const now = nowIso();
  if (status === "upcoming") {
    filters.push("status = ?");
    params.push(SESSION_STATUS.SCHEDULED);
    filters.push("scheduled_at >= ?");
    params.push(now);
  } else if (status === "completed" || status === "done") {
    filters.push("status = ?");
    params.push(SESSION_STATUS.COMPLETED);
  } else if (status === "cancelled") {
    filters.push("status = ?");
    params.push(SESSION_STATUS.CANCELLED);
  } else if (status === "in-progress") {
    filters.push("status = ?");
    params.push(SESSION_STATUS.IN_PROGRESS);
  }
  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const totalRow = await queryFirst(
    env2.DB,
    `SELECT COUNT(*) as count FROM sessions ${whereClause}`,
    params
  );
  const rows = await query(
    env2.DB,
    `SELECT s.*, host.name AS host_name, host.profile_image AS host_profile_image,
            guest.name AS guest_name, guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      ${whereClause}
      ORDER BY s.scheduled_at DESC
      LIMIT ? OFFSET ?`,
    params.concat([size, offset])
  );
  const data = rows.map((row) => mapSessionRow(row));
  return {
    data,
    page,
    size,
    total: totalRow?.count ?? 0
  };
}
__name(listSessions, "listSessions");
async function getSessionById(env2, sessionId, currentUserId) {
  const row = await getSessionRow(env2, sessionId);
  if (!row) throw new Error("\uC138\uC158\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  return mapSessionRow(row, currentUserId);
}
__name(getSessionById, "getSessionById");
async function listUserSessions(env2, userId, page, size) {
  const offset = (page - 1) * size;
  const totalRow = await queryFirst(
    env2.DB,
    `SELECT COUNT(*) as count FROM sessions
      WHERE host_user_id = ? OR guest_user_id = ?`,
    [userId, userId]
  );
  const rows = await query(
    env2.DB,
    `SELECT s.*, host.name AS host_name, host.profile_image AS host_profile_image,
            guest.name AS guest_name, guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      WHERE s.host_user_id = ? OR s.guest_user_id = ?
      ORDER BY s.scheduled_at DESC
      LIMIT ? OFFSET ?`,
    [userId, userId, size, offset]
  );
  const data = rows.map((row) => mapSessionRow(row, userId));
  return {
    data,
    page,
    size,
    total: totalRow?.count ?? 0
  };
}
__name(listUserSessions, "listUserSessions");
async function listPublicSessions(env2, page, size) {
  const offset = (page - 1) * size;
  const now = nowIso();
  const totalRow = await queryFirst(
    env2.DB,
    `SELECT COUNT(*) as count FROM sessions
      WHERE is_public = 1 AND status = ? AND scheduled_at >= ?`,
    [SESSION_STATUS.SCHEDULED, now]
  );
  const rows = await query(
    env2.DB,
    `SELECT s.*, host.name AS host_name, host.profile_image AS host_profile_image,
            guest.name AS guest_name, guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      WHERE s.is_public = 1 AND s.status = ? AND s.scheduled_at >= ?
      ORDER BY s.scheduled_at ASC
      LIMIT ? OFFSET ?`,
    [SESSION_STATUS.SCHEDULED, now, size, offset]
  );
  const data = rows.map((row) => mapSessionRow(row));
  return { data, page, size, total: totalRow?.count ?? 0 };
}
__name(listPublicSessions, "listPublicSessions");
async function listSessionsByLanguage(env2, languageCode, page, size) {
  const offset = (page - 1) * size;
  const totalRow = await queryFirst(
    env2.DB,
    `SELECT COUNT(*) as count FROM sessions
      WHERE status = ? AND language_code = ?`,
    [SESSION_STATUS.SCHEDULED, languageCode]
  );
  const rows = await query(
    env2.DB,
    `SELECT s.*, host.name AS host_name, host.profile_image AS host_profile_image,
            guest.name AS guest_name, guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      WHERE s.status = ? AND s.language_code = ?
      ORDER BY s.scheduled_at ASC
      LIMIT ? OFFSET ?`,
    [SESSION_STATUS.SCHEDULED, languageCode, size, offset]
  );
  const data = rows.map((row) => mapSessionRow(row));
  return { data, page, size, total: totalRow?.count ?? 0 };
}
__name(listSessionsByLanguage, "listSessionsByLanguage");
async function listSessionsByType(env2, sessionType, page, size) {
  const offset = (page - 1) * size;
  const totalRow = await queryFirst(
    env2.DB,
    `SELECT COUNT(*) as count FROM sessions
      WHERE status = ? AND session_type = ?`,
    [SESSION_STATUS.SCHEDULED, sessionType]
  );
  const rows = await query(
    env2.DB,
    `SELECT s.*, host.name AS host_name, host.profile_image AS host_profile_image,
            guest.name AS guest_name, guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      WHERE s.status = ? AND s.session_type = ?
      ORDER BY s.scheduled_at ASC
      LIMIT ? OFFSET ?`,
    [SESSION_STATUS.SCHEDULED, sessionType, size, offset]
  );
  const data = rows.map((row) => mapSessionRow(row));
  return { data, page, size, total: totalRow?.count ?? 0 };
}
__name(listSessionsByType, "listSessionsByType");
async function listAvailableSessions(env2, userId, page, size) {
  const offset = (page - 1) * size;
  const totalRow = await queryFirst(
    env2.DB,
    `SELECT COUNT(*) as count FROM sessions s
      WHERE s.status = ?
        AND s.is_public = 1
        AND s.host_user_id != ?
        AND (s.max_participants IS NULL OR s.current_participants < s.max_participants)`,
    [SESSION_STATUS.SCHEDULED, userId]
  );
  const rows = await query(
    env2.DB,
    `SELECT s.*, host.name AS host_name, host.profile_image AS host_profile_image,
            guest.name AS guest_name, guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      WHERE s.status = ?
        AND s.is_public = 1
        AND s.host_user_id != ?
        AND (s.max_participants IS NULL OR s.current_participants < s.max_participants)
      ORDER BY s.scheduled_at ASC
      LIMIT ? OFFSET ?`,
    [SESSION_STATUS.SCHEDULED, userId, size, offset]
  );
  const data = rows.map((row) => mapSessionRow(row, userId));
  return { data, page, size, total: totalRow?.count ?? 0 };
}
__name(listAvailableSessions, "listAvailableSessions");
async function bookSession(env2, userId, payload) {
  const session = await ensureSessionExists(env2, payload.sessionId);
  if (session.host_user_id === userId) {
    throw new Error("\uD638\uC2A4\uD2B8\uB294 \uC790\uC2E0\uC758 \uC138\uC158\uC744 \uC608\uC57D\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  if (session.status !== SESSION_STATUS.SCHEDULED) {
    throw new Error("\uC608\uC57D\uD560 \uC218 \uC5C6\uB294 \uC138\uC158\uC785\uB2C8\uB2E4.");
  }
  const maxParticipants = session.max_participants ?? 1;
  const currentParticipants = Number(session.current_participants ?? 0);
  if (currentParticipants >= maxParticipants) {
    throw new Error("\uC138\uC158 \uC815\uC6D0\uC774 \uAC00\uB4DD \uCC3C\uC2B5\uB2C8\uB2E4.");
  }
  const existing = await queryFirst(
    env2.DB,
    `SELECT booking_id FROM session_bookings
      WHERE session_id = ? AND user_id = ? AND status = ?
      LIMIT 1`,
    [payload.sessionId, userId, BOOKING_STATUS.CONFIRMED]
  );
  if (existing) {
    throw new Error("\uC774\uBBF8 \uC608\uC57D\uB41C \uC138\uC158\uC785\uB2C8\uB2E4.");
  }
  const now = nowIso();
  await execute(
    env2.DB,
    `INSERT INTO session_bookings (
        session_id, user_id, status, booking_message,
        cancelled_at, cancellation_reason, attended, feedback_rating,
        feedback_comment, reminder_sent, reminder_sent_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, NULL, NULL, 0, NULL, NULL, 0, NULL, ?, ?)
    `,
    [payload.sessionId, userId, BOOKING_STATUS.CONFIRMED, payload.bookingMessage ?? null, now, now]
  );
  const newParticipants = currentParticipants + 1;
  await execute(
    env2.DB,
    `UPDATE sessions
        SET guest_user_id = CASE WHEN guest_user_id IS NULL THEN ? ELSE guest_user_id END,
            current_participants = ?,
            updated_at = ?
      WHERE session_id = ?`,
    [userId, newParticipants, now, payload.sessionId]
  );
  const bookingRow = await queryFirst(
    env2.DB,
    `SELECT b.*, 
            s.title AS session_title,
            s.scheduled_at AS session_scheduled_at,
            s.duration_minutes AS session_duration_minutes,
            s.language_code AS session_language_code,
            s.host_user_id,
            host.name AS host_user_name,
            host.profile_image AS host_user_profile_image
       FROM session_bookings b
       JOIN sessions s ON s.session_id = b.session_id
       LEFT JOIN users host ON host.user_id = s.host_user_id
      WHERE b.session_id = ? AND b.user_id = ?
      ORDER BY b.created_at DESC
      LIMIT 1`,
    [payload.sessionId, userId]
  );
  if (!bookingRow) throw new Error("\uC608\uC57D \uC815\uBCF4\uB97C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  return mapBookingRow(bookingRow);
}
__name(bookSession, "bookSession");
async function joinSession(env2, userId, sessionId, bookingMessage) {
  const session = await ensureSessionExists(env2, sessionId);
  if (session.host_user_id === userId) {
    return mapSessionRow(session, userId);
  }
  await bookSession(env2, userId, { sessionId, bookingMessage });
  const updated = await getSessionRow(env2, sessionId);
  if (!updated) {
    throw new Error("\uC138\uC158 \uC815\uBCF4\uB97C \uAC31\uC2E0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  return mapSessionRow(updated, userId);
}
__name(joinSession, "joinSession");
async function cancelBooking(env2, userId, bookingId, reason) {
  const booking = await queryFirst(
    env2.DB,
    `SELECT b.*, s.host_user_id, s.guest_user_id, s.current_participants
       FROM session_bookings b
       JOIN sessions s ON s.session_id = b.session_id
      WHERE b.booking_id = ?
      LIMIT 1`,
    [bookingId]
  );
  if (!booking) throw new Error("\uC608\uC57D\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  if (booking.user_id !== userId) throw new Error("\uC608\uC57D\uC744 \uCDE8\uC18C\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
  if (booking.status !== BOOKING_STATUS.CONFIRMED) throw new Error("\uC774\uBBF8 \uCC98\uB9AC\uB41C \uC608\uC57D\uC785\uB2C8\uB2E4.");
  const now = nowIso();
  await execute(
    env2.DB,
    `UPDATE session_bookings
       SET status = ?, cancelled_at = ?, cancellation_reason = ?, updated_at = ?
     WHERE booking_id = ?`,
    [BOOKING_STATUS.CANCELLED, now, reason ?? null, now, bookingId]
  );
  const newParticipants = Math.max(Number(booking.current_participants ?? 1) - 1, 0);
  const guestUserId = booking.guest_user_id === userId ? null : booking.guest_user_id;
  await execute(
    env2.DB,
    `UPDATE sessions
        SET guest_user_id = ?,
            current_participants = ?,
            updated_at = ?
      WHERE session_id = ?`,
    [guestUserId, newParticipants, now, booking.session_id]
  );
}
__name(cancelBooking, "cancelBooking");
async function listUserBookings(env2, userId, page, size) {
  const offset = (page - 1) * size;
  const totalRow = await queryFirst(
    env2.DB,
    "SELECT COUNT(*) as count FROM session_bookings WHERE user_id = ?",
    [userId]
  );
  const rows = await query(
    env2.DB,
    `SELECT b.*, s.title AS session_title, s.scheduled_at AS session_scheduled_at,
            s.duration_minutes AS session_duration_minutes, s.language_code AS session_language_code,
            s.host_user_id, host.name AS host_user_name, host.profile_image AS host_user_profile_image
       FROM session_bookings b
       JOIN sessions s ON s.session_id = b.session_id
       LEFT JOIN users host ON host.user_id = s.host_user_id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?`,
    [userId, size, offset]
  );
  const data = rows.map((row) => mapBookingRow(row));
  return { data, page, size, total: totalRow?.count ?? 0 };
}
__name(listUserBookings, "listUserBookings");
async function getUserCalendar(env2, userId, start, end) {
  const rows = await query(
    env2.DB,
    `SELECT s.*, host.name AS host_name, guest.name AS guest_name
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      WHERE s.scheduled_at BETWEEN ? AND ?
        AND (s.host_user_id = ? OR s.guest_user_id = ?)
      ORDER BY s.scheduled_at ASC`,
    [start, end, userId, userId]
  );
  const events = rows.map((row) => ({
    sessionId: row.session_id,
    title: row.title,
    description: row.description ?? void 0,
    startTime: row.scheduled_at,
    endTime: new Date(new Date(row.scheduled_at).getTime() + Number(row.duration_minutes ?? 0) * 6e4).toISOString(),
    eventType: "SESSION",
    status: row.status,
    isHost: row.host_user_id === userId,
    color: row.host_user_id === userId ? "#4CAF50" : "#2196F3"
  }));
  const availableSlots = [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  let cursor = new Date(startDate);
  while (cursor < endDate) {
    const next = new Date(cursor.getTime() + 60 * 6e4);
    availableSlots.push({ startTime: cursor.toISOString(), endTime: next.toISOString(), isAvailable: true });
    cursor = next;
  }
  return { events, availableSlots };
}
__name(getUserCalendar, "getUserCalendar");
async function startSession(env2, userId, sessionId) {
  const session = await ensureSessionExists(env2, sessionId);
  if (session.host_user_id !== userId) {
    throw new Error("\uC138\uC158\uC744 \uC2DC\uC791\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  const now = nowIso();
  await execute(
    env2.DB,
    "UPDATE sessions SET status = ?, started_at = ?, updated_at = ? WHERE session_id = ?",
    [SESSION_STATUS.IN_PROGRESS, now, now, sessionId]
  );
}
__name(startSession, "startSession");
async function endSession(env2, userId, sessionId, summary) {
  const session = await ensureSessionExists(env2, sessionId);
  if (session.host_user_id !== userId) {
    throw new Error("\uC138\uC158\uC744 \uC885\uB8CC\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  const now = nowIso();
  await execute(
    env2.DB,
    "UPDATE sessions SET status = ?, ended_at = ?, updated_at = ? WHERE session_id = ?",
    [SESSION_STATUS.COMPLETED, now, now, sessionId]
  );
  if (summary) {
    await mergeSessionSummary(env2, sessionId, {
      sessionId,
      durationMinutes: summary.duration ?? void 0,
      notes: summary.notes,
      rating: summary.rating,
      updatedAt: now,
      highlights: [],
      actionItems: []
    });
  }
}
__name(endSession, "endSession");
async function cancelSession(env2, userId, sessionId, reason) {
  const session = await ensureSessionExists(env2, sessionId);
  if (session.host_user_id !== userId) {
    throw new Error("\uC138\uC158\uC744 \uCDE8\uC18C\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  const now = nowIso();
  await execute(
    env2.DB,
    `UPDATE sessions
        SET status = ?, cancelled_at = ?, cancellation_reason = ?, updated_at = ?
      WHERE session_id = ?`,
    [SESSION_STATUS.CANCELLED, now, reason ?? null, now, sessionId]
  );
  await execute(
    env2.DB,
    `UPDATE session_bookings
        SET status = ?, cancelled_at = ?, cancellation_reason = ?, updated_at = ?
      WHERE session_id = ? AND status = ?`,
    [BOOKING_STATUS.CANCELLED, now, reason ?? "Session cancelled by host", now, sessionId, BOOKING_STATUS.CONFIRMED]
  );
}
__name(cancelSession, "cancelSession");
async function mergeSessionSummary(env2, sessionId, update) {
  const existingRow = await fetchSummaryRow(env2, sessionId);
  const existing = existingRow ? deserializeSummaryRow(existingRow) : null;
  const combinedFeedback = {
    ...existing?.feedback ?? {},
    ...update.feedback ?? {}
  };
  const feedback = combinedFeedback && Object.keys(combinedFeedback).length > 0 ? combinedFeedback : existing?.feedback;
  const highlights = update.highlights ?? existing?.highlights ?? [];
  const actionItems = update.actionItems ?? existing?.actionItems ?? [];
  const merged = {
    sessionId,
    notes: update.notes ?? existing?.notes,
    durationMinutes: update.durationMinutes ?? existing?.durationMinutes,
    rating: update.rating ?? existing?.rating,
    highlights,
    actionItems,
    feedback,
    updatedAt: update.updatedAt ?? nowIso()
  };
  await upsertSummaryRow(env2, serializeSummaryResponse(merged));
  return merged;
}
__name(mergeSessionSummary, "mergeSessionSummary");
async function getStoredSessionSummary(env2, sessionId) {
  const row = await fetchSummaryRow(env2, sessionId);
  return row ? deserializeSummaryRow(row) : null;
}
__name(getStoredSessionSummary, "getStoredSessionSummary");
async function buildDefaultSessionSummary(env2, sessionId) {
  const row = await getSessionRow(env2, sessionId);
  if (!row) {
    throw new Error("\uC138\uC158\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  return {
    sessionId,
    notes: void 0,
    durationMinutes: row.duration_minutes ?? void 0,
    rating: void 0,
    highlights: [],
    actionItems: [],
    feedback: void 0,
    updatedAt: row.updated_at
  };
}
__name(buildDefaultSessionSummary, "buildDefaultSessionSummary");
function parsePreparationNotes(raw2) {
  if (!raw2) return {};
  try {
    return JSON.parse(raw2);
  } catch {
    return { notes: raw2 };
  }
}
__name(parsePreparationNotes, "parsePreparationNotes");
async function rescheduleSession(env2, userId, sessionId, payload) {
  const session = await ensureSessionExists(env2, sessionId);
  if (session.host_user_id !== userId) {
    throw new Error("\uC138\uC158 \uC77C\uC815\uC744 \uBCC0\uACBD\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  const now = nowIso();
  const newScheduledAt = payload.scheduledAt ?? session.scheduled_at;
  const newDuration = payload.duration ?? session.duration_minutes ?? 30;
  const notes = parsePreparationNotes(session.preparation_notes ?? null);
  const reason = payload.reason?.trim();
  if (reason) {
    const history = Array.isArray(notes.rescheduleHistory) ? notes.rescheduleHistory : [];
    history.push({ reason, updatedAt: now, userId });
    notes.rescheduleHistory = history;
  }
  notes.lastRescheduleAt = now;
  notes.lastRescheduleBy = userId;
  await execute(
    env2.DB,
    `UPDATE sessions
        SET scheduled_at = ?,
            duration_minutes = ?,
            preparation_notes = ?,
            updated_at = ?
      WHERE session_id = ?`,
    [newScheduledAt, newDuration, JSON.stringify(notes), now, sessionId]
  );
  const updated = await getSessionRow(env2, sessionId);
  if (!updated) throw new Error("\uC138\uC158\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  return mapSessionRow(updated, userId);
}
__name(rescheduleSession, "rescheduleSession");
async function submitSessionFeedback(env2, userId, sessionId, feedback) {
  const now = nowIso();
  const booking = await queryFirst(
    env2.DB,
    `SELECT * FROM session_bookings WHERE session_id = ? AND user_id = ? LIMIT 1`,
    [sessionId, userId]
  );
  if (booking) {
    const feedbackComment = JSON.stringify({
      comment: feedback.comment ?? null,
      partnerRating: feedback.partnerRating ?? null,
      partnerComment: feedback.partnerComment ?? null,
      tags: feedback.tags ?? [],
      improvementAreas: feedback.improvementAreas ?? [],
      wouldRecommend: feedback.wouldRecommend ?? false
    });
    await execute(
      env2.DB,
      `UPDATE session_bookings
          SET feedback_rating = ?,
              feedback_comment = ?,
              attended = 1,
              updated_at = ?
        WHERE booking_id = ?`,
      [feedback.rating ?? null, feedbackComment, now, booking.booking_id]
    );
  }
  return mergeSessionSummary(env2, sessionId, {
    sessionId,
    feedback: {
      rating: feedback.rating,
      comment: feedback.comment,
      partnerRating: feedback.partnerRating,
      partnerComment: feedback.partnerComment,
      tags: feedback.tags,
      improvementAreas: feedback.improvementAreas,
      wouldRecommend: feedback.wouldRecommend
    },
    updatedAt: now
  });
}
__name(submitSessionFeedback, "submitSessionFeedback");
async function listSessionHistory(env2, userId, page, size, partnerId) {
  const offset = (page - 1) * size;
  const filters = ["(s.host_user_id = ? OR s.guest_user_id = ?)"];
  const params = [userId, userId];
  if (partnerId) {
    filters.push("((s.host_user_id = ? AND s.guest_user_id = ?) OR (s.host_user_id = ? AND s.guest_user_id = ?))");
    params.push(userId, partnerId, partnerId, userId);
  }
  filters.push("s.status IN (?, ?)");
  params.push(SESSION_STATUS.COMPLETED, SESSION_STATUS.CANCELLED);
  const whereClause = `WHERE ${filters.join(" AND ")}`;
  const totalRow = await queryFirst(
    env2.DB,
    `SELECT COUNT(*) as count FROM sessions s ${whereClause}`,
    params
  );
  const rows = await query(
    env2.DB,
    `SELECT s.*, host.name AS host_name, host.profile_image AS host_profile_image,
            guest.name AS guest_name, guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      ${whereClause}
      ORDER BY s.scheduled_at DESC
      LIMIT ? OFFSET ?`,
    params.concat([size, offset])
  );
  const data = rows.map((row) => mapSessionRow(row, userId));
  return { data, page, size, total: totalRow?.count ?? 0 };
}
__name(listSessionHistory, "listSessionHistory");
async function getSessionStats(env2, userId, period) {
  const now = /* @__PURE__ */ new Date();
  const start = new Date(now);
  if (period === "week") {
    start.setUTCDate(start.getUTCDate() - 7);
  } else if (period === "month") {
    start.setUTCMonth(start.getUTCMonth() - 1);
  } else {
    start.setUTCFullYear(start.getUTCFullYear() - 1);
  }
  const startIso = start.toISOString();
  const rows = await query(
    env2.DB,
    `SELECT s.*, host.name AS host_name, host.profile_image AS host_profile_image,
            guest.name AS guest_name, guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      WHERE (s.host_user_id = ? OR s.guest_user_id = ?)
        AND s.scheduled_at >= ?
      ORDER BY s.scheduled_at DESC`,
    [userId, userId, startIso]
  );
  let completed = 0;
  let cancelled = 0;
  let upcoming = 0;
  let totalMinutes = 0;
  const partners = /* @__PURE__ */ new Set();
  const completedDates = /* @__PURE__ */ new Set();
  let lastSessionAt;
  for (const row of rows) {
    if (!lastSessionAt || row.scheduled_at > lastSessionAt) {
      lastSessionAt = row.scheduled_at;
    }
    const otherUser = row.host_user_id === userId ? row.guest_user_id : row.host_user_id;
    if (otherUser) partners.add(otherUser);
    if (row.status === SESSION_STATUS.COMPLETED) {
      completed += 1;
      totalMinutes += Number(row.duration_minutes ?? 0);
      completedDates.add(new Date(row.scheduled_at).toISOString().slice(0, 10));
    } else if (row.status === SESSION_STATUS.CANCELLED) {
      cancelled += 1;
    } else if (row.status === SESSION_STATUS.SCHEDULED) {
      upcoming += 1;
    }
  }
  const averageDuration = completed > 0 ? totalMinutes / completed : 0;
  const streakDays = (() => {
    if (completedDates.size === 0) return 0;
    const cursor = /* @__PURE__ */ new Date();
    let streak = 0;
    for (; ; ) {
      const key = cursor.toISOString().slice(0, 10);
      if (completedDates.has(key)) {
        streak += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  })();
  return {
    period,
    totalSessions: rows.length,
    completedSessions: completed,
    cancelledSessions: cancelled,
    upcomingSessions: upcoming,
    totalMinutes,
    averageDuration,
    partnersCount: partners.size,
    streakDays,
    lastSessionAt
  };
}
__name(getSessionStats, "getSessionStats");
async function listUpcomingSessions(env2, userId, limit) {
  const rows = await query(
    env2.DB,
    `SELECT s.*, host.name AS host_name, host.profile_image AS host_profile_image,
            guest.name AS guest_name, guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      WHERE (s.host_user_id = ? OR s.guest_user_id = ?)
        AND s.status = ?
        AND s.scheduled_at >= ?
      ORDER BY s.scheduled_at ASC
      LIMIT ?`,
    [userId, userId, SESSION_STATUS.SCHEDULED, nowIso(), limit]
  );
  return rows.map((row) => mapSessionRow(row, userId));
}
__name(listUpcomingSessions, "listUpcomingSessions");
async function getSessionParticipants(env2, sessionId) {
  const row = await getSessionRow(env2, sessionId);
  if (!row) throw new Error("\uC138\uC158\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  const participants = [];
  participants.push({
    userId: row.host_user_id,
    name: row.host_name ?? void 0,
    profileImage: row.host_profile_image ?? void 0,
    role: "HOST",
    joinedAt: row.created_at
  });
  if (row.guest_user_id) {
    participants.push({
      userId: row.guest_user_id,
      name: row.guest_name ?? void 0,
      profileImage: row.guest_profile_image ?? void 0,
      role: "GUEST",
      joinedAt: row.created_at
    });
  }
  const bookingRows = await query(
    env2.DB,
    `SELECT b.*, u.name, u.profile_image
       FROM session_bookings b
       LEFT JOIN users u ON u.user_id = b.user_id
      WHERE b.session_id = ? AND b.status = ?`,
    [sessionId, BOOKING_STATUS.CONFIRMED]
  );
  for (const booking of bookingRows) {
    if (booking.user_id === row.host_user_id || booking.user_id === row.guest_user_id) {
      continue;
    }
    participants.push({
      userId: booking.user_id,
      name: booking.name ?? void 0,
      profileImage: booking.profile_image ?? void 0,
      role: "BOOKED",
      joinedAt: booking.created_at
    });
  }
  return participants;
}
__name(getSessionParticipants, "getSessionParticipants");
async function generateSessionInvite(env2, userId, sessionId, expiresInHours = 24) {
  const session = await ensureSessionExists(env2, sessionId);
  if (session.host_user_id !== userId) {
    throw new Error("\uCD08\uB300 \uB9C1\uD06C\uB97C \uC0DD\uC131\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  const token = crypto.randomUUID();
  const hours = Number.isFinite(expiresInHours) ? Math.max(1, expiresInHours) : DEFAULT_INVITE_EXPIRATION_HOURS;
  const now = nowIso();
  const expiresAt = new Date(Date.now() + hours * 3600 * 1e3).toISOString();
  await insertInviteRow(env2, {
    invite_token: token,
    session_id: sessionId,
    inviter_user_id: userId,
    expires_at: expiresAt,
    created_at: now,
    used_at: null,
    used_by: null
  });
  const baseUrl = env2.API_BASE_URL ?? "";
  const joinUrl = baseUrl ? `${baseUrl}/sessions/join?token=${token}` : `/sessions/join?token=${token}`;
  return { sessionId, inviteToken: token, expiresAt, joinUrl };
}
__name(generateSessionInvite, "generateSessionInvite");
async function acceptSessionInvite(env2, userId, token) {
  const record = await fetchInviteRow(env2, token);
  if (!record) {
    throw new Error("\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uCD08\uB300 \uD1A0\uD070\uC785\uB2C8\uB2E4.");
  }
  if (record.used_at) {
    throw new Error("\uC774\uBBF8 \uC0AC\uC6A9\uB41C \uCD08\uB300 \uD1A0\uD070\uC785\uB2C8\uB2E4.");
  }
  if (new Date(record.expires_at).getTime() < Date.now()) {
    throw new Error("\uCD08\uB300 \uD1A0\uD070\uC774 \uB9CC\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
  }
  const now = nowIso();
  await markInviteUsed(env2, token, userId, now);
  return joinSession(env2, userId, record.session_id);
}
__name(acceptSessionInvite, "acceptSessionInvite");
async function getSessionNotifications(env2, sessionId, userId) {
  const row = await fetchNotificationRow(env2, sessionId, userId);
  if (row) {
    return {
      reminderBefore: row.reminder_before,
      enableEmailReminder: intToBool(row.enable_email),
      enablePushReminder: intToBool(row.enable_push),
      enableSmsReminder: intToBool(row.enable_sms),
      updatedAt: row.updated_at
    };
  }
  return { ...NOTIFICATION_DEFAULTS, updatedAt: nowIso() };
}
__name(getSessionNotifications, "getSessionNotifications");
async function updateSessionNotifications(env2, sessionId, userId, settings) {
  const current = await getSessionNotifications(env2, sessionId, userId);
  const merged = {
    reminderBefore: settings.reminderBefore ?? current.reminderBefore,
    enableEmailReminder: settings.enableEmailReminder ?? current.enableEmailReminder,
    enablePushReminder: settings.enablePushReminder ?? current.enablePushReminder,
    enableSmsReminder: settings.enableSmsReminder ?? current.enableSmsReminder,
    updatedAt: nowIso()
  };
  await upsertNotificationRow(env2, sessionId, userId, merged);
  return merged;
}
__name(updateSessionNotifications, "updateSessionNotifications");
async function requestSessionRecording(env2, userId, sessionId, options) {
  const session = await ensureSessionExists(env2, sessionId);
  if (session.host_user_id !== userId) {
    throw new Error("\uB179\uD654\uB97C \uC694\uCCAD\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  const status = {
    sessionId,
    status: "scheduled",
    recordAudio: options.recordAudio ?? true,
    recordVideo: options.recordVideo ?? false,
    recordTranscript: options.recordTranscript ?? true,
    downloadUrl: void 0,
    message: options.language ? `Recording language: ${options.language}` : void 0,
    updatedAt: nowIso()
  };
  await upsertRecordingRow(env2, sessionId, status);
  return status;
}
__name(requestSessionRecording, "requestSessionRecording");
async function stopSessionRecording(env2, userId, sessionId) {
  const session = await ensureSessionExists(env2, sessionId);
  if (session.host_user_id !== userId) {
    throw new Error("\uB179\uD654\uB97C \uC911\uB2E8\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  const current = await fetchRecordingRow(env2, sessionId);
  const status = {
    sessionId,
    status: "completed",
    recordAudio: current ? intToBool(current.record_audio) : true,
    recordVideo: current ? intToBool(current.record_video) : false,
    recordTranscript: current ? intToBool(current.record_transcript) : true,
    downloadUrl: current?.download_url ?? `/sessions/${sessionId}/recordings/latest`,
    updatedAt: nowIso()
  };
  await upsertRecordingRow(env2, sessionId, status);
  return status;
}
__name(stopSessionRecording, "stopSessionRecording");
async function getSessionRecording(env2, sessionId) {
  const stored = await fetchRecordingRow(env2, sessionId);
  if (stored) {
    return {
      sessionId,
      status: stored.status,
      recordAudio: intToBool(stored.record_audio),
      recordVideo: intToBool(stored.record_video),
      recordTranscript: intToBool(stored.record_transcript),
      downloadUrl: stored.download_url ?? void 0,
      message: stored.message ?? void 0,
      updatedAt: stored.updated_at
    };
  }
  return {
    sessionId,
    status: "idle",
    recordAudio: false,
    recordVideo: false,
    recordTranscript: false,
    updatedAt: nowIso()
  };
}
__name(getSessionRecording, "getSessionRecording");
async function getSessionSummary(env2, sessionId) {
  const cached = await getStoredSessionSummary(env2, sessionId);
  if (cached) return cached;
  return buildDefaultSessionSummary(env2, sessionId);
}
__name(getSessionSummary, "getSessionSummary");
async function getSessionTranscript(env2, sessionId, language = "default") {
  const row = await fetchTranscriptRow(env2, sessionId, language);
  if (row) {
    return deserializeTranscriptRow(row);
  }
  const now = nowIso();
  const transcript = {
    sessionId,
    language,
    segments: [],
    generatedAt: now
  };
  await upsertTranscriptRow(env2, {
    session_id: sessionId,
    language,
    segments: JSON.stringify(transcript.segments),
    generated_at: now,
    updated_at: now
  });
  return transcript;
}
__name(getSessionTranscript, "getSessionTranscript");

// src/routes/sessions.ts
var sessionsRoutes = new Hono2();
var requireAuth3 = auth();
function getPaginationParams(c) {
  const page = Math.max(Number(c.req.query("page") ?? "1"), 1);
  const size = Math.max(Math.min(Number(c.req.query("size") ?? "20"), 50), 1);
  return { page, size };
}
__name(getPaginationParams, "getPaginationParams");
function parseSessionId(c) {
  const sessionId = Number(c.req.param("sessionId"));
  if (!Number.isFinite(sessionId)) throw new AppError("Invalid sessionId", 400, "INVALID_PATH_PARAM");
  return sessionId;
}
__name(parseSessionId, "parseSessionId");
function normalizeCreatePayload(body) {
  if (!body || typeof body !== "object") {
    throw new AppError("Invalid payload", 400, "INVALID_PAYLOAD");
  }
  const scheduledAt = typeof body.scheduledAt === "string" ? body.scheduledAt : null;
  if (!scheduledAt) {
    throw new AppError("scheduledAt is required", 400, "INVALID_PAYLOAD");
  }
  const sessionTypeRaw = typeof body.sessionType === "string" ? body.sessionType : typeof body.type === "string" ? body.type : null;
  const sessionType = sessionTypeRaw ? String(sessionTypeRaw).toUpperCase() : "VIDEO";
  const durationMinutes = typeof body.durationMinutes === "number" ? body.durationMinutes : typeof body.duration === "number" ? body.duration : 30;
  const payload = {
    title: typeof body.title === "string" ? body.title : typeof body.topic === "string" ? body.topic : "Study Session",
    description: typeof body.description === "string" ? body.description : typeof body.topic === "string" ? body.topic : void 0,
    sessionType,
    languageCode: typeof body.languageCode === "string" ? body.languageCode : typeof body.language === "string" ? body.language : void 0,
    skillFocus: typeof body.skillFocus === "string" ? body.skillFocus : typeof body.targetLanguage === "string" ? body.targetLanguage : void 0,
    levelRequirement: typeof body.levelRequirement === "string" ? body.levelRequirement : void 0,
    scheduledAt,
    durationMinutes,
    maxParticipants: typeof body.maxParticipants === "number" ? body.maxParticipants : void 0,
    isRecurring: Boolean(body.isRecurring),
    recurrencePattern: typeof body.recurrencePattern === "string" ? body.recurrencePattern : void 0,
    recurrenceEndDate: typeof body.recurrenceEndDate === "string" ? body.recurrenceEndDate : void 0,
    isPublic: typeof body.isPublic === "boolean" ? body.isPublic : void 0,
    tags: typeof body.tags === "string" ? body.tags : void 0,
    preparationNotes: typeof body.preparationNotes === "string" ? body.preparationNotes : void 0,
    meetingUrl: typeof body.meetingUrl === "string" ? body.meetingUrl : void 0,
    partnerId: typeof body.partnerId === "string" ? body.partnerId : void 0,
    topic: typeof body.topic === "string" ? body.topic : void 0,
    language: typeof body.language === "string" ? body.language : void 0,
    targetLanguage: typeof body.targetLanguage === "string" ? body.targetLanguage : void 0,
    webRtcRoomId: typeof body.webRtcRoomId === "string" ? body.webRtcRoomId : void 0,
    webRtcRoomType: typeof body.webRtcRoomType === "string" ? body.webRtcRoomType : void 0,
    duration: typeof body.duration === "number" ? body.duration : void 0,
    metadata: typeof body.metadata === "object" && body.metadata !== null ? body.metadata : void 0
  };
  return payload;
}
__name(normalizeCreatePayload, "normalizeCreatePayload");
sessionsRoutes.use("*", requireAuth3);
sessionsRoutes.get("/", async (c) => {
  const { page, size } = getPaginationParams(c);
  const status = c.req.query("status") ?? void 0;
  const result = await listSessions(c.env, page, size, status);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});
sessionsRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  const payload = normalizeCreatePayload(body);
  const session = await createSession2(c.env, userId, payload);
  return successResponse(c, session);
});
sessionsRoutes.post("/:sessionId/join", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const sessionId = parseSessionId(c);
  const body = await c.req.json().catch(() => ({}));
  const bookingMessage = typeof body?.bookingMessage === "string" ? body.bookingMessage : void 0;
  const session = await joinSession(c.env, userId, sessionId, bookingMessage);
  return successResponse(c, session);
});
sessionsRoutes.post("/book", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  if (typeof body.sessionId !== "number") {
    throw new AppError("sessionId is required", 400, "INVALID_PAYLOAD");
  }
  const booking = await bookSession(c.env, userId, {
    sessionId: body.sessionId,
    bookingMessage: typeof body.bookingMessage === "string" ? body.bookingMessage : void 0
  });
  return successResponse(c, booking);
});
sessionsRoutes.delete("/bookings/:bookingId", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const bookingId = Number(c.req.param("bookingId"));
  if (!Number.isFinite(bookingId)) throw new AppError("Invalid bookingId", 400, "INVALID_PATH_PARAM");
  const reason = c.req.query("reason") ?? void 0;
  await cancelBooking(c.env, userId, bookingId, reason);
  return successResponse(c, { success: true });
});
sessionsRoutes.get("/my-sessions", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const { page, size } = getPaginationParams(c);
  const result = await listUserSessions(c.env, userId, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});
sessionsRoutes.get("/public", async (c) => {
  const { page, size } = getPaginationParams(c);
  const result = await listPublicSessions(c.env, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});
sessionsRoutes.get("/language/:languageCode", async (c) => {
  const { page, size } = getPaginationParams(c);
  const languageCode = c.req.param("languageCode");
  const result = await listSessionsByLanguage(c.env, languageCode, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});
sessionsRoutes.get("/type/:sessionType", async (c) => {
  const { page, size } = getPaginationParams(c);
  const sessionType = c.req.param("sessionType");
  const result = await listSessionsByType(c.env, sessionType, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});
sessionsRoutes.get("/available", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const { page, size } = getPaginationParams(c);
  const result = await listAvailableSessions(c.env, userId, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});
sessionsRoutes.get("/my-bookings", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const { page, size } = getPaginationParams(c);
  const result = await listUserBookings(c.env, userId, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});
sessionsRoutes.get("/history", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const { page, size } = getPaginationParams(c);
  const partnerId = c.req.query("partnerId") ?? void 0;
  const result = await listSessionHistory(c.env, userId, page, size, typeof partnerId === "string" ? partnerId : void 0);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});
sessionsRoutes.get("/stats", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const periodParam = (c.req.query("period") ?? "month").toString().toLowerCase();
  const period = periodParam === "week" || periodParam === "year" ? periodParam : "month";
  const stats = await getSessionStats(c.env, userId, period);
  return successResponse(c, stats);
});
sessionsRoutes.get("/upcoming", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const limitRaw = Number(c.req.query("limit") ?? "5");
  const limit = Math.max(1, Math.min(Number.isFinite(limitRaw) ? limitRaw : 5, 20));
  const sessions = await listUpcomingSessions(c.env, userId, limit);
  return successResponse(c, sessions);
});
sessionsRoutes.get("/calendar", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const start = c.req.query("startDate") ?? (/* @__PURE__ */ new Date()).toISOString();
  const end = c.req.query("endDate") ?? addDaysIso(7);
  const calendar = await getUserCalendar(c.env, userId, start, end);
  return successResponse(c, calendar);
});
sessionsRoutes.get("/:sessionId/notifications", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const sessionId = parseSessionId(c);
  const settings = await getSessionNotifications(c.env, sessionId, userId);
  return successResponse(c, settings);
});
sessionsRoutes.patch("/:sessionId/notifications", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const sessionId = parseSessionId(c);
  const body = await c.req.json().catch(() => ({}));
  const settings = await updateSessionNotifications(c.env, sessionId, userId, body);
  return successResponse(c, settings);
});
sessionsRoutes.post("/:sessionId/feedback", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const sessionId = parseSessionId(c);
  const body = await c.req.json().catch(() => ({}));
  const summary = await submitSessionFeedback(c.env, userId, sessionId, body ?? {});
  return successResponse(c, summary);
});
sessionsRoutes.patch("/:sessionId/reschedule", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const sessionId = parseSessionId(c);
  const body = await c.req.json().catch(() => ({}));
  const session = await rescheduleSession(c.env, userId, sessionId, {
    scheduledAt: typeof body?.scheduledAt === "string" ? body.scheduledAt : void 0,
    duration: typeof body?.duration === "number" ? body.duration : void 0,
    reason: typeof body?.reason === "string" ? body.reason : void 0
  });
  return successResponse(c, session);
});
sessionsRoutes.post("/:sessionId/invite", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const sessionId = parseSessionId(c);
  const body = await c.req.json().catch(() => ({}));
  const expiresInHours = Number(body?.expiresInHours ?? 24);
  const invite = await generateSessionInvite(c.env, userId, sessionId, Number.isFinite(expiresInHours) ? expiresInHours : 24);
  return successResponse(c, invite);
});
sessionsRoutes.post("/invite/accept", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  const token = typeof body?.token === "string" ? body.token : "";
  if (!token) throw new AppError("Invite token is required", 400, "INVALID_PAYLOAD");
  const session = await acceptSessionInvite(c.env, userId, token);
  return successResponse(c, session);
});
sessionsRoutes.post("/:sessionId/recording", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const sessionId = parseSessionId(c);
  const body = await c.req.json().catch(() => ({}));
  const status = await requestSessionRecording(c.env, userId, sessionId, body ?? {});
  return successResponse(c, status);
});
sessionsRoutes.post("/:sessionId/recording/stop", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const sessionId = parseSessionId(c);
  const status = await stopSessionRecording(c.env, userId, sessionId);
  return successResponse(c, status);
});
sessionsRoutes.get("/:sessionId/recording", async (c) => {
  const sessionId = parseSessionId(c);
  const status = await getSessionRecording(c.env, sessionId);
  return successResponse(c, status);
});
sessionsRoutes.get("/:sessionId/participants", async (c) => {
  const sessionId = parseSessionId(c);
  const participants = await getSessionParticipants(c.env, sessionId);
  return successResponse(c, participants);
});
sessionsRoutes.get("/:sessionId/summary", async (c) => {
  const sessionId = parseSessionId(c);
  const summary = await getSessionSummary(c.env, sessionId);
  return successResponse(c, summary);
});
sessionsRoutes.get("/:sessionId/transcript", async (c) => {
  const sessionId = parseSessionId(c);
  const language = c.req.query("language") ?? "default";
  const transcript = await getSessionTranscript(c.env, sessionId, typeof language === "string" ? language : "default");
  return successResponse(c, transcript);
});
sessionsRoutes.get("/:sessionId", async (c) => {
  const userId = c.get("userId");
  const sessionId = parseSessionId(c);
  const session = await getSessionById(c.env, sessionId, userId);
  return successResponse(c, session);
});
sessionsRoutes.post("/:sessionId/start", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const sessionId = parseSessionId(c);
  await startSession(c.env, userId, sessionId);
  return successResponse(c, { success: true });
});
sessionsRoutes.post("/:sessionId/end", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const sessionId = parseSessionId(c);
  const body = await c.req.json().catch(() => ({}));
  await endSession(c.env, userId, sessionId, {
    duration: typeof body?.duration === "number" ? body.duration : void 0,
    notes: typeof body?.notes === "string" ? body.notes : void 0,
    rating: typeof body?.rating === "number" ? body.rating : void 0
  });
  return successResponse(c, { success: true });
});
sessionsRoutes.post("/:sessionId/cancel", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const sessionId = parseSessionId(c);
  const body = await c.req.json().catch(() => ({}));
  const reason = typeof body?.reason === "string" ? body.reason : void 0;
  await cancelSession(c.env, userId, sessionId, reason);
  return successResponse(c, { success: true });
});
sessionsRoutes.delete("/:sessionId", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const sessionId = parseSessionId(c);
  const reason = c.req.query("reason") ?? void 0;
  await cancelSession(c.env, userId, sessionId, typeof reason === "string" ? reason : void 0);
  return successResponse(c, { success: true });
});
function addDaysIso(days) {
  const d = /* @__PURE__ */ new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}
__name(addDaysIso, "addDaysIso");
var sessions_default = sessionsRoutes;

// src/routes/notifications.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_errors();

// src/services/notifications.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
var DEFAULT_PAGE_SIZE = 20;
var MAX_PAGE_SIZE = 100;
function nowIso2() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(nowIso2, "nowIso");
function normalizePageSize(size) {
  if (!size || Number.isNaN(size)) return DEFAULT_PAGE_SIZE;
  return Math.max(1, Math.min(size, MAX_PAGE_SIZE));
}
__name(normalizePageSize, "normalizePageSize");
function normalizePage(page) {
  if (!page || Number.isNaN(page) || page < 1) return 1;
  return page;
}
__name(normalizePage, "normalizePage");
function parseJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error3) {
    return null;
  }
}
__name(parseJson, "parseJson");
function mapNotificationRow(row) {
  const expiresAt = row.expires_at ?? void 0;
  const priority = row.priority ?? 1;
  const expired = expiresAt ? new Date(expiresAt) < /* @__PURE__ */ new Date() : void 0;
  const highPriority = priority >= 3;
  const scheduleMetadata = parseJson(row.schedule_metadata);
  return {
    userId: row.user_id,
    notificationId: row.notification_id,
    type: row.type,
    title: row.title,
    content: row.content,
    actionUrl: row.action_url ?? void 0,
    actionData: parseJson(row.action_data) ?? void 0,
    imageUrl: row.image_url ?? void 0,
    iconUrl: row.icon_url ?? void 0,
    status: row.status,
    priority,
    category: row.category ?? void 0,
    scheduledAt: row.scheduled_at ?? void 0,
    sentAt: row.sent_at ?? void 0,
    readAt: row.read_at ?? void 0,
    expiresAt,
    createdAt: row.created_at,
    isPersistent: Boolean(row.is_persistent ?? 1),
    senderUserId: row.sender_user_id ?? void 0,
    templateId: row.template_id ?? void 0,
    deliveryChannels: row.delivery_channels ?? void 0,
    pushSent: Boolean(row.push_sent ?? 0),
    emailSent: Boolean(row.email_sent ?? 0),
    smsSent: Boolean(row.sms_sent ?? 0),
    expired,
    highPriority,
    scheduleMetadata
  };
}
__name(mapNotificationRow, "mapNotificationRow");
function toListItem(record) {
  return {
    id: record.notificationId,
    type: record.type,
    category: record.category,
    title: record.title,
    message: record.content,
    content: record.content,
    isRead: record.status === "READ",
    status: record.status,
    priority: record.priority,
    createdAt: record.createdAt,
    readAt: record.readAt,
    scheduledAt: record.scheduledAt,
    expiresAt: record.expiresAt,
    clickUrl: record.actionUrl,
    data: record.actionData ?? void 0,
    imageUrl: record.imageUrl,
    iconUrl: record.iconUrl,
    highPriority: record.highPriority,
    expired: record.expired
  };
}
__name(toListItem, "toListItem");
function mapPreferenceRow(row) {
  return {
    notificationsEnabled: Boolean(row.notifications_enabled),
    pushEnabled: Boolean(row.push_enabled),
    emailEnabled: Boolean(row.email_enabled),
    smsEnabled: Boolean(row.sms_enabled),
    sessionNotifications: Boolean(row.session_notifications),
    sessionReminders: Boolean(row.session_reminders),
    matchingNotifications: Boolean(row.matching_notifications),
    chatNotifications: Boolean(row.chat_notifications),
    levelTestNotifications: Boolean(row.level_test_notifications),
    systemNotifications: Boolean(row.system_notifications),
    marketingNotifications: Boolean(row.marketing_notifications),
    quietHoursEnabled: Boolean(row.quiet_hours_enabled),
    quietHoursStart: row.quiet_hours_start ?? void 0,
    quietHoursEnd: row.quiet_hours_end ?? void 0,
    timezone: row.timezone ?? void 0,
    notificationLanguage: row.notification_language ?? void 0,
    digestEnabled: Boolean(row.digest_enabled),
    digestFrequency: row.digest_frequency ?? void 0,
    digestTime: row.digest_time ?? void 0
  };
}
__name(mapPreferenceRow, "mapPreferenceRow");
function parseRecurringSchedule(raw2) {
  if (!raw2 || typeof raw2 !== "object") {
    return null;
  }
  const record = raw2;
  const typeValue = typeof record.type === "string" ? record.type.toLowerCase() : "";
  if (!["daily", "weekly", "monthly"].includes(typeValue)) {
    return null;
  }
  const intervalValue = record.interval !== void 0 ? Number(record.interval) : void 0;
  const interval = Number.isFinite(intervalValue) && intervalValue !== void 0 && intervalValue > 0 ? Math.floor(intervalValue) : void 0;
  const endDate = typeof record.endDate === "string" ? record.endDate : void 0;
  const time3 = typeof record.time === "string" ? record.time : void 0;
  return {
    type: typeValue,
    interval,
    endDate,
    time: time3
  };
}
__name(parseRecurringSchedule, "parseRecurringSchedule");
function addDays(date, days) {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}
__name(addDays, "addDays");
function addMonths(date, months) {
  const result = new Date(date.getTime());
  const currentDate = result.getUTCDate();
  result.setUTCMonth(result.getUTCMonth() + months);
  while (result.getUTCDate() < currentDate) {
    result.setUTCDate(result.getUTCDate() - 1);
  }
  return result;
}
__name(addMonths, "addMonths");
function applyTimeComponent(date, metadata, fallback) {
  const timeString = metadata.time;
  if (!timeString) {
    date.setUTCHours(
      fallback.getUTCHours(),
      fallback.getUTCMinutes(),
      fallback.getUTCSeconds(),
      fallback.getUTCMilliseconds()
    );
    return;
  }
  const match = timeString.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) {
    date.setUTCHours(
      fallback.getUTCHours(),
      fallback.getUTCMinutes(),
      fallback.getUTCSeconds(),
      fallback.getUTCMilliseconds()
    );
    return;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = match[3] ? Number(match[3]) : 0;
  date.setUTCHours(hours, minutes, seconds, 0);
}
__name(applyTimeComponent, "applyTimeComponent");
function computeNextScheduledAt(currentIso, metadata, reference) {
  if (!currentIso) {
    return null;
  }
  const base = new Date(currentIso);
  if (Number.isNaN(base.getTime())) {
    return null;
  }
  const interval = Math.max(1, metadata.interval ?? 1);
  let next = new Date(base.getTime());
  const advance = /* @__PURE__ */ __name(() => {
    switch (metadata.type) {
      case "daily":
        next = addDays(next, interval);
        break;
      case "weekly":
        next = addDays(next, interval * 7);
        break;
      case "monthly":
        next = addMonths(next, interval);
        break;
      default:
        next = addDays(next, interval);
        break;
    }
  }, "advance");
  advance();
  applyTimeComponent(next, metadata, base);
  const endDate = metadata.endDate ? new Date(metadata.endDate) : null;
  while (next <= reference) {
    advance();
    applyTimeComponent(next, metadata, base);
    if (endDate && next > endDate) {
      return null;
    }
  }
  if (endDate && next > endDate) {
    return null;
  }
  return next.toISOString();
}
__name(computeNextScheduledAt, "computeNextScheduledAt");
async function ensurePreference(env2, userId) {
  const existing = await queryFirst(
    env2.DB,
    "SELECT * FROM notification_preferences WHERE user_id = ? LIMIT 1",
    [userId]
  );
  if (existing) {
    return existing;
  }
  const now = nowIso2();
  await execute(
    env2.DB,
    `INSERT INTO notification_preferences (
        user_id,
        notifications_enabled,
        push_enabled,
        email_enabled,
        sms_enabled,
        session_notifications,
        session_reminders,
        matching_notifications,
        chat_notifications,
        level_test_notifications,
        system_notifications,
        marketing_notifications,
        quiet_hours_enabled,
        timezone,
        notification_language,
        digest_enabled,
        digest_frequency,
        digest_time,
        created_at,
        updated_at
      ) VALUES (?, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, NULL, 'ko', 0, 'DAILY', '09:00', ?, ?)
    `,
    [userId, now, now]
  );
  const inserted = await queryFirst(
    env2.DB,
    "SELECT * FROM notification_preferences WHERE user_id = ? LIMIT 1",
    [userId]
  );
  if (!inserted) {
    throw new Error("\uC54C\uB9BC \uC124\uC815\uC744 \uCD08\uAE30\uD654\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  return inserted;
}
__name(ensurePreference, "ensurePreference");
async function listSubscriptionTopics(env2, userId) {
  const rows = await query(
    env2.DB,
    "SELECT topic FROM notification_topic_subscription WHERE user_id = ? ORDER BY topic",
    [userId]
  );
  return rows.map((row) => row.topic);
}
__name(listSubscriptionTopics, "listSubscriptionTopics");
async function createNotification(env2, payload) {
  const now = nowIso2();
  const actionData = payload.actionData ? JSON.stringify(payload.actionData) : null;
  const templateVariables = payload.templateVariables ? JSON.stringify(payload.templateVariables) : null;
  const scheduleMetadata = payload.scheduleMetadata ? JSON.stringify(payload.scheduleMetadata) : null;
  const status = payload.status ?? (payload.scheduledAt ? "SCHEDULED" : "UNREAD");
  await execute(
    env2.DB,
    `INSERT INTO notifications (
        user_id,
        type,
        title,
        content,
        action_url,
        action_data,
        image_url,
        icon_url,
        status,
        priority,
        category,
        scheduled_at,
        sent_at,
        read_at,
        expires_at,
        is_persistent,
        sender_user_id,
        template_id,
        template_variables,
        schedule_metadata,
        delivery_channels,
        push_sent,
        email_sent,
        sms_sent,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?)
    `,
    [
      payload.userId,
      payload.type,
      payload.title,
      payload.content,
      payload.actionUrl ?? null,
      actionData,
      payload.imageUrl ?? null,
      payload.iconUrl ?? null,
      status,
      payload.priority ?? 1,
      payload.category ?? null,
      payload.scheduledAt ?? null,
      payload.expiresAt ?? null,
      payload.isPersistent === false ? 0 : 1,
      payload.senderUserId ?? null,
      payload.templateId ?? null,
      templateVariables,
      scheduleMetadata,
      payload.deliveryChannels ?? null,
      now,
      now
    ]
  );
  const row = await queryFirst(
    env2.DB,
    "SELECT last_insert_rowid() as id"
  );
  const notificationId = Number(row?.id ?? 0);
  if (!notificationId) {
    throw new Error("\uC54C\uB9BC \uC0DD\uC131 \uACB0\uACFC\uB97C \uD655\uC778\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  return getNotificationById(env2, notificationId);
}
__name(createNotification, "createNotification");
async function getNotificationById(env2, notificationId) {
  const row = await queryFirst(
    env2.DB,
    "SELECT * FROM notifications WHERE notification_id = ? LIMIT 1",
    [notificationId]
  );
  if (!row) {
    throw new Error("\uC54C\uB9BC\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  return mapNotificationRow(row);
}
__name(getNotificationById, "getNotificationById");
async function listNotifications(env2, userId, options = {}) {
  const page = normalizePage(options.page);
  const size = normalizePageSize(options.size);
  const offset = (page - 1) * size;
  const where = ["user_id = ?"];
  const params = [userId];
  if (options.category) {
    where.push("UPPER(category) = UPPER(?)");
    params.push(options.category);
  }
  if (options.unreadOnly) {
    where.push("status = 'UNREAD'");
  } else if (options.status) {
    where.push("status = ?");
    params.push(options.status);
  }
  const whereClause = `WHERE ${where.join(" AND ")}`;
  const totalRow = await queryFirst(
    env2.DB,
    `SELECT COUNT(*) as count FROM notifications ${whereClause}`,
    params
  );
  const rows = await query(
    env2.DB,
    `SELECT * FROM notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
    [...params, size, offset]
  );
  const records = rows.map(mapNotificationRow);
  const unreadCount = await getUnreadCount(env2, userId);
  return {
    data: records.map(toListItem),
    page,
    size,
    total: totalRow?.count ?? 0,
    unreadCount
  };
}
__name(listNotifications, "listNotifications");
async function getUnreadCount(env2, userId) {
  const row = await queryFirst(
    env2.DB,
    "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND status = 'UNREAD'",
    [userId]
  );
  return row?.count ?? 0;
}
__name(getUnreadCount, "getUnreadCount");
async function markAsRead(env2, userId, notificationId) {
  const record = await getNotificationById(env2, notificationId);
  if (record.userId !== userId) {
    throw new Error("\uC54C\uB9BC\uC744 \uC77D\uC74C\uC73C\uB85C \uD45C\uC2DC\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  const now = nowIso2();
  await execute(
    env2.DB,
    `UPDATE notifications
        SET status = 'READ', read_at = ?, updated_at = ?
      WHERE notification_id = ?`,
    [now, now, notificationId]
  );
}
__name(markAsRead, "markAsRead");
async function markAllAsRead(env2, userId) {
  const now = nowIso2();
  await execute(
    env2.DB,
    `UPDATE notifications SET status = 'READ', read_at = ?, updated_at = ?
      WHERE user_id = ? AND status = 'UNREAD'`,
    [now, now, userId]
  );
}
__name(markAllAsRead, "markAllAsRead");
async function deleteNotification(env2, userId, notificationId) {
  await execute(
    env2.DB,
    "DELETE FROM notifications WHERE notification_id = ? AND user_id = ?",
    [notificationId, userId]
  );
}
__name(deleteNotification, "deleteNotification");
async function deleteAllNotifications(env2, userId) {
  await execute(env2.DB, "DELETE FROM notifications WHERE user_id = ?", [userId]);
}
__name(deleteAllNotifications, "deleteAllNotifications");
async function deleteNotificationsBatch(env2, userId, notificationIds) {
  const ids = notificationIds.filter((id) => Number.isFinite(id));
  if (!ids.length) {
    return;
  }
  const placeholders = ids.map(() => "?").join(", ");
  await execute(
    env2.DB,
    `DELETE FROM notifications WHERE user_id = ? AND notification_id IN (${placeholders})`,
    [userId, ...ids]
  );
}
__name(deleteNotificationsBatch, "deleteNotificationsBatch");
async function cancelScheduledNotification(env2, userId, notificationId) {
  const row = await queryFirst(
    env2.DB,
    "SELECT * FROM notifications WHERE notification_id = ? AND user_id = ? LIMIT 1",
    [notificationId, userId]
  );
  if (!row) {
    return false;
  }
  if (row.status !== "SCHEDULED") {
    await deleteNotification(env2, userId, notificationId);
    return true;
  }
  await execute(
    env2.DB,
    "UPDATE notifications SET status = 'CANCELLED', updated_at = ?, schedule_metadata = NULL WHERE notification_id = ?",
    [nowIso2(), notificationId]
  );
  return true;
}
__name(cancelScheduledNotification, "cancelScheduledNotification");
async function listNotificationCategories(env2, userId) {
  const rows = await query(
    env2.DB,
    `SELECT
        COALESCE(category, 'general') AS category,
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'UNREAD' THEN 1 ELSE 0 END) AS unread
      FROM notifications
      WHERE user_id = ?
      GROUP BY COALESCE(category, 'general')
      ORDER BY category`,
    [userId]
  );
  return rows.map((row) => ({
    category: row.category ?? "general",
    total: Number(row.total ?? 0),
    unread: Number(row.unread ?? 0)
  }));
}
__name(listNotificationCategories, "listNotificationCategories");
async function listScheduledNotifications(env2, userId, page, size) {
  const normalizedPage = normalizePage(page);
  const normalizedSize = normalizePageSize(size);
  const offset = (normalizedPage - 1) * normalizedSize;
  const whereClause = `WHERE user_id = ? AND (status = 'SCHEDULED' OR (scheduled_at IS NOT NULL AND datetime(scheduled_at) >= datetime('now'))) `;
  const totalRow = await queryFirst(
    env2.DB,
    `SELECT COUNT(*) AS count FROM notifications ${whereClause}`,
    [userId]
  );
  const rows = await query(
    env2.DB,
    `SELECT * FROM notifications
      ${whereClause}
      ORDER BY scheduled_at ASC, created_at DESC
      LIMIT ? OFFSET ?`,
    [userId, normalizedSize, offset]
  );
  return {
    data: rows.map(mapNotificationRow),
    page: normalizedPage,
    size: normalizedSize,
    total: totalRow ? Number(totalRow.count ?? 0) : 0
  };
}
__name(listScheduledNotifications, "listScheduledNotifications");
async function subscribeToNotificationTopics(env2, userId, topics) {
  const normalized = topics.map((topic) => String(topic).trim().toLowerCase()).filter((topic) => topic.length > 0);
  if (!normalized.length) {
    return listSubscriptionTopics(env2, userId);
  }
  const now = nowIso2();
  for (const topic of new Set(normalized)) {
    await execute(
      env2.DB,
      `INSERT INTO notification_topic_subscription (user_id, topic, created_at, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, topic) DO UPDATE SET updated_at = excluded.updated_at`,
      [userId, topic, now, now]
    );
  }
  return listSubscriptionTopics(env2, userId);
}
__name(subscribeToNotificationTopics, "subscribeToNotificationTopics");
async function unsubscribeFromNotificationTopics(env2, userId, topics) {
  const normalized = topics.map((topic) => String(topic).trim().toLowerCase()).filter((topic) => topic.length > 0);
  if (!normalized.length) {
    return listSubscriptionTopics(env2, userId);
  }
  const placeholders = normalized.map(() => "?").join(", ");
  await execute(
    env2.DB,
    `DELETE FROM notification_topic_subscription WHERE user_id = ? AND topic IN (${placeholders})`,
    [userId, ...normalized]
  );
  return listSubscriptionTopics(env2, userId);
}
__name(unsubscribeFromNotificationTopics, "unsubscribeFromNotificationTopics");
async function scheduleNotification(env2, userId, payload) {
  return createNotification(env2, {
    userId,
    type: payload.type ?? "SCHEDULED",
    title: payload.title,
    content: payload.message,
    actionData: payload.data ?? null,
    scheduledAt: payload.scheduledAt,
    status: "SCHEDULED",
    scheduleMetadata: payload.recurring ?? null,
    priority: payload.priority ?? 2,
    category: payload.category ?? "scheduled",
    deliveryChannels: payload.deliveryChannels ?? void 0
  });
}
__name(scheduleNotification, "scheduleNotification");
async function sendTestNotification(env2, userId, type) {
  return createNotification(env2, {
    userId,
    type: type ?? "TEST",
    title: "\uD14C\uC2A4\uD2B8 \uC54C\uB9BC",
    content: "\uD14C\uC2A4\uD2B8 \uC54C\uB9BC\uC785\uB2C8\uB2E4.",
    category: "test",
    priority: 1
  });
}
__name(sendTestNotification, "sendTestNotification");
async function sendUrgentNotifications(env2, initiatorUserId, recipients, payload) {
  const normalized = recipients.map((id) => String(id).trim()).filter((id) => id.length > 0);
  let targetIds = [];
  const hasAll = normalized.some((id) => id.toLowerCase() === "all");
  if (hasAll) {
    const rows = await query(
      env2.DB,
      "SELECT user_id FROM users ORDER BY created_at DESC LIMIT 200"
    );
    targetIds = rows.map((row) => row.user_id);
  } else {
    targetIds = Array.from(new Set(normalized.filter((id) => id.toLowerCase() !== "all")));
  }
  if (!targetIds.length) {
    return { delivered: 0 };
  }
  const jobs = targetIds.map(
    (targetId) => createNotification(env2, {
      userId: targetId,
      type: payload.type ?? "URGENT",
      title: payload.title,
      content: payload.message,
      actionData: payload.data ?? null,
      expiresAt: payload.expiresAt ?? void 0,
      priority: payload.priority ?? 3,
      category: payload.category ?? "urgent",
      senderUserId: initiatorUserId
    }).catch((error3) => {
      console.error("[notifications] failed to send urgent notification", error3);
      return null;
    })
  );
  const results = await Promise.all(jobs);
  const delivered = results.filter((record) => record !== null).length;
  return { delivered };
}
__name(sendUrgentNotifications, "sendUrgentNotifications");
async function processScheduledNotifications(env2, limit = 100) {
  const nowIsoStr = nowIso2();
  const reference = new Date(nowIsoStr);
  const rows = await query(
    env2.DB,
    "SELECT * FROM notifications WHERE status = 'SCHEDULED' AND scheduled_at IS NOT NULL AND datetime(scheduled_at) <= datetime(?) LIMIT ?",
    [nowIsoStr, limit]
  );
  let processed = 0;
  for (const row of rows) {
    try {
      await execute(
        env2.DB,
        "UPDATE notifications SET status = 'UNREAD', sent_at = ?, updated_at = ?, schedule_metadata = NULL WHERE notification_id = ?",
        [nowIsoStr, nowIsoStr, row.notification_id]
      );
      processed += 1;
      const metadata = parseRecurringSchedule(parseJson(row.schedule_metadata));
      if (metadata) {
        const nextScheduledAt = computeNextScheduledAt(row.scheduled_at ?? row.created_at, metadata, reference);
        if (nextScheduledAt) {
          const actionData = parseJson(row.action_data);
          const templateVariables = parseJson(row.template_variables);
          await createNotification(env2, {
            userId: row.user_id,
            type: row.type,
            title: row.title,
            content: row.content,
            actionUrl: row.action_url ?? void 0,
            actionData: actionData ?? null,
            imageUrl: row.image_url ?? void 0,
            iconUrl: row.icon_url ?? void 0,
            priority: row.priority ?? void 0,
            category: row.category ?? void 0,
            scheduledAt: nextScheduledAt,
            status: "SCHEDULED",
            scheduleMetadata: metadata,
            isPersistent: row.is_persistent !== null ? Boolean(row.is_persistent) : void 0,
            senderUserId: row.sender_user_id ?? void 0,
            templateId: row.template_id ?? void 0,
            templateVariables: templateVariables ?? null,
            deliveryChannels: row.delivery_channels ?? void 0
          });
        }
      }
    } catch (error3) {
      console.error("[notifications] failed to process scheduled notification", error3);
    }
  }
  return processed;
}
__name(processScheduledNotifications, "processScheduledNotifications");
async function getNotificationPreferences(env2, userId) {
  const row = await ensurePreference(env2, userId);
  const base = mapPreferenceRow(row);
  const subscriptionTopics = await listSubscriptionTopics(env2, userId);
  return {
    ...base,
    subscriptionTopics
  };
}
__name(getNotificationPreferences, "getNotificationPreferences");
async function updateNotificationPreferences(env2, userId, settings) {
  await ensurePreference(env2, userId);
  const now = nowIso2();
  const setClauses = [];
  const params = [];
  const booleanFields = [
    "notificationsEnabled",
    "pushEnabled",
    "emailEnabled",
    "smsEnabled",
    "sessionNotifications",
    "sessionReminders",
    "matchingNotifications",
    "chatNotifications",
    "levelTestNotifications",
    "systemNotifications",
    "marketingNotifications",
    "quietHoursEnabled",
    "digestEnabled"
  ];
  for (const field of booleanFields) {
    if (settings[field] !== void 0) {
      const column = field.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
      setClauses.push(`${column} = ?`);
      params.push(settings[field] ? 1 : 0);
    }
  }
  if (settings.quietHoursStart !== void 0) {
    setClauses.push("quiet_hours_start = ?");
    params.push(settings.quietHoursStart ?? null);
  }
  if (settings.quietHoursEnd !== void 0) {
    setClauses.push("quiet_hours_end = ?");
    params.push(settings.quietHoursEnd ?? null);
  }
  if (settings.timezone !== void 0) {
    setClauses.push("timezone = ?");
    params.push(settings.timezone ?? null);
  }
  if (settings.notificationLanguage !== void 0) {
    setClauses.push("notification_language = ?");
    params.push(settings.notificationLanguage ?? null);
  }
  if (settings.digestFrequency !== void 0) {
    setClauses.push("digest_frequency = ?");
    params.push(settings.digestFrequency ?? null);
  }
  if (settings.digestTime !== void 0) {
    setClauses.push("digest_time = ?");
    params.push(settings.digestTime ?? null);
  }
  if (setClauses.length > 0) {
    setClauses.push("updated_at = ?");
    params.push(now, userId);
    await execute(
      env2.DB,
      `UPDATE notification_preferences SET ${setClauses.join(", ")} WHERE user_id = ?`,
      params
    );
  }
  return getNotificationPreferences(env2, userId);
}
__name(updateNotificationPreferences, "updateNotificationPreferences");
async function getNotificationStats(env2, userId) {
  const totals = await queryFirst(
    env2.DB,
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN status = 'UNREAD' THEN 1 ELSE 0 END) AS unread,
            SUM(CASE WHEN status = 'READ' THEN 1 ELSE 0 END) AS read
       FROM notifications
      WHERE user_id = ?`,
    [userId]
  );
  const todayKey = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const todayRow = await queryFirst(
    env2.DB,
    `SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND substr(created_at, 1, 10) = ?`,
    [userId, todayKey]
  );
  const categoryRows = await query(
    env2.DB,
    `SELECT COALESCE(category, 'UNCATEGORIZED') as category, COUNT(*) as cnt
       FROM notifications
      WHERE user_id = ?
      GROUP BY COALESCE(category, 'UNCATEGORIZED')`,
    [userId]
  );
  const categories = {};
  for (const row of categoryRows) {
    categories[row.category ?? "UNCATEGORIZED"] = row.cnt;
  }
  return {
    total: totals?.total ?? 0,
    unread: totals?.unread ?? 0,
    read: totals?.read ?? 0,
    today: todayRow?.count ?? 0,
    categories
  };
}
__name(getNotificationStats, "getNotificationStats");
async function registerPushToken(env2, userId, token, deviceType) {
  const now = nowIso2();
  await execute(
    env2.DB,
    `INSERT INTO notification_push_tokens (user_id, token, device_type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(token) DO UPDATE SET updated_at = excluded.updated_at, user_id = excluded.user_id, device_type = excluded.device_type`,
    [userId, token, deviceType ?? "web", now, now]
  );
}
__name(registerPushToken, "registerPushToken");
async function unregisterPushToken(env2, userId, token) {
  await execute(
    env2.DB,
    "DELETE FROM notification_push_tokens WHERE token = ? AND user_id = ?",
    [token, userId]
  );
}
__name(unregisterPushToken, "unregisterPushToken");
async function createNotificationFromTemplate(env2, userId, templateId, variables, options = {}) {
  const title2 = options.title ?? `Template ${templateId}`;
  const content = options.content ?? "\uC54C\uB9BC\uC774 \uB3C4\uCC29\uD588\uC2B5\uB2C8\uB2E4.";
  return createNotification(env2, {
    userId,
    type: options.type ?? "SYSTEM",
    title: title2,
    content,
    templateId,
    templateVariables: variables ?? null,
    ...options
  });
}
__name(createNotificationFromTemplate, "createNotificationFromTemplate");

// src/routes/notifications.ts
var notificationsRoutes = new Hono2();
var requireAuth4 = auth();
function parseBoolean(value) {
  if (value === void 0) return void 0;
  const lowered = value.toLowerCase();
  if (["true", "1", "yes", "y"].includes(lowered)) return true;
  if (["false", "0", "no", "n"].includes(lowered)) return false;
  return void 0;
}
__name(parseBoolean, "parseBoolean");
notificationsRoutes.use("*", requireAuth4);
notificationsRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const page = Number(c.req.query("page")) || 1;
  const size = Number(c.req.query("size")) || 20;
  const unreadOnly = parseBoolean(c.req.query("unreadOnly")) ?? void 0;
  const isRead = parseBoolean(c.req.query("isRead"));
  let status;
  if (isRead === true) status = "READ";
  else if (isRead === false) status = "UNREAD";
  const result = await listNotifications(c.env, userId, {
    page,
    size,
    category: c.req.query("category") ?? c.req.query("type") ?? void 0,
    status,
    unreadOnly
  });
  return successResponse(c, {
    notifications: result.data,
    unreadCount: result.unreadCount,
    pagination: {
      page: result.page,
      size: result.size,
      total: result.total,
      totalPages: Math.ceil(result.total / result.size)
    }
  });
});
notificationsRoutes.get("/unread", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const result = await listNotifications(c.env, userId, { page: 1, size: 50, unreadOnly: true });
  return successResponse(c, { notifications: result.data, unreadCount: result.unreadCount });
});
notificationsRoutes.get("/unread-count", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const count3 = await getUnreadCount(c.env, userId);
  return successResponse(c, { unreadCount: count3 });
});
notificationsRoutes.get("/categories", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const categories = await listNotificationCategories(c.env, userId);
  return successResponse(c, categories);
});
notificationsRoutes.get("/history", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const page = Math.max(Number(c.req.query("page") ?? "1"), 1);
  const size = Math.max(Math.min(Number(c.req.query("size") ?? "20"), 100), 1);
  const category = c.req.query("category") ?? void 0;
  const status = c.req.query("status") ?? void 0;
  const unreadOnlyParam = c.req.query("unreadOnly");
  const unreadOnly = typeof unreadOnlyParam === "string" ? ["true", "1"].includes(unreadOnlyParam.toLowerCase()) : false;
  const result = await listNotifications(c.env, userId, {
    page,
    size,
    category,
    status,
    unreadOnly
  });
  return successResponse(c, result);
});
notificationsRoutes.get("/scheduled", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const page = Math.max(Number(c.req.query("page") ?? "1"), 1);
  const size = Math.max(Math.min(Number(c.req.query("size") ?? "20"), 100), 1);
  const result = await listScheduledNotifications(c.env, userId, page, size);
  return successResponse(c, result);
});
notificationsRoutes.get("/category/:category", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const category = c.req.param("category");
  const page = Number(c.req.query("page")) || 1;
  const size = Number(c.req.query("size")) || 20;
  const result = await listNotifications(c.env, userId, { page, size, category });
  return successResponse(c, {
    notifications: result.data,
    pagination: {
      page: result.page,
      size: result.size,
      total: result.total,
      totalPages: Math.ceil(result.total / result.size)
    }
  });
});
notificationsRoutes.get("/:notificationId", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const notificationId = Number(c.req.param("notificationId"));
  if (!Number.isFinite(notificationId)) throw new AppError("Invalid notificationId", 400, "INVALID_PATH_PARAM");
  const record = await getNotificationById(c.env, notificationId);
  if (record && record.notificationId && record.notificationId !== notificationId) {
    throw new AppError("\uC54C\uB9BC\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", 404, "NOTIFICATION_NOT_FOUND");
  }
  if (record && record.userId !== userId) {
    throw new AppError("\uC811\uADFC \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.", 403, "NOTIFICATION_FORBIDDEN");
  }
  return successResponse(c, record);
});
notificationsRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const userId = typeof body.userId === "string" ? body.userId : c.get("userId");
  if (!userId) throw new AppError("userId is required", 400, "INVALID_PAYLOAD");
  if (!body.title || !body.content || !body.type) {
    throw new AppError("type, title, content are required", 400, "INVALID_PAYLOAD");
  }
  const record = await createNotification(c.env, {
    userId,
    type: body.type,
    title: body.title,
    content: body.content,
    actionUrl: body.actionUrl,
    actionData: body.actionData,
    imageUrl: body.imageUrl,
    iconUrl: body.iconUrl,
    priority: body.priority,
    category: body.category,
    scheduledAt: body.scheduledAt,
    expiresAt: body.expiresAt,
    isPersistent: body.isPersistent,
    senderUserId: body.senderUserId,
    templateId: body.templateId,
    templateVariables: body.templateVariables,
    deliveryChannels: body.deliveryChannels
  });
  return successResponse(c, record);
});
notificationsRoutes.post("/schedule", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  const notification = body.notification ?? body;
  const scheduledAt = typeof body.scheduledAt === "string" ? body.scheduledAt : typeof notification?.scheduledAt === "string" ? notification.scheduledAt : void 0;
  if (!scheduledAt) {
    throw new AppError("scheduledAt is required", 400, "INVALID_PAYLOAD");
  }
  const record = await scheduleNotification(c.env, userId, {
    title: notification?.title ?? "Scheduled Notification",
    message: notification?.message ?? notification?.content ?? "\uC54C\uB9BC \uB0B4\uC6A9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
    type: notification?.type ?? "SCHEDULED",
    data: notification?.data ?? notification?.actionData ?? null,
    scheduledAt,
    recurring: notification?.recurring ?? body.recurring ?? null,
    priority: notification?.priority,
    category: notification?.category ?? "scheduled",
    deliveryChannels: notification?.deliveryChannels ?? void 0
  });
  return successResponse(c, record);
});
notificationsRoutes.post("/subscribe", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  const topics = Array.isArray(body.topics) ? body.topics : [];
  const updated = await subscribeToNotificationTopics(c.env, userId, topics);
  return successResponse(c, { topics: updated });
});
notificationsRoutes.post("/unsubscribe", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  const topics = Array.isArray(body.topics) ? body.topics : [];
  const updated = await unsubscribeFromNotificationTopics(c.env, userId, topics);
  return successResponse(c, { topics: updated });
});
notificationsRoutes.post("/template/:templateId", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const templateId = c.req.param("templateId");
  const body = await c.req.json().catch(() => ({}));
  const record = await createNotificationFromTemplate(c.env, userId, templateId, body.variables, {
    type: body.type,
    title: body.title,
    content: body.content,
    actionUrl: body.actionUrl,
    actionData: body.actionData
  });
  return successResponse(c, record);
});
notificationsRoutes.post("/test", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  const record = await sendTestNotification(c.env, userId, typeof body.type === "string" ? body.type : null);
  return successResponse(c, record);
});
notificationsRoutes.post("/urgent", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  const notification = body.notification ?? body;
  const recipients = Array.isArray(body.recipients) ? body.recipients : [];
  const result = await sendUrgentNotifications(c.env, userId, recipients, {
    title: notification?.title ?? "\uAE34\uAE09 \uC54C\uB9BC",
    message: notification?.message ?? notification?.content ?? "",
    type: notification?.type ?? "URGENT",
    expiresAt: notification?.expiresAt ?? void 0,
    priority: notification?.priority ?? 4,
    category: notification?.category ?? "urgent",
    data: notification?.data ?? notification?.actionData ?? null
  });
  return successResponse(c, result);
});
notificationsRoutes.patch("/:notificationId/read", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const notificationId = Number(c.req.param("notificationId"));
  if (!Number.isFinite(notificationId)) throw new AppError("Invalid notificationId", 400, "INVALID_PATH_PARAM");
  await markAsRead(c.env, userId, notificationId);
  return successResponse(c, { success: true });
});
notificationsRoutes.patch("/read-all", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  await markAllAsRead(c.env, userId);
  return successResponse(c, { success: true });
});
notificationsRoutes.delete("/batch", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  const rawIds = Array.isArray(body.notificationIds) ? body.notificationIds : Array.isArray(body.ids) ? body.ids : Array.isArray(body) ? body : [];
  const ids = rawIds.map((value) => Number(value)).filter((id) => Number.isFinite(id));
  await deleteNotificationsBatch(c.env, userId, ids);
  return successResponse(c, { success: true });
});
notificationsRoutes.delete("/scheduled/:notificationId", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const notificationId = Number(c.req.param("notificationId"));
  if (!Number.isFinite(notificationId)) {
    throw new AppError("Invalid notificationId", 400, "INVALID_PATH_PARAM");
  }
  const cancelled = await cancelScheduledNotification(c.env, userId, notificationId);
  if (!cancelled) {
    throw new AppError("\uC608\uC57D \uC54C\uB9BC\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", 404, "SCHEDULED_NOTIFICATION_NOT_FOUND");
  }
  return successResponse(c, { success: true });
});
notificationsRoutes.delete("/:notificationId", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const notificationId = Number(c.req.param("notificationId"));
  if (!Number.isFinite(notificationId)) throw new AppError("Invalid notificationId", 400, "INVALID_PATH_PARAM");
  await deleteNotification(c.env, userId, notificationId);
  return successResponse(c, { success: true });
});
notificationsRoutes.delete("/all", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  await deleteAllNotifications(c.env, userId);
  return successResponse(c, { success: true });
});
notificationsRoutes.get("/settings", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const prefs = await getNotificationPreferences(c.env, userId);
  return successResponse(c, prefs);
});
function mapNotificationSettingsPayload(body) {
  const payload = {};
  const booleanMap = [
    ["notificationsEnabled", "notificationsEnabled"],
    ["notificationsEnabled", "notifications"],
    ["pushEnabled", "pushEnabled"],
    ["pushEnabled", "pushNotifications"],
    ["emailEnabled", "emailEnabled"],
    ["emailEnabled", "emailNotifications"],
    ["smsEnabled", "smsEnabled"],
    ["smsEnabled", "smsNotifications"],
    ["sessionNotifications", "sessionNotifications"],
    ["sessionReminders", "sessionReminderNotifications"],
    ["matchingNotifications", "matchRequestNotifications"],
    ["chatNotifications", "chatMessageNotifications"],
    ["systemNotifications", "systemNotifications"],
    ["marketingNotifications", "marketingNotifications"],
    ["quietHoursEnabled", "quietHoursEnabled"],
    ["digestEnabled", "digestEnabled"]
  ];
  for (const [targetKey, sourceKey] of booleanMap) {
    if (Object.prototype.hasOwnProperty.call(body, sourceKey)) {
      payload[targetKey] = Boolean(body[sourceKey]);
    }
  }
  if (typeof body.quietHours === "object" && body.quietHours !== null) {
    const quiet = body.quietHours;
    if (quiet.start !== void 0) payload.quietHoursStart = quiet.start ?? null;
    if (quiet.end !== void 0) payload.quietHoursEnd = quiet.end ?? null;
  }
  if (body.quietHoursStart !== void 0) payload.quietHoursStart = body.quietHoursStart ?? null;
  if (body.quietHoursEnd !== void 0) payload.quietHoursEnd = body.quietHoursEnd ?? null;
  if (body.notificationSound !== void 0) payload.notificationSound = body.notificationSound ?? null;
  if (body.timezone !== void 0) payload.timezone = body.timezone ?? null;
  if (body.notificationLanguage !== void 0) payload.notificationLanguage = body.notificationLanguage ?? null;
  if (body.digestFrequency !== void 0) payload.digestFrequency = body.digestFrequency ?? null;
  if (body.digestTime !== void 0) payload.digestTime = body.digestTime ?? null;
  return payload;
}
__name(mapNotificationSettingsPayload, "mapNotificationSettingsPayload");
notificationsRoutes.patch("/settings", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  const payload = mapNotificationSettingsPayload(body);
  const prefs = await updateNotificationPreferences(c.env, userId, payload);
  return successResponse(c, prefs);
});
notificationsRoutes.get("/stats", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const stats = await getNotificationStats(c.env, userId);
  return successResponse(c, stats);
});
notificationsRoutes.post("/push-token", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  const token = c.req.query("token") ?? body.token;
  if (!token || typeof token !== "string") {
    throw new AppError("token is required", 400, "INVALID_PAYLOAD");
  }
  const deviceType = c.req.query("deviceType") ?? body.deviceType ?? "web";
  await registerPushToken(c.env, userId, token, deviceType);
  return successResponse(c, { success: true });
});
notificationsRoutes.delete("/push-token", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  const token = c.req.query("token") ?? body.token;
  if (!token || typeof token !== "string") {
    throw new AppError("token is required", 400, "INVALID_PAYLOAD");
  }
  await unregisterPushToken(c.env, userId, token);
  return successResponse(c, { success: true });
});
var notifications_default = notificationsRoutes;

// src/routes/groupSessions.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_errors();

// src/services/groupSessions.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();

// src/services/groupSessionsCache.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var CACHE_PREFIX = "group-session";
var DEFAULT_TTL_SECONDS2 = 60 * 5;
function getCache(env2) {
  return new CacheService(env2.CACHE, CACHE_PREFIX, DEFAULT_TTL_SECONDS2);
}
__name(getCache, "getCache");
function cloneParticipants(participants) {
  return participants ? participants.map((participant) => ({ ...participant })) : void 0;
}
__name(cloneParticipants, "cloneParticipants");
function sanitizeRecord(record) {
  return {
    ...record,
    canJoin: false,
    participants: cloneParticipants(record.participants)
  };
}
__name(sanitizeRecord, "sanitizeRecord");
async function setCachedGroupSession(env2, record) {
  const cache = getCache(env2);
  await cache.set(record.id, sanitizeRecord(record), {
    ttl: DEFAULT_TTL_SECONDS2,
    tags: [`session:${record.id}`]
  });
}
__name(setCachedGroupSession, "setCachedGroupSession");
async function getCachedGroupSession(env2, sessionId) {
  const cache = getCache(env2);
  const cached = await cache.get(sessionId);
  if (!cached) {
    return null;
  }
  return {
    ...cached,
    participants: cloneParticipants(cached.participants)
  };
}
__name(getCachedGroupSession, "getCachedGroupSession");
async function invalidateGroupSessionCache(env2, sessionId) {
  const cache = getCache(env2);
  await cache.delete(sessionId);
}
__name(invalidateGroupSessionCache, "invalidateGroupSessionCache");

// src/services/groupSessionsState.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var INVITATION_PREFIX = "group-session:invitation";
var ACTIVE_PREFIX = "group-session:user-active";
var RECENT_PREFIX = "group-session:recent";
var INVITATION_TTL_SECONDS = 60 * 60 * 24 * 3;
var ACTIVE_TTL_SECONDS = 60 * 60 * 24;
var RECENT_MAX = 10;
function invitationKey(sessionId, userId) {
  return `${INVITATION_PREFIX}:${sessionId}:${userId}`;
}
__name(invitationKey, "invitationKey");
function activeKey(userId) {
  return `${ACTIVE_PREFIX}:${userId}`;
}
__name(activeKey, "activeKey");
function recentKey(userId) {
  return `${RECENT_PREFIX}:${userId}`;
}
__name(recentKey, "recentKey");
async function saveInvitation(env2, sessionId, userId, hostUserId) {
  const record = {
    sessionId,
    userId,
    hostUserId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await env2.CACHE.put(invitationKey(sessionId, userId), JSON.stringify(record), {
    expirationTtl: INVITATION_TTL_SECONDS
  });
}
__name(saveInvitation, "saveInvitation");
async function getInvitation(env2, sessionId, userId) {
  const raw2 = await env2.CACHE.get(invitationKey(sessionId, userId), { type: "json" });
  return raw2 ?? null;
}
__name(getInvitation, "getInvitation");
async function deleteInvitation(env2, sessionId, userId) {
  await env2.CACHE.delete(invitationKey(sessionId, userId));
}
__name(deleteInvitation, "deleteInvitation");
async function addActiveSession(env2, userId, sessionId) {
  const key = activeKey(userId);
  const existing = await env2.CACHE.get(key, { type: "json" });
  const set = new Set(existing?.sessions ?? []);
  set.add(sessionId);
  const record = {
    userId,
    sessions: Array.from(set),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await env2.CACHE.put(key, JSON.stringify(record), { expirationTtl: ACTIVE_TTL_SECONDS });
}
__name(addActiveSession, "addActiveSession");
async function removeActiveSession(env2, userId, sessionId) {
  const key = activeKey(userId);
  const existing = await env2.CACHE.get(key, { type: "json" });
  if (!existing) {
    return;
  }
  const set = new Set(existing.sessions);
  set.delete(sessionId);
  const record = {
    userId,
    sessions: Array.from(set),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (record.sessions.length === 0) {
    await env2.CACHE.delete(key);
  } else {
    await env2.CACHE.put(key, JSON.stringify(record), { expirationTtl: ACTIVE_TTL_SECONDS });
  }
}
__name(removeActiveSession, "removeActiveSession");
async function addRecentSession(env2, userId, sessionId) {
  const key = recentKey(userId);
  const existing = await env2.CACHE.get(key, { type: "json" });
  const recent = (existing ?? []).filter((id) => id !== sessionId);
  recent.unshift(sessionId);
  const trimmed = recent.slice(0, RECENT_MAX);
  await env2.CACHE.put(key, JSON.stringify(trimmed), { expirationTtl: ACTIVE_TTL_SECONDS });
}
__name(addRecentSession, "addRecentSession");

// src/services/groupSessions.ts
var GROUP_STATUS = {
  SCHEDULED: "SCHEDULED",
  WAITING: "WAITING",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
};
var PARTICIPANT_STATUS = {
  INVITED: "INVITED",
  JOINED: "JOINED",
  LEFT: "LEFT",
  KICKED: "KICKED",
  BANNED: "BANNED"
};
function nowIso3() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(nowIso3, "nowIso");
function newJoinCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
__name(newJoinCode, "newJoinCode");
function mapGroupSession(row, participants = [], currentUserId) {
  const isPublic = row.is_public === null ? void 0 : Number(row.is_public) !== 0;
  const currentParticipants = Number(row.current_participants ?? 0);
  const maxParticipants = row.max_participants !== null ? Number(row.max_participants) : void 0;
  const status = row.status ?? GROUP_STATUS.SCHEDULED;
  const tags = row.session_tags ? row.session_tags.split(",").map((t) => t.trim()).filter(Boolean) : void 0;
  return {
    id: row.session_id,
    title: row.title,
    description: row.description ?? void 0,
    hostUserId: row.host_user_id,
    hostUserName: row.host_user_name ?? void 0,
    hostProfileImage: row.host_profile_image ?? void 0,
    topicCategory: row.topic_category ?? void 0,
    targetLanguage: row.target_language ?? void 0,
    languageLevel: row.language_level ?? void 0,
    maxParticipants,
    currentParticipants,
    scheduledAt: row.scheduled_at ?? void 0,
    sessionDuration: row.session_duration !== null ? Number(row.session_duration) : void 0,
    status,
    roomId: row.room_id ?? void 0,
    sessionTags: tags && tags.length > 0 ? tags : void 0,
    isPublic,
    joinCode: row.join_code ?? void 0,
    startedAt: row.started_at ?? void 0,
    endedAt: row.ended_at ?? void 0,
    ratingAverage: row.rating_average !== null ? Number(row.rating_average) : void 0,
    ratingCount: row.rating_count !== null ? Number(row.rating_count) : void 0,
    participants,
    canJoin: currentUserId !== void 0 && row.host_user_id !== currentUserId && (isPublic ?? false) && status === GROUP_STATUS.SCHEDULED && currentParticipants < (maxParticipants ?? 10),
    joinMessage: void 0
  };
}
__name(mapGroupSession, "mapGroupSession");
function cloneParticipants2(participants) {
  return participants ? participants.map((participant) => ({ ...participant })) : void 0;
}
__name(cloneParticipants2, "cloneParticipants");
function applyJoinMetadata(record, currentUserId) {
  const cloned = {
    ...record,
    participants: cloneParticipants2(record.participants)
  };
  const isPublic = record.isPublic ?? false;
  const status = record.status ?? GROUP_STATUS.SCHEDULED;
  const maxParticipants = record.maxParticipants ?? 10;
  cloned.canJoin = currentUserId !== void 0 && record.hostUserId !== currentUserId && isPublic && status === GROUP_STATUS.SCHEDULED && record.currentParticipants < maxParticipants;
  return cloned;
}
__name(applyJoinMetadata, "applyJoinMetadata");
function mapGroupList(row, currentUserId) {
  const scheduledAt = row.scheduled_at ?? void 0;
  const status = row.status ?? GROUP_STATUS.SCHEDULED;
  let timeUntilStart;
  if (scheduledAt) {
    const diffMs = new Date(scheduledAt).getTime() - Date.now();
    if (diffMs > 0) {
      const hours = Math.floor(diffMs / 36e5);
      const minutes = Math.floor(diffMs % 36e5 / 6e4);
      timeUntilStart = `${hours}h ${minutes}m`;
    }
  }
  const tags = row.session_tags ? row.session_tags.split(",").map((t) => t.trim()).filter(Boolean) : void 0;
  return {
    id: row.session_id,
    title: row.title,
    description: row.description ?? void 0,
    hostUserName: row.host_user_name ?? void 0,
    hostProfileImage: row.host_profile_image ?? void 0,
    topicCategory: row.topic_category ?? void 0,
    targetLanguage: row.target_language ?? void 0,
    languageLevel: row.language_level ?? void 0,
    maxParticipants: row.max_participants !== null ? Number(row.max_participants) : void 0,
    currentParticipants: Number(row.current_participants ?? 0),
    scheduledAt,
    sessionDuration: row.session_duration !== null ? Number(row.session_duration) : void 0,
    status,
    sessionTags: tags && tags.length > 0 ? tags : void 0,
    ratingAverage: row.rating_average !== null ? Number(row.rating_average) : void 0,
    ratingCount: row.rating_count !== null ? Number(row.rating_count) : void 0,
    canJoin: currentUserId !== void 0 && row.host_user_id !== currentUserId && status === GROUP_STATUS.SCHEDULED && Number(row.current_participants ?? 0) < Number(row.max_participants ?? 10),
    timeUntilStart
  };
}
__name(mapGroupList, "mapGroupList");
async function fetchParticipants(env2, sessionId) {
  const rows = await query(
    env2.DB,
    `SELECT gsp.*, u.name AS user_name, u.profile_image AS profile_image
       FROM group_session_participants gsp
       LEFT JOIN users u ON u.user_id = gsp.user_id
      WHERE gsp.session_id = ?
      ORDER BY gsp.joined_at ASC`,
    [sessionId]
  );
  return rows.map((row) => ({
    userId: row.user_id,
    userName: row.user_name ?? void 0,
    profileImage: row.profile_image ?? void 0,
    status: row.status ?? void 0,
    joinedAt: row.joined_at ?? void 0,
    isMuted: row.is_muted === null ? void 0 : Boolean(row.is_muted),
    isVideoEnabled: row.is_video_enabled === null ? void 0 : Boolean(row.is_video_enabled)
  }));
}
__name(fetchParticipants, "fetchParticipants");
async function createGroupSession(env2, hostUserId, payload) {
  const now = nowIso3();
  const sessionId = crypto.randomUUID();
  const joinCode = newJoinCode();
  await execute(
    env2.DB,
    `INSERT INTO group_sessions (
        session_id,
        title,
        description,
        host_user_id,
        topic_category,
        target_language,
        language_level,
        max_participants,
        current_participants,
        scheduled_at,
        session_duration,
        status,
        room_id,
        session_tags,
        is_public,
        join_code,
        started_at,
        ended_at,
        rating_average,
        rating_count,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, NULL, ?, ?, ?, NULL, NULL, 0, 0, ?, ?)
    `,
    [
      sessionId,
      payload.title,
      payload.description ?? null,
      hostUserId,
      payload.topicCategory,
      payload.targetLanguage,
      payload.languageLevel,
      payload.maxParticipants,
      payload.scheduledAt,
      payload.sessionDuration,
      GROUP_STATUS.SCHEDULED,
      payload.sessionTags ? payload.sessionTags.join(",") : null,
      payload.isPublic ? 1 : 0,
      joinCode,
      now,
      now
    ]
  );
  await execute(
    env2.DB,
    `INSERT INTO group_session_participants (
        participant_id,
        session_id,
        user_id,
        status,
        joined_at,
        left_at,
        participation_duration,
        rating,
        feedback,
        connection_quality,
        is_muted,
        is_video_enabled,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, 0, 1, ?, ?)
    `,
    [crypto.randomUUID(), sessionId, hostUserId, PARTICIPANT_STATUS.JOINED, now, now, now]
  );
  const row = await queryFirst(
    env2.DB,
    `SELECT gs.*, host.name AS host_user_name, host.profile_image AS host_profile_image
       FROM group_sessions gs
       LEFT JOIN users host ON host.user_id = gs.host_user_id
      WHERE gs.session_id = ?
      LIMIT 1`,
    [sessionId]
  );
  if (!row) {
    throw new Error("\uADF8\uB8F9 \uC138\uC158\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  const participants = await fetchParticipants(env2, sessionId);
  const baseRecord = mapGroupSession(row, participants);
  await setCachedGroupSession(env2, baseRecord);
  await addActiveSession(env2, hostUserId, sessionId);
  await addRecentSession(env2, hostUserId, sessionId);
  return applyJoinMetadata(baseRecord, hostUserId);
}
__name(createGroupSession, "createGroupSession");
async function getGroupSessionById(env2, sessionId, currentUserId) {
  const cached = await getCachedGroupSession(env2, sessionId);
  if (cached) {
    if (currentUserId) {
      await addRecentSession(env2, currentUserId, sessionId);
    }
    return applyJoinMetadata(cached, currentUserId);
  }
  const row = await queryFirst(
    env2.DB,
    `SELECT gs.*, host.name AS host_user_name, host.profile_image AS host_profile_image
       FROM group_sessions gs
       LEFT JOIN users host ON host.user_id = gs.host_user_id
      WHERE gs.session_id = ?
      LIMIT 1`,
    [sessionId]
  );
  if (!row) throw new Error("\uADF8\uB8F9 \uC138\uC158\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  const participants = await fetchParticipants(env2, sessionId);
  const baseRecord = mapGroupSession(row, participants);
  await setCachedGroupSession(env2, baseRecord);
  return applyJoinMetadata(baseRecord, currentUserId);
}
__name(getGroupSessionById, "getGroupSessionById");
async function ensureParticipant(env2, sessionId, userId) {
  return queryFirst(
    env2.DB,
    `SELECT * FROM group_session_participants WHERE session_id = ? AND user_id = ? LIMIT 1`,
    [sessionId, userId]
  );
}
__name(ensureParticipant, "ensureParticipant");
async function joinGroupSession(env2, userId, sessionId, payload = {}) {
  const session = await getGroupSessionById(env2, sessionId);
  if (session.hostUserId === userId) {
    return session;
  }
  if (session.status !== GROUP_STATUS.SCHEDULED) {
    throw new Error("\uC774\uBBF8 \uC9C4\uD589 \uC911\uC774\uAC70\uB098 \uC885\uB8CC\uB41C \uC138\uC158\uC785\uB2C8\uB2E4.");
  }
  if (session.currentParticipants >= (session.maxParticipants ?? 10)) {
    throw new Error("\uC138\uC158 \uC815\uC6D0\uC774 \uAC00\uB4DD \uCC3C\uC2B5\uB2C8\uB2E4.");
  }
  const existing = await ensureParticipant(env2, sessionId, userId);
  if (existing && existing.status === PARTICIPANT_STATUS.JOINED) {
    return session;
  }
  const now = nowIso3();
  if (existing) {
    await execute(
      env2.DB,
      `UPDATE group_session_participants
         SET status = ?, joined_at = ?, left_at = NULL, updated_at = ?
       WHERE session_id = ? AND user_id = ?`,
      [PARTICIPANT_STATUS.JOINED, now, now, sessionId, userId]
    );
  } else {
    await execute(
      env2.DB,
      `INSERT INTO group_session_participants (
          participant_id, session_id, user_id, status, joined_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), sessionId, userId, PARTICIPANT_STATUS.JOINED, now, now, now]
    );
  }
  await execute(
    env2.DB,
    `UPDATE group_sessions
        SET current_participants = current_participants + 1,
            updated_at = ?
      WHERE session_id = ?`,
    [now, sessionId]
  );
  await invalidateGroupSessionCache(env2, sessionId);
  await addActiveSession(env2, userId, sessionId);
  await addRecentSession(env2, userId, sessionId);
  return getGroupSessionById(env2, sessionId, userId);
}
__name(joinGroupSession, "joinGroupSession");
async function joinGroupSessionByCode(env2, userId, joinCode, payload = {}) {
  const row = await queryFirst(
    env2.DB,
    "SELECT session_id FROM group_sessions WHERE join_code = ? LIMIT 1",
    [joinCode]
  );
  if (!row) throw new Error("\uCC38\uAC00 \uCF54\uB4DC\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  return joinGroupSession(env2, userId, row.session_id, payload);
}
__name(joinGroupSessionByCode, "joinGroupSessionByCode");
async function leaveGroupSession(env2, userId, sessionId) {
  const participant = await ensureParticipant(env2, sessionId, userId);
  if (!participant || participant.status !== PARTICIPANT_STATUS.JOINED) {
    return;
  }
  const now = nowIso3();
  await execute(
    env2.DB,
    `UPDATE group_session_participants
        SET status = ?, left_at = ?, updated_at = ?
      WHERE session_id = ? AND user_id = ?`,
    [PARTICIPANT_STATUS.LEFT, now, now, sessionId, userId]
  );
  await execute(
    env2.DB,
    `UPDATE group_sessions
        SET current_participants = CASE WHEN current_participants > 0 THEN current_participants - 1 ELSE 0 END,
            updated_at = ?
      WHERE session_id = ?`,
    [now, sessionId]
  );
  await invalidateGroupSessionCache(env2, sessionId);
  await removeActiveSession(env2, userId, sessionId);
}
__name(leaveGroupSession, "leaveGroupSession");
async function startGroupSession(env2, userId, sessionId) {
  const session = await getGroupSessionById(env2, sessionId);
  if (session.hostUserId !== userId) throw new Error("\uC138\uC158\uC744 \uC2DC\uC791\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
  const now = nowIso3();
  await execute(
    env2.DB,
    "UPDATE group_sessions SET status = ?, started_at = ?, updated_at = ? WHERE session_id = ?",
    [GROUP_STATUS.ACTIVE, now, now, sessionId]
  );
  await invalidateGroupSessionCache(env2, sessionId);
  return getGroupSessionById(env2, sessionId, userId);
}
__name(startGroupSession, "startGroupSession");
async function endGroupSession(env2, userId, sessionId) {
  const session = await getGroupSessionById(env2, sessionId);
  if (session.hostUserId !== userId) throw new Error("\uC138\uC158\uC744 \uC885\uB8CC\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
  const now = nowIso3();
  await execute(
    env2.DB,
    "UPDATE group_sessions SET status = ?, ended_at = ?, updated_at = ? WHERE session_id = ?",
    [GROUP_STATUS.COMPLETED, now, now, sessionId]
  );
  await invalidateGroupSessionCache(env2, sessionId);
  return getGroupSessionById(env2, sessionId, userId);
}
__name(endGroupSession, "endGroupSession");
async function cancelGroupSession(env2, userId, sessionId, reason) {
  const session = await getGroupSessionById(env2, sessionId);
  if (session.hostUserId !== userId) throw new Error("\uC138\uC158\uC744 \uCDE8\uC18C\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
  const now = nowIso3();
  await execute(
    env2.DB,
    `UPDATE group_sessions
        SET status = ?, ended_at = ?, updated_at = ?
      WHERE session_id = ?`,
    [GROUP_STATUS.CANCELLED, now, now, sessionId]
  );
  await execute(
    env2.DB,
    `UPDATE group_session_participants
        SET status = ?, updated_at = ?
      WHERE session_id = ? AND status = ?`,
    [PARTICIPANT_STATUS.LEFT, now, sessionId, PARTICIPANT_STATUS.JOINED]
  );
  await invalidateGroupSessionCache(env2, sessionId);
}
__name(cancelGroupSession, "cancelGroupSession");
async function listAvailableGroupSessions(env2, page, size, filters = {}, currentUserId) {
  const offset = (page - 1) * size;
  const where = ["status = ?", "is_public = 1"];
  const params = [GROUP_STATUS.SCHEDULED];
  if (filters.language) {
    where.push("UPPER(target_language) = UPPER(?)");
    params.push(filters.language);
  }
  if (filters.level) {
    where.push("UPPER(language_level) = UPPER(?)");
    params.push(filters.level);
  }
  if (filters.category) {
    where.push("UPPER(topic_category) = UPPER(?)");
    params.push(filters.category);
  }
  if (filters.tags && filters.tags.length > 0) {
    where.push(filters.tags.map(() => "session_tags LIKE '%' || ? || '%' ").join(" AND "));
    params.push(...filters.tags);
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const totalRow = await queryFirst(
    env2.DB,
    `SELECT COUNT(*) as count FROM group_sessions ${whereClause}`,
    params
  );
  const rows = await query(
    env2.DB,
    `SELECT gs.*, host.name AS host_user_name, host.profile_image AS host_profile_image
       FROM group_sessions gs
       LEFT JOIN users host ON host.user_id = gs.host_user_id
      ${whereClause}
      ORDER BY gs.scheduled_at ASC
      LIMIT ? OFFSET ?`,
    [...params, size, offset]
  );
  const data = rows.map((row) => mapGroupList(row, currentUserId));
  return {
    data,
    page,
    size,
    total: totalRow?.count ?? 0
  };
}
__name(listAvailableGroupSessions, "listAvailableGroupSessions");
async function listUserGroupSessions(env2, userId, status) {
  const rows = await query(
    env2.DB,
    `SELECT gs.*, host.name AS host_user_name, host.profile_image AS host_profile_image
       FROM group_session_participants gsp
       JOIN group_sessions gs ON gs.session_id = gsp.session_id
       LEFT JOIN users host ON host.user_id = gs.host_user_id
      WHERE gsp.user_id = ? ${status ? "AND gs.status = ?" : ""}
      ORDER BY gs.scheduled_at DESC`,
    status ? [userId, status] : [userId]
  );
  const result = [];
  for (const row of rows) {
    const participants = await fetchParticipants(env2, row.session_id);
    result.push(mapGroupSession(row, participants, userId));
  }
  return result;
}
__name(listUserGroupSessions, "listUserGroupSessions");
async function listHostedGroupSessions(env2, userId) {
  const rows = await query(
    env2.DB,
    `SELECT gs.*, host.name AS host_user_name, host.profile_image AS host_profile_image
       FROM group_sessions gs
       LEFT JOIN users host ON host.user_id = gs.host_user_id
      WHERE gs.host_user_id = ?
      ORDER BY gs.scheduled_at DESC`,
    [userId]
  );
  const result = [];
  for (const row of rows) {
    const participants = await fetchParticipants(env2, row.session_id);
    result.push(mapGroupSession(row, participants, userId));
  }
  return result;
}
__name(listHostedGroupSessions, "listHostedGroupSessions");
async function kickGroupParticipant(env2, hostUserId, sessionId, participantId) {
  const session = await getGroupSessionById(env2, sessionId, hostUserId);
  if (session.hostUserId !== hostUserId) throw new Error("\uCC38\uAC00\uC790\uB97C \uCD94\uBC29\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
  const participant = await ensureParticipant(env2, sessionId, participantId);
  if (!participant) throw new Error("\uCC38\uAC00\uC790\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  const now = nowIso3();
  await execute(
    env2.DB,
    `UPDATE group_session_participants
        SET status = ?, left_at = ?, updated_at = ?
      WHERE session_id = ? AND user_id = ?`,
    [PARTICIPANT_STATUS.KICKED, now, now, sessionId, participantId]
  );
  await execute(
    env2.DB,
    `UPDATE group_sessions
        SET current_participants = CASE WHEN current_participants > 0 THEN current_participants - 1 ELSE 0 END,
            updated_at = ?
      WHERE session_id = ?`,
    [now, sessionId]
  );
  await invalidateGroupSessionCache(env2, sessionId);
  await removeActiveSession(env2, participantId, sessionId);
}
__name(kickGroupParticipant, "kickGroupParticipant");
async function rateGroupSession(env2, userId, sessionId, rating, feedback) {
  const participant = await ensureParticipant(env2, sessionId, userId);
  if (!participant || participant.status !== PARTICIPANT_STATUS.JOINED) {
    throw new Error("\uC138\uC158\uC5D0 \uCC38\uAC00\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.");
  }
  const now = nowIso3();
  await execute(
    env2.DB,
    `UPDATE group_session_participants
        SET rating = ?, feedback = ?, updated_at = ?
      WHERE session_id = ? AND user_id = ?`,
    [rating, feedback ?? null, now, sessionId, userId]
  );
  await execute(
    env2.DB,
    `UPDATE group_sessions
        SET rating_average = (
          SELECT AVG(rating) FROM group_session_participants
            WHERE session_id = ? AND rating IS NOT NULL
        ),
            rating_count = (
          SELECT COUNT(*) FROM group_session_participants
            WHERE session_id = ? AND rating IS NOT NULL
        ),
            updated_at = ?
      WHERE session_id = ?`,
    [sessionId, sessionId, now, sessionId]
  );
  await invalidateGroupSessionCache(env2, sessionId);
}
__name(rateGroupSession, "rateGroupSession");
async function updateGroupSession(env2, hostUserId, sessionId, payload) {
  const session = await getGroupSessionById(env2, sessionId);
  if (session.hostUserId !== hostUserId) throw new Error("\uC138\uC158\uC744 \uC218\uC815\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
  const now = nowIso3();
  await execute(
    env2.DB,
    `UPDATE group_sessions
        SET title = ?,
            description = ?,
            topic_category = ?,
            target_language = ?,
            language_level = ?,
            max_participants = ?,
            scheduled_at = ?,
            session_duration = ?,
            session_tags = ?,
            is_public = ?,
            updated_at = ?
      WHERE session_id = ?`,
    [
      payload.title,
      payload.description ?? null,
      payload.topicCategory,
      payload.targetLanguage,
      payload.languageLevel,
      payload.maxParticipants,
      payload.scheduledAt,
      payload.sessionDuration,
      payload.sessionTags ? payload.sessionTags.join(",") : null,
      payload.isPublic ? 1 : 0,
      now,
      sessionId
    ]
  );
  await invalidateGroupSessionCache(env2, sessionId);
}
__name(updateGroupSession, "updateGroupSession");
async function inviteToGroupSession(env2, hostUserId, sessionId, invitedUserIds) {
  const session = await getGroupSessionById(env2, sessionId);
  if (session.hostUserId !== hostUserId) throw new Error("\uC138\uC158\uC744 \uCD08\uB300\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
  const now = nowIso3();
  for (const userId of invitedUserIds) {
    await execute(
      env2.DB,
      `INSERT INTO group_session_participants (
          participant_id, session_id, user_id, status, joined_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, NULL, ?, ?)
        ON CONFLICT(session_id, user_id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at`,
      [crypto.randomUUID(), sessionId, userId, PARTICIPANT_STATUS.INVITED, now, now]
    );
    await saveInvitation(env2, sessionId, userId, hostUserId);
  }
  await invalidateGroupSessionCache(env2, sessionId);
  return getGroupSessionById(env2, sessionId, hostUserId);
}
__name(inviteToGroupSession, "inviteToGroupSession");
async function respondToInvitation(env2, userId, sessionId, accept) {
  const invitation = await getInvitation(env2, sessionId, userId);
  if (!invitation) throw new Error("\uCD08\uB300 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
  const participant = await ensureParticipant(env2, sessionId, userId);
  if (!participant) throw new Error("\uCD08\uB300 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
  const now = nowIso3();
  if (accept) {
    await execute(
      env2.DB,
      `UPDATE group_session_participants
          SET status = ?, joined_at = COALESCE(joined_at, ?), updated_at = ?
        WHERE session_id = ? AND user_id = ?`,
      [PARTICIPANT_STATUS.JOINED, now, now, sessionId, userId]
    );
    await execute(
      env2.DB,
      `UPDATE group_sessions
          SET current_participants = current_participants + 1,
              updated_at = ?
        WHERE session_id = ?`,
      [now, sessionId]
    );
    await addActiveSession(env2, userId, sessionId);
  } else {
    await execute(
      env2.DB,
      `UPDATE group_session_participants
          SET status = ?, updated_at = ?, left_at = COALESCE(left_at, ?)
        WHERE session_id = ? AND user_id = ?`,
      [PARTICIPANT_STATUS.BANNED, now, now, sessionId, userId]
    );
  }
  await invalidateGroupSessionCache(env2, sessionId);
  await deleteInvitation(env2, sessionId, userId);
}
__name(respondToInvitation, "respondToInvitation");
async function getRecommendedGroupSessions(env2, userId) {
  const rows = await query(
    env2.DB,
    `SELECT gs.*, host.name AS host_user_name, host.profile_image AS host_profile_image
       FROM group_sessions gs
       LEFT JOIN users host ON host.user_id = gs.host_user_id
      WHERE gs.is_public = 1 AND gs.status = ?
      ORDER BY gs.scheduled_at ASC
      LIMIT 5`,
    [GROUP_STATUS.SCHEDULED]
  );
  const items = [];
  for (const row of rows) {
    const participants = await fetchParticipants(env2, row.session_id);
    items.push(mapGroupSession(row, participants, userId));
  }
  return items;
}
__name(getRecommendedGroupSessions, "getRecommendedGroupSessions");
async function searchGroupSessions(env2, keyword, language, level) {
  const where = ["is_public = 1"];
  const params = [];
  if (keyword) {
    where.push("(title LIKE ? OR description LIKE ? OR topic_category LIKE ?)");
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }
  if (language) {
    where.push("target_language = ?");
    params.push(language);
  }
  if (level) {
    where.push("language_level = ?");
    params.push(level);
  }
  const rows = await query(
    env2.DB,
    `SELECT gs.*, host.name AS host_user_name, host.profile_image AS host_profile_image
       FROM group_sessions gs
       LEFT JOIN users host ON host.user_id = gs.host_user_id
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY gs.scheduled_at ASC
      LIMIT 50`,
    params
  );
  return rows.map((row) => mapGroupList(row));
}
__name(searchGroupSessions, "searchGroupSessions");

// src/services/groupSessionsAI.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var PROGRESS_TTL_SECONDS = 60 * 60 * 24 * 90;
var PROGRESS_HISTORY_LIMIT = 50;
function parseJsonWithFallback(text, fallback) {
  try {
    return JSON.parse(text);
  } catch (error3) {
    log3.warn("Failed to parse AI JSON response", error3, {
      component: "GROUP_SESSION_AI",
      preview: text.slice(0, 240)
    });
    return fallback;
  }
}
__name(parseJsonWithFallback, "parseJsonWithFallback");
async function callStructuredChat(env2, systemPrompt, userPrompt, fallback, options = {}) {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];
  const response = await generateChatCompletion(env2.AI, messages, {
    temperature: options.temperature ?? 0.6,
    max_tokens: options.maxTokens ?? 900,
    response_format: { type: "json_object" }
  });
  const sanitized = sanitizeJsonResponse(response.text);
  if (!sanitized) {
    return fallback;
  }
  return parseJsonWithFallback(sanitized, fallback);
}
__name(callStructuredChat, "callStructuredChat");
async function recommendSessionTopics(env2, userId, input) {
  const fallback = {
    topics: [
      {
        title: "Daily Highlights",
        description: "Share the most interesting part of your day and ask follow-up questions to others.",
        difficulty: input.level || "INTERMEDIATE",
        culturalTips: [],
        followUpQuestions: [
          "What made that moment special?",
          "Would you do anything differently next time?"
        ]
      }
    ]
  };
  const interestsText = (input.interests || []).join(", ") || "general interests";
  const userPrompt = `Recommend three engaging conversation topics for a small group session.

Context:
- Participants' primary learning language: ${input.language || "English"}
- Average proficiency level: ${input.level || "Intermediate"}
- Shared interests or focus areas: ${interestsText || "general conversation"}
- Group size: ${input.participantCount || 4}

Return JSON in the format:
{
  "topics": [
    {
      "title": string,
      "description": string,
      "difficulty": "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
      "estimatedDurationMinutes": number,
      "culturalTips": string[],
      "followUpQuestions": string[]
    }
  ]
}`;
  return callStructuredChat(
    env2,
    "You are an expert language tutor who designs conversation prompts that encourage balanced participation and vocabulary growth.",
    userPrompt,
    fallback,
    { temperature: 0.7, maxTokens: 800 }
  );
}
__name(recommendSessionTopics, "recommendSessionTopics");
async function analyzeConversationTranscript(env2, userId, input) {
  const fallback = {
    overallScore: 70,
    strengths: ["Clear structure"],
    improvements: ["Use more varied vocabulary"],
    suggestedTopics: ["Cultural experiences"],
    keyPhrases: [],
    summary: "Participants engaged in a structured conversation.",
    sentiment: "neutral"
  };
  const userPrompt = `Analyze this group session transcript for language learning insights.
Provide:
- overallScore (0-100)
- strengths (array of strings)
- improvements (array of strings)
- suggestedTopics (array)
- keyPhrases (array of strings)
- summary (string)
- sentiment (positive/neutral/negative)

Transcript:
${input.transcript}
`;
  return callStructuredChat(
    env2,
    "You are an experienced ESL coach. Focus on constructive, encouraging feedback.",
    userPrompt,
    fallback,
    { temperature: 0.4, maxTokens: 800 }
  );
}
__name(analyzeConversationTranscript, "analyzeConversationTranscript");
async function generateSessionSummary(env2, userId, input) {
  const participantsLine = (input.participants || []).map((p) => `${p.name || p.id || "Participant"}${p.role ? ` (${p.role})` : ""}`).join(", ");
  const fallback = {
    summary: "Participants discussed the main topic and shared personal experiences.",
    highlights: ["Active participation from all members"],
    actionItems: ["Prepare vocabulary list for next session"],
    followUpQuestions: ["What vocabulary felt challenging?"],
    vocabulary: []
  };
  const userPrompt = `Summarize the group session for language learners.
Include summary, 2-3 highlights, actionItems, followUpQuestions, and vocabulary array with phrase/meaning.

Language: ${input.language || "English"}
Duration (minutes): ${input.duration ?? "unknown"}
Participants: ${participantsLine || "Not specified"}
Transcript:
${input.transcript}
`;
  return callStructuredChat(
    env2,
    "You are a language coach who produces concise post-session reports for learners.",
    userPrompt,
    fallback,
    { temperature: 0.5, maxTokens: 900 }
  );
}
__name(generateSessionSummary, "generateSessionSummary");
async function generateIcebreakers(env2, userId, input) {
  const fallback = {
    icebreakers: [
      "Share one surprising fact about your hometown and ask others to react to it."
    ]
  };
  const userPrompt = `Provide five creative icebreaker prompts for a group session.
Language: ${input.language || "English"}
Learner level: ${input.level || "Intermediate"}
Topic focus: ${input.topic || "General conversation"}
Return JSON: { "icebreakers": string[] }
`;
  return callStructuredChat(
    env2,
    "You are a facilitator who creates inclusive, culturally sensitive warm-up questions.",
    userPrompt,
    fallback,
    { temperature: 0.8, maxTokens: 500 }
  );
}
__name(generateIcebreakers, "generateIcebreakers");
async function generateRoleplayScenario(env2, userId, input) {
  const fallback = {
    scenarioTitle: "Business Meeting Kick-off",
    setting: "Virtual conference call with international teammates",
    roles: ["Project lead", "Marketing specialist", "Engineer"],
    goals: ["Align on project scope", "Assign next steps"],
    scriptOutline: [
      "Introduction and greetings",
      "Discuss project objectives",
      "Clarify deliverables"
    ],
    vocabulary: []
  };
  const rolesText = (input.participantRoles || []).join(", ") || "Flexible roles for 3-4 participants";
  const userPrompt = `Create a roleplay scenario for language learners.
Include scenarioTitle, setting, roles, goals, scriptOutline (array of steps), vocabulary (array of { phrase, meaning }).

Language: ${input.language || "English"}
Level: ${input.level || "Intermediate"}
Situation: ${input.situation || "Business discussion"}
Participant roles: ${rolesText}
`;
  return callStructuredChat(
    env2,
    "You design practical roleplay activities that build speaking confidence.",
    userPrompt,
    fallback,
    { temperature: 0.75, maxTokens: 850 }
  );
}
__name(generateRoleplayScenario, "generateRoleplayScenario");
async function translateExpression(env2, userId, input) {
  const fallback = {
    translation: input.text,
    pronunciation: null,
    usageNotes: [],
    examples: []
  };
  const userPrompt = `Translate the following text for language learners.
Return JSON with fields: translation (string), pronunciation (string|null), usageNotes (string[]),
examples (array of { original, translated }).

Source language: ${input.fromLanguage || "auto"}
Target language: ${input.toLanguage}
Text:
${input.text}
`;
  return callStructuredChat(
    env2,
    "You are a bilingual language coach who provides nuanced translations with context.",
    userPrompt,
    fallback,
    { temperature: 0.4, maxTokens: 700 }
  );
}
__name(translateExpression, "translateExpression");
async function recommendSessionMatches(env2, userId, input) {
  const fallback = {
    matches: [],
    strategy: "Recommend sessions by topic relevance and speaking level proximity."
  };
  const profileSummary = JSON.stringify(input.userProfile ?? {});
  const sessionsInfo = JSON.stringify(input.availableSessions ?? []);
  const userPrompt = `Recommend up to five group sessions for the learner.
Return JSON with fields:
{
  "matches": [
    {
      "sessionId": string | null,
      "title": string,
      "fitScore": number (0-100),
      "reason": string
    }
  ],
  "strategy": string
}

Learner profile:
${profileSummary}

Available sessions:
${sessionsInfo}
`;
  return callStructuredChat(
    env2,
    "You are an AI assistant matching language learners to the most suitable group discussions.",
    userPrompt,
    fallback,
    { temperature: 0.6, maxTokens: 900 }
  );
}
__name(recommendSessionMatches, "recommendSessionMatches");
function progressKey(userId) {
  return `group-session:progress:${userId}`;
}
__name(progressKey, "progressKey");
async function saveLearningProgress(env2, record) {
  const existingRaw = await env2.CACHE.get(progressKey(record.userId));
  let history = [];
  if (existingRaw) {
    try {
      history = JSON.parse(existingRaw);
    } catch (error3) {
      log3.warn("Failed to parse existing learning progress history", error3, {
        component: "GROUP_SESSION_AI"
      });
      history = [];
    }
  }
  const entry = {
    ...record,
    savedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  history.unshift(entry);
  if (history.length > PROGRESS_HISTORY_LIMIT) {
    history = history.slice(0, PROGRESS_HISTORY_LIMIT);
  }
  await env2.CACHE.put(progressKey(record.userId), JSON.stringify(history), {
    expirationTtl: PROGRESS_TTL_SECONDS
  });
  return entry;
}
__name(saveLearningProgress, "saveLearningProgress");

// src/routes/groupSessions.ts
var groupSessionsRoutes = new Hono2();
var requireAuth5 = auth();
function getPaginationParams2(c) {
  const page = Math.max(Number(c.req.query("page") ?? "1"), 1);
  const size = Math.max(Math.min(Number(c.req.query("size") ?? "20"), 50), 1);
  return { page, size };
}
__name(getPaginationParams2, "getPaginationParams");
function requirePathParam(value, field) {
  if (!value) {
    throw new AppError(`Invalid ${field}`, 400, "INVALID_PATH_PARAM");
  }
  return value;
}
__name(requirePathParam, "requirePathParam");
function requireUserId(c) {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  }
  return userId;
}
__name(requireUserId, "requireUserId");
groupSessionsRoutes.use("*", requireAuth5);
groupSessionsRoutes.post("/", async (c) => {
  const hostUserId = c.get("userId");
  if (!hostUserId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  const required = ["title", "topicCategory", "targetLanguage", "languageLevel", "maxParticipants", "scheduledAt", "sessionDuration", "isPublic"];
  const missing = required.filter((key) => body[key] === void 0 || body[key] === null || body[key] === "");
  if (missing.length) {
    throw new AppError(`Missing fields: ${missing.join(", ")}`, 400, "INVALID_PAYLOAD");
  }
  const session = await createGroupSession(c.env, hostUserId, body);
  return successResponse(c, session);
});
groupSessionsRoutes.get("/:sessionId", async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param("sessionId"), "sessionId");
  const session = await getGroupSessionById(c.env, sessionId, userId);
  return successResponse(c, session);
});
groupSessionsRoutes.post("/:sessionId/join", async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param("sessionId"), "sessionId");
  const body = await c.req.json().catch(() => ({}));
  const session = await joinGroupSession(c.env, userId, sessionId, body);
  return successResponse(c, session);
});
groupSessionsRoutes.post("/join/:joinCode", async (c) => {
  const userId = requireUserId(c);
  const joinCode = requirePathParam(c.req.param("joinCode"), "joinCode");
  const body = await c.req.json().catch(() => ({}));
  const session = await joinGroupSessionByCode(c.env, userId, joinCode, body);
  return successResponse(c, session);
});
groupSessionsRoutes.post("/:sessionId/leave", async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param("sessionId"), "sessionId");
  await leaveGroupSession(c.env, userId, sessionId);
  return successResponse(c, { success: true });
});
groupSessionsRoutes.post("/:sessionId/start", async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param("sessionId"), "sessionId");
  const session = await startGroupSession(c.env, userId, sessionId);
  return successResponse(c, session);
});
groupSessionsRoutes.post("/:sessionId/end", async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param("sessionId"), "sessionId");
  const session = await endGroupSession(c.env, userId, sessionId);
  return successResponse(c, session);
});
groupSessionsRoutes.post("/:sessionId/cancel", async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param("sessionId"), "sessionId");
  const reason = c.req.query("reason") ?? void 0;
  await cancelGroupSession(c.env, userId, sessionId, reason);
  return successResponse(c, { success: true });
});
groupSessionsRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const { page, size } = getPaginationParams2(c);
  const filters = {
    language: c.req.query("language"),
    level: c.req.query("level"),
    category: c.req.query("category"),
    tags: c.req.query("tags") ? c.req.query("tags").split(",").map((t) => t.trim()).filter(Boolean) : void 0
  };
  const result = await listAvailableGroupSessions(c.env, page, size, filters, userId ?? void 0);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});
groupSessionsRoutes.get("/available", async (c) => {
  const userId = c.get("userId");
  const { page, size } = getPaginationParams2(c);
  const filters = {
    language: c.req.query("language"),
    level: c.req.query("level"),
    category: c.req.query("category"),
    tags: c.req.query("tags") ? c.req.query("tags").split(",").map((t) => t.trim()).filter(Boolean) : void 0
  };
  const result = await listAvailableGroupSessions(c.env, page, size, filters, userId ?? void 0);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});
groupSessionsRoutes.get("/my", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const status = c.req.query("status") ?? void 0;
  const sessions = await listUserGroupSessions(c.env, userId, status ?? void 0);
  return successResponse(c, sessions);
});
groupSessionsRoutes.get("/my-sessions", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const status = c.req.query("status") ?? void 0;
  const sessions = await listUserGroupSessions(c.env, userId, status ?? void 0);
  return successResponse(c, sessions);
});
groupSessionsRoutes.get("/hosted", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const sessions = await listHostedGroupSessions(c.env, userId);
  return successResponse(c, sessions);
});
groupSessionsRoutes.post("/:sessionId/kick/:participantId", async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param("sessionId"), "sessionId");
  const participantId = requirePathParam(c.req.param("participantId"), "participantId");
  await kickGroupParticipant(c.env, userId, sessionId, participantId);
  return successResponse(c, { success: true });
});
groupSessionsRoutes.post("/:sessionId/rate", async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param("sessionId"), "sessionId");
  const rating = Number(c.req.query("rating") ?? c.req.query("score") ?? 0);
  if (!rating || rating < 1 || rating > 5) {
    throw new AppError("rating must be between 1 and 5", 400, "INVALID_QUERY_PARAM");
  }
  const feedback = c.req.query("feedback") ?? void 0;
  await rateGroupSession(c.env, userId, sessionId, rating, feedback);
  return successResponse(c, { success: true });
});
groupSessionsRoutes.put("/:sessionId", async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param("sessionId"), "sessionId");
  const body = await c.req.json();
  await updateGroupSession(c.env, userId, sessionId, body);
  return successResponse(c, { success: true });
});
groupSessionsRoutes.get("/recommended/list", async (c) => {
  const userId = requireUserId(c);
  const sessions = await getRecommendedGroupSessions(c.env, userId);
  return successResponse(c, sessions);
});
groupSessionsRoutes.post("/progress/track", async (c) => {
  const userId = requireUserId(c);
  const body = await c.req.json().catch(() => ({}));
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : void 0;
  const metrics = typeof body.metrics === "object" && body.metrics !== null ? body.metrics : void 0;
  const notes = typeof body.notes === "string" ? body.notes : void 0;
  const completedAt = typeof body.completedAt === "string" ? body.completedAt : void 0;
  let durationMinutes;
  if (typeof body.durationMinutes === "number" && Number.isFinite(body.durationMinutes)) {
    durationMinutes = body.durationMinutes;
  } else if (typeof body.duration === "number" && Number.isFinite(body.duration)) {
    durationMinutes = body.duration;
  }
  const record = await saveLearningProgress(c.env, {
    userId,
    sessionId,
    metrics,
    notes,
    completedAt,
    durationMinutes
  });
  return successResponse(c, { saved: true, progress: record });
});
groupSessionsRoutes.post("/:sessionId/invite", async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param("sessionId"), "sessionId");
  const body = await c.req.json();
  if (!Array.isArray(body)) {
    throw new AppError("Expected an array of userIds", 400, "INVALID_PAYLOAD");
  }
  const session = await inviteToGroupSession(c.env, userId, sessionId, body);
  return successResponse(c, session);
});
groupSessionsRoutes.post("/:sessionId/invitation/respond", async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param("sessionId"), "sessionId");
  const accept = c.req.query("accept");
  const accepted = accept ? accept.toLowerCase() === "true" : true;
  await respondToInvitation(c.env, userId, sessionId, accepted);
  return successResponse(c, { success: true, accepted });
});
groupSessionsRoutes.get("/search", async (c) => {
  const keyword = c.req.query("keyword") ?? "";
  const language = c.req.query("language") ?? void 0;
  const level = c.req.query("level") ?? void 0;
  const sessions = await searchGroupSessions(c.env, keyword, language, level);
  return successResponse(c, sessions);
});
var groupSessions_default = groupSessionsRoutes;

// src/routes/groupSessionsAI.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_errors();
var aiRoutes = new Hono2();
var requireAuth6 = auth();
aiRoutes.use("*", requireAuth6);
var recommendSchema = z.object({
  language: z.string().min(1).default("English"),
  level: z.string().min(1).optional(),
  interests: z.array(z.string().min(1)).optional(),
  participantCount: z.number().int().positive().optional()
});
aiRoutes.post("/recommend-topics", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  }
  const payload = await c.req.json().catch(() => ({}));
  const input = recommendSchema.parse(payload);
  const result = await recommendSessionTopics(c.env, userId, input);
  return successResponse(c, result);
});
var analysisSchema = z.object({
  transcript: z.string().min(5),
  language: z.string().min(1).optional(),
  participantId: z.string().min(1).optional()
});
aiRoutes.post("/analyze-conversation", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  }
  const payload = await c.req.json().catch(() => ({}));
  const input = analysisSchema.parse(payload);
  const result = await analyzeConversationTranscript(c.env, userId, input);
  return successResponse(c, result);
});
var summarySchema = z.object({
  sessionId: z.string().optional(),
  transcript: z.string().min(5),
  duration: z.number().int().positive().optional(),
  language: z.string().min(1).optional(),
  participants: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().optional(),
      role: z.string().optional()
    })
  ).optional()
});
aiRoutes.post("/generate-summary", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  }
  const payload = await c.req.json().catch(() => ({}));
  const input = summarySchema.parse(payload);
  const result = await generateSessionSummary(c.env, userId, input);
  return successResponse(c, result);
});
var icebreakerSchema = z.object({
  language: z.string().optional(),
  level: z.string().optional(),
  topic: z.string().optional()
});
aiRoutes.post("/icebreakers", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  }
  const payload = await c.req.json().catch(() => ({}));
  const input = icebreakerSchema.parse(payload);
  const result = await generateIcebreakers(c.env, userId, input);
  return successResponse(c, result);
});
var roleplaySchema = z.object({
  language: z.string().optional(),
  level: z.string().optional(),
  situation: z.string().optional(),
  participantRoles: z.array(z.string()).optional()
});
aiRoutes.post("/roleplay", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  }
  const payload = await c.req.json().catch(() => ({}));
  const input = roleplaySchema.parse(payload);
  const result = await generateRoleplayScenario(c.env, userId, input);
  return successResponse(c, result);
});
var translateSchema = z.object({
  text: z.string().min(1),
  fromLanguage: z.string().optional(),
  toLanguage: z.string().min(1)
});
aiRoutes.post("/translate", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  }
  const payload = await c.req.json().catch(() => ({}));
  const input = translateSchema.parse(payload);
  const result = await translateExpression(c.env, userId, input);
  return successResponse(c, result);
});
var matchSchema = z.object({
  userId: z.string().min(1),
  userProfile: z.record(z.unknown()).optional(),
  availableSessions: z.array(z.record(z.unknown())).optional()
});
aiRoutes.post("/match-recommendation", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  }
  const payload = await c.req.json().catch(() => ({}));
  const input = matchSchema.parse(payload);
  const result = await recommendSessionMatches(c.env, userId, input);
  return successResponse(c, result);
});
var groupSessionsAI_default = aiRoutes;

// src/routes/presence.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_errors();
var presenceRoutes = new Hono2();
var requireAuth7 = auth();
async function fetchPresence(env2, userId, path, init) {
  const id = env2.USER_PRESENCE.idFromString(userId);
  const stub = env2.USER_PRESENCE.get(id);
  const url = `https://user-presence/${path}`;
  return stub.fetch(new Request(url, init));
}
__name(fetchPresence, "fetchPresence");
presenceRoutes.use("/internal/*", internalAuth());
presenceRoutes.post("/internal/presence/set", async (c) => {
  const body = await c.req.json();
  const userId = body.userId;
  if (!userId) throw new AppError("userId is required", 400, "INVALID_PAYLOAD");
  const response = await fetchPresence(c.env, userId, "set", {
    method: "POST",
    body: JSON.stringify({
      ...body,
      userId,
      lastSeenAt: (/* @__PURE__ */ new Date()).toISOString()
    }),
    headers: { "Content-Type": "application/json" }
  });
  const data = await response.json().catch(() => ({}));
  return c.json(data, response.status);
});
presenceRoutes.post("/internal/presence/touch", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const userId = body.userId;
  if (!userId) throw new AppError("userId is required", 400, "INVALID_PAYLOAD");
  const response = await fetchPresence(c.env, userId, "touch", { method: "POST" });
  const data = await response.json().catch(() => ({}));
  return c.json(data, response.status);
});
presenceRoutes.post("/internal/presence/offline", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const userId = body.userId;
  if (!userId) throw new AppError("userId is required", 400, "INVALID_PAYLOAD");
  const response = await fetchPresence(c.env, userId, "offline", { method: "POST" });
  const data = await response.json().catch(() => ({}));
  return c.json(data, response.status);
});
presenceRoutes.get("/internal/presence/status/:userId", async (c) => {
  const userId = c.req.param("userId");
  if (!userId) throw new AppError("userId is required", 400, "INVALID_PATH_PARAM");
  const response = await fetchPresence(c.env, userId, "status");
  const data = await response.json().catch(() => ({}));
  return c.json(data, response.status);
});
presenceRoutes.use("/*", requireAuth7);
presenceRoutes.post("/presence/status", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  const payload = {
    ...body,
    userId,
    status: body.status ?? "ONLINE"
  };
  const response = await fetchPresence(c.env, userId, "set", {
    method: "POST",
    body: JSON.stringify({ ...payload, lastSeenAt: (/* @__PURE__ */ new Date()).toISOString() }),
    headers: { "Content-Type": "application/json" }
  });
  const data = await response.json().catch(() => ({}));
  return c.json(data, response.status);
});
presenceRoutes.post("/presence/touch", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const response = await fetchPresence(c.env, userId, "touch", { method: "POST" });
  const data = await response.json().catch(() => ({}));
  return c.json(data, response.status);
});
presenceRoutes.post("/presence/offline", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const response = await fetchPresence(c.env, userId, "offline", { method: "POST" });
  const data = await response.json().catch(() => ({}));
  return c.json(data, response.status);
});
presenceRoutes.get("/presence/status", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User context missing", 500, "CONTEXT_MISSING_USER");
  const response = await fetchPresence(c.env, userId, "status");
  const data = await response.json().catch(() => ({}));
  return c.json(data, response.status);
});
var presence_default = presenceRoutes;

// src/routes/matching.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_errors();

// src/services/matching.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
init_errors();
var MATCHING_DEFAULT_EXPIRE_DAYS = 7;
var MATCHING_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED"
};
async function recommendPartners(env2, userId, options) {
  const whereClauses = ["u.user_id != ?", "IFNULL(u.user_disable, 0) = 0"];
  const params = [userId];
  if (options.nativeLanguage) {
    whereClauses.push("EXISTS (SELECT 1 FROM languages nl WHERE nl.language_id = u.native_lang_id AND (nl.language_code = ? OR nl.language_name = ?))");
    params.push(options.nativeLanguage, options.nativeLanguage);
  }
  if (options.targetLanguage) {
    whereClauses.push(
      `EXISTS (
        SELECT 1 FROM onboarding_lang_level oll
        JOIN languages tl ON tl.language_id = oll.language_id
        WHERE oll.user_id = u.user_id AND (tl.language_code = ? OR tl.language_name = ?)
      )`
    );
    params.push(options.targetLanguage, options.targetLanguage);
  }
  if (options.languageLevel) {
    whereClauses.push(
      `EXISTS (
        SELECT 1 FROM onboarding_lang_level oll
        JOIN lang_level_type lt ON lt.lang_level_id = oll.target_level_id
        WHERE oll.user_id = u.user_id AND (lt.lang_level_name = ? OR lt.category = ?)
      )`
    );
    params.push(options.languageLevel, options.languageLevel);
  }
  const where = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const totalRow = await queryFirst(
    env2.DB,
    `SELECT COUNT(*) as count FROM users u ${where}`,
    params
  );
  const total = totalRow?.count ?? 0;
  const offset = (options.page - 1) * options.size;
  const selectParams = [...params, options.size, offset];
  const rows = await query(
    env2.DB,
    `SELECT
        u.user_id,
        u.name,
        u.english_name,
        u.profile_image,
        u.self_bio,
        u.birthyear,
        u.gender,
        loc.country AS location_country,
        loc.city AS location_city,
        u.native_lang_id,
        nl.language_name AS native_language_name,
        nl.language_code AS native_language_code,
        u.communication_method,
        u.daily_minute,
        u.partner_gender,
        u.learning_expectation,
        us.status,
        us.last_seen_at
      FROM users u
      LEFT JOIN user_status us ON us.user_id = u.user_id
      LEFT JOIN locations loc ON loc.location_id = u.location_id
      LEFT JOIN languages nl ON nl.language_id = u.native_lang_id
      ${where}
      ORDER BY u.updated_at DESC, u.created_at DESC
      LIMIT ? OFFSET ?
    `,
    selectParams
  );
  const userIds = rows.map((row) => row.user_id);
  const targetLanguagesMap = await loadTargetLanguages(env2, userIds);
  const interestsMap = await loadInterests(env2, userIds);
  const personalitiesMap = await loadPartnerPersonalities(env2, userIds);
  const partners = rows.map((row) => {
    const birthyearNum = row.birthyear ? Number(row.birthyear) : void 0;
    let age;
    if (birthyearNum && Number.isFinite(birthyearNum)) {
      const currentYear = (/* @__PURE__ */ new Date()).getUTCFullYear();
      age = currentYear - birthyearNum;
    }
    const profileImageUrl = row.profile_image ? `/api/v1/upload/file/${row.profile_image}` : void 0;
    return {
      userId: row.user_id,
      englishName: row.english_name ?? row.name ?? void 0,
      profileImageUrl,
      selfBio: row.self_bio ?? void 0,
      age,
      gender: row.gender ?? void 0,
      location: row.location_country ? row.location_city ? `${row.location_country}, ${row.location_city}` : row.location_country : void 0,
      nativeLanguage: row.native_language_name ?? void 0,
      targetLanguages: targetLanguagesMap.get(row.user_id) ?? [],
      interests: interestsMap.get(row.user_id) ?? [],
      partnerPersonalities: personalitiesMap.get(row.user_id) ?? [],
      compatibilityScore: calculateQuickCompatibilityScore(row.user_id, userId),
      onlineStatus: row.status ?? "OFFLINE",
      lastActiveTime: row.last_seen_at ?? void 0
    };
  });
  return {
    data: partners,
    page: options.page,
    size: options.size,
    total
  };
}
__name(recommendPartners, "recommendPartners");
function calculateQuickCompatibilityScore(partnerId, currentUserId) {
  const base = partnerId.localeCompare(currentUserId);
  const normalized = Math.abs(base) % 101;
  return Math.round(normalized);
}
__name(calculateQuickCompatibilityScore, "calculateQuickCompatibilityScore");
async function loadTargetLanguages(env2, userIds) {
  const map = /* @__PURE__ */ new Map();
  if (userIds.length === 0) return map;
  const placeholders = userIds.map(() => "?").join(",");
  const rows = await query(
    env2.DB,
    `SELECT
        oll.user_id,
        lang.language_name,
        curr.lang_level_name AS current_level_name,
        target.lang_level_name AS target_level_name
      FROM onboarding_lang_level oll
      LEFT JOIN languages lang ON lang.language_id = oll.language_id
      LEFT JOIN lang_level_type curr ON curr.lang_level_id = oll.current_level_id
      LEFT JOIN lang_level_type target ON target.lang_level_id = oll.target_level_id
      WHERE oll.user_id IN (${placeholders})
    `,
    userIds
  );
  for (const row of rows) {
    const list = map.get(row.user_id) ?? [];
    list.push({
      languageName: row.language_name ?? "Unknown",
      currentLevel: row.current_level_name ?? void 0,
      targetLevel: row.target_level_name ?? void 0
    });
    map.set(row.user_id, list);
  }
  return map;
}
__name(loadTargetLanguages, "loadTargetLanguages");
async function loadInterests(env2, userIds) {
  const map = /* @__PURE__ */ new Map();
  if (userIds.length === 0) return map;
  const placeholders = userIds.map(() => "?").join(",");
  const rows = await query(
    env2.DB,
    `SELECT ot.user_id, t.topic_name
       FROM onboarding_topic ot
       JOIN topic t ON t.topic_id = ot.topic_id
       WHERE ot.user_id IN (${placeholders})
    `,
    userIds
  );
  for (const row of rows) {
    const list = map.get(row.user_id) ?? [];
    if (row.topic_name) list.push(row.topic_name);
    map.set(row.user_id, list);
  }
  return map;
}
__name(loadInterests, "loadInterests");
async function loadPartnerPersonalities(env2, userIds) {
  const map = /* @__PURE__ */ new Map();
  if (userIds.length === 0) return map;
  const placeholders = userIds.map(() => "?").join(",");
  const rows = await query(
    env2.DB,
    `SELECT op.user_id, pp.partner_personality
       FROM onboarding_partner op
       JOIN partner_personality pp ON pp.partner_personality_id = op.partner_personality_id
       WHERE op.user_id IN (${placeholders})
    `,
    userIds
  );
  for (const row of rows) {
    const list = map.get(row.user_id) ?? [];
    if (row.partner_personality) list.push(row.partner_personality);
    map.set(row.user_id, list);
  }
  return map;
}
__name(loadPartnerPersonalities, "loadPartnerPersonalities");
function nowIso4() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(nowIso4, "nowIso");
function addDays2(days) {
  const date = /* @__PURE__ */ new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}
__name(addDays2, "addDays");
function normalizePair(a, b) {
  return [a, b].sort((x, y) => x < y ? -1 : x > y ? 1 : 0);
}
__name(normalizePair, "normalizePair");
async function createMatchingRequest(env2, payload) {
  try {
    console.log("[createMatchingRequest] Starting with payload:", JSON.stringify({
      senderId: payload.senderId,
      receiverId: payload.receiverId,
      hasMessage: !!payload.message
    }));
    if (payload.senderId === payload.receiverId) {
      throw new AppError("\uC790\uAE30 \uC790\uC2E0\uC5D0\uAC8C\uB294 \uB9E4\uCE6D\uC744 \uBCF4\uB0BC \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", 400, "MATCHING_SELF_REQUEST");
    }
    console.log("[createMatchingRequest] Checking for duplicate requests");
    const duplicate = await queryFirst(
      env2.DB,
      `SELECT request_id FROM matching_requests
         WHERE sender_id = ? AND receiver_id = ? AND status = ?
         LIMIT 1`,
      [payload.senderId, payload.receiverId, MATCHING_STATUS.PENDING]
    );
    if (duplicate) {
      console.log("[createMatchingRequest] Duplicate request found:", duplicate.request_id);
      throw new AppError("\uC774\uBBF8 \uB300\uAE30 \uC911\uC778 \uB9E4\uCE6D \uC694\uCCAD\uC774 \uC788\uC2B5\uB2C8\uB2E4.", 400, "MATCHING_DUPLICATE_REQUEST");
    }
    console.log("[createMatchingRequest] Checking for existing matches");
    const [user1, user2] = normalizePair(payload.senderId, payload.receiverId);
    const existingMatch = await queryFirst(
      env2.DB,
      `SELECT match_id, is_active FROM user_matches
         WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
         LIMIT 1`,
      [user1, user2, user1, user2]
    );
    if (existingMatch?.is_active) {
      console.log("[createMatchingRequest] Active match found:", existingMatch.match_id);
      throw new AppError("\uC774\uBBF8 \uB9E4\uCE6D\uB41C \uC0AC\uC6A9\uC790\uC785\uB2C8\uB2E4.", 400, "MATCHING_ALREADY_MATCHED");
    }
    const requestId2 = crypto.randomUUID();
    const now = nowIso4();
    const expiresAt = addDays2(MATCHING_DEFAULT_EXPIRE_DAYS);
    console.log("[createMatchingRequest] Inserting new request:", {
      requestId: requestId2,
      senderId: payload.senderId,
      receiverId: payload.receiverId
    });
    await execute(
      env2.DB,
      `INSERT INTO matching_requests (
          request_id, sender_id, receiver_id, message, status, response_message,
          responded_at, expires_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?)
      `,
      [
        requestId2,
        payload.senderId,
        payload.receiverId,
        payload.message ?? null,
        MATCHING_STATUS.PENDING,
        expiresAt,
        now,
        now
      ]
    );
    console.log("[createMatchingRequest] Successfully created request:", requestId2);
    return { requestId: requestId2 };
  } catch (error3) {
    console.error("[createMatchingRequest] Error occurred:", {
      error: error3 instanceof Error ? error3.message : String(error3),
      stack: error3 instanceof Error ? error3.stack : void 0,
      payload: {
        senderId: payload.senderId,
        receiverId: payload.receiverId
      }
    });
    if (error3 instanceof AppError) {
      throw error3;
    }
    throw new AppError(
      error3 instanceof Error ? error3.message : "\uB9E4\uCE6D \uC694\uCCAD \uC0DD\uC131 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
      500,
      "MATCHING_REQUEST_CREATE_FAILED"
    );
  }
}
__name(createMatchingRequest, "createMatchingRequest");
async function listSentRequests(env2, userId, page, size) {
  return listRequests(env2, { userId, page, size, mode: "sent" });
}
__name(listSentRequests, "listSentRequests");
async function listReceivedRequests(env2, userId, page, size) {
  return listRequests(env2, { userId, page, size, mode: "received" });
}
__name(listReceivedRequests, "listReceivedRequests");
async function listRequests(env2, options) {
  const column = options.mode === "sent" ? "sender_id" : "receiver_id";
  const partnerColumn = options.mode === "sent" ? "receiver_id" : "sender_id";
  const totalRow = await queryFirst(
    env2.DB,
    `SELECT COUNT(*) as count FROM matching_requests WHERE ${column} = ?`,
    [options.userId]
  );
  const total = totalRow?.count ?? 0;
  const offset = (options.page - 1) * options.size;
  const rows = await query(
    env2.DB,
    `SELECT
        mr.request_id,
        mr.sender_id,
        mr.receiver_id,
        mr.message,
        mr.status,
        mr.response_message,
        mr.responded_at,
        mr.expires_at,
        mr.created_at,
        partner.user_id AS partner_id,
        partner.name AS partner_name,
        partner.profile_image AS partner_profile_image
      FROM matching_requests mr
      JOIN users partner ON partner.user_id = mr.${partnerColumn}
      WHERE mr.${column} = ?
      ORDER BY mr.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [options.userId, options.size, offset]
  );
  const data = rows.map((row) => ({
    requestId: row.request_id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    message: row.message ?? void 0,
    status: row.status,
    responseMessage: row.response_message ?? void 0,
    respondedAt: row.responded_at ?? void 0,
    expiresAt: row.expires_at ?? void 0,
    createdAt: row.created_at,
    partner: {
      userId: row.partner_id,
      name: row.partner_name ?? void 0,
      profileImageUrl: row.partner_profile_image ? `/api/v1/upload/file/${row.partner_profile_image}` : void 0
    }
  }));
  return {
    data,
    page: options.page,
    size: options.size,
    total
  };
}
__name(listRequests, "listRequests");
async function acceptMatchingRequest(env2, options) {
  const request = await queryFirst(
    env2.DB,
    "SELECT request_id, sender_id, receiver_id, status FROM matching_requests WHERE request_id = ? LIMIT 1",
    [options.requestId]
  );
  if (!request) {
    throw new Error("\uB9E4\uCE6D \uC694\uCCAD\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  if (request.receiver_id !== options.receiverId) {
    throw new Error("\uB2E4\uB978 \uC0AC\uC6A9\uC790\uC758 \uC694\uCCAD\uC785\uB2C8\uB2E4.");
  }
  if (request.status !== MATCHING_STATUS.PENDING) {
    throw new Error("\uC774\uBBF8 \uCC98\uB9AC\uB41C \uC694\uCCAD\uC785\uB2C8\uB2E4.");
  }
  const now = nowIso4();
  const [user1, user2] = normalizePair(request.sender_id, request.receiver_id);
  await transaction(env2.DB, [
    {
      sql: `UPDATE matching_requests
              SET status = ?, response_message = ?, responded_at = ?, updated_at = ?
            WHERE request_id = ?`,
      params: [
        MATCHING_STATUS.ACCEPTED,
        options.responseMessage ?? null,
        now,
        now,
        options.requestId
      ]
    },
    {
      sql: `INSERT INTO user_matches (
                match_id, user1_id, user2_id, matched_at, is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 1, ?, ?)
            ON CONFLICT(user1_id, user2_id) DO UPDATE SET
              is_active = 1,
              matched_at = excluded.matched_at,
              deactivated_at = NULL,
              deactivated_by = NULL,
              updated_at = excluded.updated_at`,
      params: [crypto.randomUUID(), user1, user2, now, now, now]
    }
  ]);
}
__name(acceptMatchingRequest, "acceptMatchingRequest");
async function rejectMatchingRequest(env2, options) {
  const request = await queryFirst(
    env2.DB,
    "SELECT receiver_id, status FROM matching_requests WHERE request_id = ? LIMIT 1",
    [options.requestId]
  );
  if (!request) {
    throw new Error("\uB9E4\uCE6D \uC694\uCCAD\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  if (request.receiver_id !== options.receiverId) {
    throw new Error("\uB2E4\uB978 \uC0AC\uC6A9\uC790\uC758 \uC694\uCCAD\uC785\uB2C8\uB2E4.");
  }
  if (request.status !== MATCHING_STATUS.PENDING) {
    throw new Error("\uC774\uBBF8 \uCC98\uB9AC\uB41C \uC694\uCCAD\uC785\uB2C8\uB2E4.");
  }
  const now = nowIso4();
  await execute(
    env2.DB,
    `UPDATE matching_requests
       SET status = ?, response_message = ?, responded_at = ?, updated_at = ?
       WHERE request_id = ?`,
    [MATCHING_STATUS.REJECTED, options.responseMessage ?? null, now, now, options.requestId]
  );
}
__name(rejectMatchingRequest, "rejectMatchingRequest");
async function listMatches(env2, userId, page, size) {
  const totalRow = await queryFirst(
    env2.DB,
    "SELECT COUNT(*) as count FROM user_matches WHERE is_active = 1 AND (user1_id = ? OR user2_id = ?)",
    [userId, userId]
  );
  const total = totalRow?.count ?? 0;
  const offset = (page - 1) * size;
  const rows = await query(
    env2.DB,
    `SELECT
        um.match_id,
        um.user1_id,
        um.user2_id,
        um.matched_at,
        CASE WHEN um.user1_id = ? THEN um.user2_id ELSE um.user1_id END AS partner_id,
        p.name AS partner_name,
        p.profile_image AS partner_profile_image
      FROM user_matches um
      JOIN users p ON p.user_id = CASE WHEN um.user1_id = ? THEN um.user2_id ELSE um.user1_id END
      WHERE um.is_active = 1 AND (um.user1_id = ? OR um.user2_id = ?)
      ORDER BY um.matched_at DESC
      LIMIT ? OFFSET ?
    `,
    [userId, userId, userId, userId, size, offset]
  );
  const data = rows.map((row) => ({
    matchId: row.match_id,
    partnerId: row.partner_id,
    partnerName: row.partner_name ?? void 0,
    partnerProfileImageUrl: row.partner_profile_image ? `/api/v1/upload/file/${row.partner_profile_image}` : void 0,
    matchedAt: row.matched_at
  }));
  return {
    data,
    page,
    size,
    total
  };
}
__name(listMatches, "listMatches");
async function removeMatch(env2, options) {
  const match = await queryFirst(
    env2.DB,
    "SELECT match_id, user1_id, user2_id, is_active FROM user_matches WHERE match_id = ? LIMIT 1",
    [options.matchId]
  );
  if (!match) {
    throw new Error("\uB9E4\uCE6D \uC815\uBCF4\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  if (match.is_active !== 1) {
    return;
  }
  if (match.user1_id !== options.userId && match.user2_id !== options.userId) {
    throw new Error("\uD574\uB2F9 \uB9E4\uCE6D\uC5D0 \uB300\uD55C \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
  }
  const now = nowIso4();
  await execute(
    env2.DB,
    `UPDATE user_matches
       SET is_active = 0,
           deactivated_at = ?,
           deactivated_by = ?,
           updated_at = ?
       WHERE match_id = ?`,
    [now, options.userId, now, options.matchId]
  );
}
__name(removeMatch, "removeMatch");
async function getMatchingQueueStatus(env2, userId) {
  return queryFirst(
    env2.DB,
    "SELECT queue_id, session_type, queue_status, priority_score, joined_at, estimated_wait_minutes FROM matching_queue WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
    [userId]
  );
}
__name(getMatchingQueueStatus, "getMatchingQueueStatus");
async function addToMatchingQueue(env2, userId, sessionType) {
  const now = nowIso4();
  await transaction(env2.DB, [
    { sql: "DELETE FROM matching_queue WHERE user_id = ?", params: [userId] },
    {
      sql: `INSERT INTO matching_queue (
              user_id, session_type, queue_status, priority_score,
              joined_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      params: [userId, sessionType, "WAITING", 0, now, now, now]
    }
  ]);
}
__name(addToMatchingQueue, "addToMatchingQueue");
async function removeFromMatchingQueue(env2, userId) {
  await execute(env2.DB, "DELETE FROM matching_queue WHERE user_id = ?", [userId]);
}
__name(removeFromMatchingQueue, "removeFromMatchingQueue");
async function recordFeedback(env2, options) {
  const now = nowIso4();
  await execute(
    env2.DB,
    `INSERT INTO matching_feedback (
        reviewer_id, partner_id, match_id, overall_rating,
        written_feedback, would_match_again, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      options.reviewerId,
      options.partnerId,
      options.matchId,
      options.overallRating,
      options.writtenFeedback ?? null,
      options.wouldMatchAgain ? 1 : 0,
      now,
      now
    ]
  );
}
__name(recordFeedback, "recordFeedback");
async function loadCompatibilityProfile(env2, userId) {
  const userRow = await queryFirst(
    env2.DB,
    `SELECT u.user_id,
            u.native_lang_id,
            lang.language_code,
            lang.language_name
       FROM users u
       LEFT JOIN languages lang ON lang.language_id = u.native_lang_id
      WHERE u.user_id = ?
      LIMIT 1`,
    [userId]
  );
  if (!userRow) {
    throw new AppError("\uC0AC\uC6A9\uC790\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", 404, "MATCHING_USER_NOT_FOUND");
  }
  const languageRows = await query(
    env2.DB,
    `SELECT
        oll.language_id,
        lang.language_code,
        lang.language_name,
        curr.level_order AS current_level_order,
        target.level_order AS target_level_order
      FROM onboarding_lang_level oll
      LEFT JOIN languages lang ON lang.language_id = oll.language_id
      LEFT JOIN lang_level_type curr ON curr.lang_level_id = oll.current_level_id
      LEFT JOIN lang_level_type target ON target.lang_level_id = oll.target_level_id
     WHERE oll.user_id = ?`,
    [userId]
  );
  const targetLanguages = languageRows.map((row) => ({
    languageId: row.language_id ?? void 0,
    languageCode: row.language_code ?? void 0,
    languageName: row.language_name ?? void 0,
    currentLevelOrder: row.current_level_order,
    targetLevelOrder: row.target_level_order
  }));
  const personalityMap = await loadPartnerPersonalities(env2, [userId]);
  const interestsMap = await loadInterests(env2, [userId]);
  const studyGoalRows = await query(
    env2.DB,
    `SELECT m.motivation_name
       FROM onboarding_study_goal osg
       JOIN motivation m ON m.motivation_id = osg.motivation_id
      WHERE osg.user_id = ?`,
    [userId]
  );
  return {
    userId: userRow.user_id,
    nativeLanguageId: userRow.native_lang_id ?? void 0,
    nativeLanguageCode: userRow.language_code ?? void 0,
    nativeLanguageName: userRow.language_name ?? void 0,
    targetLanguages,
    personalities: personalityMap.get(userId) ?? [],
    studyGoals: studyGoalRows.map((row) => row.motivation_name).filter((name) => Boolean(name)),
    interests: interestsMap.get(userId) ?? []
  };
}
__name(loadCompatibilityProfile, "loadCompatibilityProfile");
function intersectStrings(a, b) {
  const setB = new Set(b.map((value) => value.toLowerCase()));
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const value of a) {
    const key = value.toLowerCase();
    if (!seen.has(key) && setB.has(key)) {
      seen.add(key);
      result.push(value);
    }
  }
  return result;
}
__name(intersectStrings, "intersectStrings");
function computeLanguageCompatibility(current, partner) {
  const descriptionParts = [];
  const mutualExchangeLanguages = [];
  let score = 0;
  if (current.nativeLanguageId) {
    const partnerTargets2 = partner.targetLanguages.filter(
      (lang) => lang.languageId === current.nativeLanguageId
    );
    if (partnerTargets2.length > 0) {
      const label = current.nativeLanguageName ?? current.nativeLanguageCode ?? "native language";
      mutualExchangeLanguages.push(label);
      score += 40;
      descriptionParts.push("\uC0C1\uB300\uAC00 \uB0B4 \uBAA8\uAD6D\uC5B4\uB97C \uD559\uC2B5 \uC911\uC785\uB2C8\uB2E4.");
    }
  }
  if (partner.nativeLanguageId) {
    const userTargets = current.targetLanguages.filter(
      (lang) => lang.languageId === partner.nativeLanguageId
    );
    if (userTargets.length > 0) {
      const label = partner.nativeLanguageName ?? partner.nativeLanguageCode ?? "partner language";
      mutualExchangeLanguages.push(label);
      score += 40;
      descriptionParts.push("\uB0B4\uAC00 \uC0C1\uB300\uC758 \uBAA8\uAD6D\uC5B4\uB97C \uD559\uC2B5\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");
    }
  }
  const currentTargets = current.targetLanguages.map((lang) => lang.languageCode ?? lang.languageName ?? String(lang.languageId ?? "")).filter((value) => value.length > 0);
  const partnerTargets = partner.targetLanguages.map((lang) => lang.languageCode ?? lang.languageName ?? String(lang.languageId ?? "")).filter((value) => value.length > 0);
  const sharedTargetLanguages = intersectStrings(currentTargets, partnerTargets);
  if (sharedTargetLanguages.length > 0) {
    score += 15;
    descriptionParts.push("\uAC19\uC740 \uBAA9\uD45C \uC5B8\uC5B4\uB97C \uD568\uAED8 \uD559\uC2B5\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");
  }
  let levelBonus = 0;
  if (sharedTargetLanguages.length > 0) {
    const averages = sharedTargetLanguages.map((code) => {
      const normalized = code.toLowerCase();
      const currentLanguage = current.targetLanguages.find((lang) => {
        const candidate = lang.languageCode ?? lang.languageName ?? "";
        return candidate.toLowerCase() === normalized;
      });
      const partnerLanguage = partner.targetLanguages.find((lang) => {
        const candidate = lang.languageCode ?? lang.languageName ?? "";
        return candidate.toLowerCase() === normalized;
      });
      const currentLevel = currentLanguage?.targetLevelOrder ?? currentLanguage?.currentLevelOrder;
      const partnerLevel = partnerLanguage?.targetLevelOrder ?? partnerLanguage?.currentLevelOrder;
      if (currentLevel != null && partnerLevel != null) {
        const diff = Math.abs(currentLevel - partnerLevel);
        if (diff <= 1) return 12;
        if (diff <= 2) return 8;
        return 5;
      }
      return 5;
    });
    if (averages.length > 0) {
      levelBonus = Math.min(15, averages.reduce((sum, value) => sum + value, 0) / averages.length);
      if (levelBonus >= 10) {
        descriptionParts.push("\uC5B8\uC5B4 \uB808\uBCA8\uC774 \uBE44\uC2B7\uD574 \uB300\uD654\uAC00 \uC218\uC6D4\uD569\uB2C8\uB2E4.");
      }
    }
  }
  score += levelBonus;
  if (score === 0) {
    if (current.targetLanguages.length === 0 || partner.targetLanguages.length === 0) {
      score = 50;
      descriptionParts.push("\uC5B8\uC5B4 \uD559\uC2B5 \uC815\uBCF4\uAC00 \uBD80\uC871\uD558\uC5EC \uAE30\uBCF8 \uC810\uC218\uB97C \uC801\uC6A9\uD588\uC2B5\uB2C8\uB2E4.");
    } else {
      score = 30;
      descriptionParts.push("\uC5B8\uC5B4 \uD559\uC2B5 \uBC29\uD5A5\uC774 \uBD80\uBD84\uC801\uC73C\uB85C\uB9CC \uACB9\uCE69\uB2C8\uB2E4.");
    }
  }
  return {
    score: Math.min(100, Math.round(score * 10) / 10),
    description: descriptionParts.join(" "),
    mutualExchangeLanguages: Array.from(new Set(mutualExchangeLanguages)),
    sharedTargetLanguages: Array.from(new Set(sharedTargetLanguages))
  };
}
__name(computeLanguageCompatibility, "computeLanguageCompatibility");
function hasComplementaryTrait(traitsA, traitsB, pair) {
  const [first, second] = pair;
  const aHasFirst = traitsA.has(first);
  const aHasSecond = traitsA.has(second);
  const bHasFirst = traitsB.has(first);
  const bHasSecond = traitsB.has(second);
  return aHasFirst && bHasSecond || aHasSecond && bHasFirst;
}
__name(hasComplementaryTrait, "hasComplementaryTrait");
function computePersonalityCompatibility(current, partner) {
  const traitsA = new Set(current.personalities.map((trait) => trait.toUpperCase()));
  const traitsB = new Set(partner.personalities.map((trait) => trait.toUpperCase()));
  if (traitsA.size === 0 || traitsB.size === 0) {
    return {
      score: 50,
      description: "\uC131\uACA9 \uB370\uC774\uD130\uAC00 \uCDA9\uBD84\uD558\uC9C0 \uC54A\uC544 \uAE30\uBCF8 \uC810\uC218\uB97C \uC801\uC6A9\uD588\uC2B5\uB2C8\uB2E4.",
      overlap: []
    };
  }
  const commonTraits = Array.from(traitsA).filter((trait) => traitsB.has(trait));
  let score = commonTraits.length * 20;
  const complementaryPairs = [
    ["INTROVERT", "EXTROVERT"],
    ["LEADER", "SUPPORTER"],
    ["PLANNER", "ADVENTURER"],
    ["ANALYTICAL", "CREATIVE"]
  ];
  let complementaryScore = 0;
  for (const pair of complementaryPairs) {
    if (hasComplementaryTrait(traitsA, traitsB, pair)) {
      complementaryScore += 15;
    }
  }
  score += complementaryScore;
  if (score === 0) {
    score = 45;
  }
  return {
    score: Math.min(100, Math.round(score * 10) / 10),
    description: commonTraits.length > 0 ? "\uC131\uACA9 \uC720\uD615\uC774 \uC798 \uB9DE\uC73C\uBA70 \uBCF4\uC644 \uAD00\uACC4\uB3C4 \uAE30\uB300\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." : complementaryScore > 0 ? "\uC11C\uB85C\uC758 \uC131\uACA9\uC774 \uBCF4\uC644\uC801\uC778 \uC870\uD569\uC785\uB2C8\uB2E4." : "\uC131\uACA9 \uC870\uD569 \uB370\uC774\uD130\uAC00 \uC81C\uD55C\uC801\uC785\uB2C8\uB2E4.",
    overlap: commonTraits
  };
}
__name(computePersonalityCompatibility, "computePersonalityCompatibility");
function computeGoalCompatibility(current, partner) {
  if (current.studyGoals.length === 0 || partner.studyGoals.length === 0) {
    return {
      score: 50,
      description: "\uD559\uC2B5 \uBAA9\uD45C \uB370\uC774\uD130\uAC00 \uBD80\uC871\uD558\uC5EC \uAE30\uBCF8 \uC810\uC218\uB97C \uC801\uC6A9\uD588\uC2B5\uB2C8\uB2E4.",
      sharedGoals: []
    };
  }
  const sharedGoals = intersectStrings(current.studyGoals, partner.studyGoals);
  let score = sharedGoals.length * 25;
  const normalizedCurrent = current.studyGoals.map((goal) => goal.toUpperCase());
  const normalizedPartner = partner.studyGoals.map((goal) => goal.toUpperCase());
  const currentSet = new Set(normalizedCurrent);
  const partnerSet = new Set(normalizedPartner);
  const complementaryPairs = [
    ["BUSINESS", "CASUAL"],
    ["ACADEMIC", "PRACTICAL"],
    ["TEST_PREP", "CONVERSATION"]
  ];
  for (const [a, b] of complementaryPairs) {
    if (currentSet.has(a) && partnerSet.has(b) || currentSet.has(b) && partnerSet.has(a)) {
      score += 20;
      break;
    }
  }
  if (score === 0) {
    score = 45;
  }
  return {
    score: Math.min(100, Math.round(score * 10) / 10),
    description: sharedGoals.length > 0 ? "\uACF5\uD1B5 \uD559\uC2B5 \uBAA9\uD45C\uAC00 \uC788\uC5B4 \uD559\uC2B5 \uBC29\uD5A5\uC774 \uC720\uC0AC\uD569\uB2C8\uB2E4." : "\uD559\uC2B5 \uBAA9\uD45C\uAC00 \uBCF4\uC644\uC801\uC774\uC5B4\uC11C \uC11C\uB85C \uC2DC\uB108\uC9C0\uB97C \uB0BC \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    sharedGoals
  };
}
__name(computeGoalCompatibility, "computeGoalCompatibility");
function computeInterestCompatibility(current, partner) {
  if (current.interests.length === 0 || partner.interests.length === 0) {
    return {
      score: 50,
      description: "\uAD00\uC2EC\uC0AC \uB370\uC774\uD130\uAC00 \uBD80\uC871\uD558\uC5EC \uAE30\uBCF8 \uC810\uC218\uB97C \uC801\uC6A9\uD588\uC2B5\uB2C8\uB2E4.",
      sharedInterests: []
    };
  }
  const sharedInterests = intersectStrings(current.interests, partner.interests);
  const totalUnique = (/* @__PURE__ */ new Set(
    [...current.interests.map((i) => i.toLowerCase()), ...partner.interests.map((i) => i.toLowerCase())]
  )).size;
  const ratio = totalUnique > 0 ? sharedInterests.length * 2 / totalUnique : 0;
  const score = Math.round(Math.min(100, ratio * 1e3)) / 10;
  return {
    score,
    description: sharedInterests.length > 0 ? "\uACF5\uD1B5 \uAD00\uC2EC\uC0AC\uAC00 \uC788\uC5B4 \uC790\uC5F0\uC2A4\uB7FD\uAC8C \uB300\uD654\uB97C \uC774\uC5B4\uAC08 \uC218 \uC788\uC2B5\uB2C8\uB2E4." : "\uAD00\uC2EC\uC0AC\uAC00 \uB2E4\uC591\uD558\uAC8C \uBD84\uD3EC\uD574 \uC788\uC5B4 \uC0C8\uB85C\uC6B4 \uC8FC\uC81C\uB97C \uACF5\uC720\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    sharedInterests
  };
}
__name(computeInterestCompatibility, "computeInterestCompatibility");
function determineCompatibilityLevel(score) {
  if (score >= 80) return "HIGH";
  if (score >= 60) return "MEDIUM";
  return "LOW";
}
__name(determineCompatibilityLevel, "determineCompatibilityLevel");
function createRecommendation(score, categoryScores) {
  let message = "";
  if (score >= 80) {
    message = "\uB9E4\uC6B0 \uC88B\uC740 \uB9E4\uCE6D\uC785\uB2C8\uB2E4! ";
  } else if (score >= 60) {
    message = "\uAD1C\uCC2E\uC740 \uB9E4\uCE6D\uC785\uB2C8\uB2E4. ";
  } else {
    message = "\uD638\uD658\uC131\uC774 \uB0AE\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4. ";
  }
  const bestCategory = Object.entries(categoryScores).sort((a, b) => b[1] - a[1]).map(([category]) => category)[0];
  switch (bestCategory) {
    case "language":
      message += "\uC5B8\uC5B4 \uAD50\uD658\uC5D0 \uCD5C\uC801\uD654\uB41C \uD30C\uD2B8\uB108\uC785\uB2C8\uB2E4.";
      break;
    case "personality":
      message += "\uC131\uACA9\uC774 \uC798 \uB9DE\uB294 \uD30C\uD2B8\uB108\uC785\uB2C8\uB2E4.";
      break;
    case "goals":
      message += "\uD559\uC2B5 \uBAA9\uD45C\uAC00 \uBE44\uC2B7\uD55C \uD30C\uD2B8\uB108\uC785\uB2C8\uB2E4.";
      break;
    case "interests":
      message += "\uACF5\uD1B5 \uAD00\uC2EC\uC0AC\uAC00 \uB9CE\uC740 \uD30C\uD2B8\uB108\uC785\uB2C8\uB2E4.";
      break;
    default:
      message += "\uD568\uAED8 \uD559\uC2B5\uD558\uBA70 \uC2DC\uB108\uC9C0\uB97C \uD655\uC778\uD574\uBCF4\uC138\uC694!";
  }
  return message;
}
__name(createRecommendation, "createRecommendation");
async function calculateCompatibilityAnalysis(env2, currentUserId, partnerId) {
  if (currentUserId === partnerId) {
    throw new AppError("\uC790\uC2E0\uACFC\uC758 \uD638\uD658\uC131\uC740 \uBD84\uC11D\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", 400, "MATCHING_SELF_COMPATIBILITY");
  }
  const [currentProfile, partnerProfile] = await Promise.all([
    loadCompatibilityProfile(env2, currentUserId),
    loadCompatibilityProfile(env2, partnerId)
  ]);
  const language = computeLanguageCompatibility(currentProfile, partnerProfile);
  const personality = computePersonalityCompatibility(currentProfile, partnerProfile);
  const goals = computeGoalCompatibility(currentProfile, partnerProfile);
  const interests = computeInterestCompatibility(currentProfile, partnerProfile);
  const overallScore = Math.round(
    (language.score * 0.3 + personality.score * 0.25 + goals.score * 0.25 + interests.score * 0.2) * 10
  ) / 10;
  const categoryScores = {
    language: language.score,
    personality: personality.score,
    goals: goals.score,
    interests: interests.score
  };
  const categoryDetails = [
    { category: "language", score: language.score, description: language.description },
    { category: "personality", score: personality.score, description: personality.description },
    { category: "goals", score: goals.score, description: goals.description },
    { category: "interests", score: interests.score, description: interests.description }
  ];
  const sharedInsights = {
    mutualExchangeLanguages: language.mutualExchangeLanguages,
    sharedTargetLanguages: language.sharedTargetLanguages,
    sharedInterests: interests.sharedInterests,
    sharedGoals: goals.sharedGoals,
    personalityOverlap: personality.overlap
  };
  return {
    overallScore,
    compatibilityLevel: determineCompatibilityLevel(overallScore),
    recommendation: createRecommendation(overallScore, categoryScores),
    categoryScores,
    categoryDetails,
    sharedInsights
  };
}
__name(calculateCompatibilityAnalysis, "calculateCompatibilityAnalysis");

// src/routes/matching.ts
var matchingRoutes = new Hono2();
var requireAuth8 = auth();
function getPaginationParams3(c) {
  const page = Math.max(Number(c.req.query("page") ?? "1"), 1);
  const size = Math.max(Math.min(Number(c.req.query("size") ?? "20"), 50), 1);
  return { page, size };
}
__name(getPaginationParams3, "getPaginationParams");
matchingRoutes.use("*", requireAuth8);
async function getMatchingSettings(env2, userId) {
  const key = `matching:settings:${userId}`;
  const stored = await env2.CACHE.get(key, { type: "json" });
  if (stored) {
    return stored;
  }
  return {
    autoAcceptMatches: false,
    showOnlineStatus: true,
    allowMatchRequests: true,
    preferredAgeRange: null,
    preferredGenders: [],
    preferredNationalities: [],
    preferredLanguages: [],
    maxDistance: null,
    notificationSettings: {
      matchFound: true,
      requestReceived: true
    }
  };
}
__name(getMatchingSettings, "getMatchingSettings");
matchingRoutes.get("/partners", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const { page, size } = getPaginationParams3(c);
  try {
    const result = await recommendPartners(c.env, userId, {
      nativeLanguage: c.req.query("nativeLanguage") || void 0,
      targetLanguage: c.req.query("targetLanguage") || void 0,
      languageLevel: c.req.query("languageLevel") || void 0,
      minAge: c.req.query("minAge") ? Number(c.req.query("minAge")) : void 0,
      maxAge: c.req.query("maxAge") ? Number(c.req.query("maxAge")) : void 0,
      page,
      size
    });
    return paginatedResponse(c, result.data, {
      page: result.page,
      limit: result.size,
      total: result.total
    });
  } catch (error3) {
    throw new AppError(
      error3 instanceof Error ? error3.message : "Failed to load partners",
      500,
      "MATCHING_PARTNERS_FAILED"
    );
  }
});
matchingRoutes.post("/partners/advanced", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const filters = await c.req.json().catch(() => ({}));
  const { page, size } = getPaginationParams3(c);
  try {
    const result = await recommendPartners(c.env, userId, {
      nativeLanguage: typeof filters.nativeLanguage === "string" ? filters.nativeLanguage : void 0,
      targetLanguage: typeof filters.targetLanguage === "string" ? filters.targetLanguage : void 0,
      languageLevel: typeof filters.proficiencyLevel === "string" ? filters.proficiencyLevel : void 0,
      minAge: typeof filters.minAge === "number" ? filters.minAge : void 0,
      maxAge: typeof filters.maxAge === "number" ? filters.maxAge : void 0,
      page,
      size
    });
    return paginatedResponse(c, result.data, {
      page: result.page,
      limit: result.size,
      total: result.total
    });
  } catch (error3) {
    throw new AppError(
      error3 instanceof Error ? error3.message : "Failed to search partners",
      500,
      "MATCHING_SEARCH_FAILED"
    );
  }
});
matchingRoutes.post("/request", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  console.log("[POST /matching/request] Request body:", JSON.stringify({
    targetUserId: body.targetUserId,
    hasMessage: !!body.message,
    userId
  }));
  if (typeof body.targetUserId !== "string") {
    throw new AppError("targetUserId is required", 400, "INVALID_PAYLOAD");
  }
  try {
    const result = await createMatchingRequest(c.env, {
      senderId: userId,
      receiverId: body.targetUserId,
      message: typeof body.message === "string" ? body.message : void 0
    });
    console.log("[POST /matching/request] Success:", result);
    return successResponse(c, { success: true, requestId: result.requestId });
  } catch (error3) {
    console.error("[POST /matching/request] Error:", {
      error: error3 instanceof Error ? error3.message : String(error3),
      stack: error3 instanceof Error ? error3.stack : void 0,
      isAppError: error3 instanceof AppError,
      userId,
      targetUserId: body.targetUserId
    });
    if (error3 instanceof AppError) {
      throw error3;
    }
    throw new AppError(
      error3 instanceof Error ? error3.message : "Failed to send matching request",
      400,
      "MATCHING_REQUEST_FAILED"
    );
  }
});
matchingRoutes.get("/requests/sent", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const { page, size } = getPaginationParams3(c);
  const result = await listSentRequests(c.env, userId, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});
matchingRoutes.get("/requests/received", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const { page, size } = getPaginationParams3(c);
  const result = await listReceivedRequests(c.env, userId, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});
matchingRoutes.post("/accept/:requestId", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const requestId2 = c.req.param("requestId");
  const body = await c.req.json().catch(() => ({}));
  try {
    await acceptMatchingRequest(c.env, {
      requestId: requestId2,
      receiverId: userId,
      responseMessage: body.responseMessage
    });
    return successResponse(c, { success: true });
  } catch (error3) {
    throw new AppError(
      error3 instanceof Error ? error3.message : "Failed to accept matching request",
      400,
      "MATCHING_ACCEPT_FAILED"
    );
  }
});
matchingRoutes.post("/reject/:requestId", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const requestId2 = c.req.param("requestId");
  const body = await c.req.json().catch(() => ({}));
  try {
    await rejectMatchingRequest(c.env, {
      requestId: requestId2,
      receiverId: userId,
      responseMessage: body.responseMessage
    });
    return successResponse(c, { success: true });
  } catch (error3) {
    throw new AppError(
      error3 instanceof Error ? error3.message : "Failed to reject matching request",
      400,
      "MATCHING_REJECT_FAILED"
    );
  }
});
matchingRoutes.get("/matches", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const { page, size } = getPaginationParams3(c);
  const result = await listMatches(c.env, userId, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});
matchingRoutes.delete("/matches/:matchId", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const matchId = c.req.param("matchId");
  await removeMatch(c.env, { matchId, userId });
  return successResponse(c, { success: true });
});
matchingRoutes.post("/queue", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  const sessionType = typeof body.sessionType === "string" ? body.sessionType : "ANY";
  await addToMatchingQueue(c.env, userId, sessionType);
  return successResponse(c, { success: true });
});
matchingRoutes.delete("/queue", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  await removeFromMatchingQueue(c.env, userId);
  return successResponse(c, { success: true });
});
matchingRoutes.get("/queue/status", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const status = await getMatchingQueueStatus(c.env, userId);
  return successResponse(c, status ?? {});
});
matchingRoutes.get("/history", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const { page, size } = getPaginationParams3(c);
  const result = await listMatches(c.env, userId, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});
matchingRoutes.post("/feedback", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json();
  if (typeof body.partnerId !== "string" || typeof body.matchId !== "string" || typeof body.overallRating !== "number") {
    throw new AppError("partnerId, matchId, overallRating are required", 400, "INVALID_PAYLOAD");
  }
  await recordFeedback(c.env, {
    reviewerId: userId,
    partnerId: body.partnerId,
    matchId: body.matchId,
    overallRating: body.overallRating,
    writtenFeedback: typeof body.writtenFeedback === "string" ? body.writtenFeedback : void 0,
    wouldMatchAgain: typeof body.wouldMatchAgain === "boolean" ? body.wouldMatchAgain : void 0
  });
  return successResponse(c, { success: true });
});
matchingRoutes.get("/my-matches", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const result = await listMatches(c.env, userId, 1, 50);
  return successResponse(c, result.data);
});
matchingRoutes.get("/stats", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const matches = await listMatches(c.env, userId, 1, 20);
  const queueStatus = await getMatchingQueueStatus(c.env, userId);
  const activeRequest = queueStatus?.queue_status === "WAITING";
  return successResponse(c, {
    totalMatches: matches.total,
    recentMatches: matches.data.slice(0, 5),
    activeRequest,
    queueStatus
  });
});
matchingRoutes.get("/compatibility/:partnerId", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const partnerId = c.req.param("partnerId");
  const analysis = await calculateCompatibilityAnalysis(c.env, userId, partnerId);
  return successResponse(c, {
    partnerId,
    ...analysis
  });
});
matchingRoutes.get("/settings", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const settings = await getMatchingSettings(c.env, userId);
  return successResponse(c, settings);
});
matchingRoutes.patch("/settings", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User not found in context", 500, "CONTEXT_MISSING_USER");
  const updates = await c.req.json().catch(() => ({}));
  const current = await getMatchingSettings(c.env, userId);
  const merged = {
    ...current,
    ...updates,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await c.env.CACHE.put(`matching:settings:${userId}`, JSON.stringify(merged));
  return successResponse(c, merged);
});
var matching_default = matchingRoutes;

// src/routes/achievements.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_errors();

// src/services/achievement.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
init_errors();
var CATEGORY_ALIAS = {
  LEARNING: "STUDY",
  SKILL: "STUDY",
  SOCIAL: "SOCIAL",
  ENGAGEMENT: "ENGAGEMENT",
  TIME: "STREAK",
  MILESTONE: "MILESTONE",
  SPECIAL: "SPECIAL"
};
var DEFAULT_ACHIEVEMENTS = [
  {
    achievementKey: "first_session",
    title: "\uCCAB \uC138\uC158 \uC644\uB8CC",
    description: "\uCCAB \uBC88\uC9F8 \uD654\uC0C1 \uC138\uC158\uC744 \uC644\uB8CC\uD588\uC2B5\uB2C8\uB2E4!",
    category: "LEARNING",
    type: "COUNT",
    tier: "BRONZE",
    targetValue: 1,
    targetUnit: "\uC138\uC158",
    xpReward: 100,
    badgeColor: "#CD7F32",
    sortOrder: 1
  },
  {
    achievementKey: "session_10",
    title: "\uC138\uC158 \uB9C8\uC2A4\uD130",
    description: "10\uBC88\uC758 \uD654\uC0C1 \uC138\uC158\uC744 \uC644\uB8CC\uD588\uC2B5\uB2C8\uB2E4!",
    category: "LEARNING",
    type: "COUNT",
    tier: "SILVER",
    targetValue: 10,
    targetUnit: "\uC138\uC158",
    xpReward: 500,
    badgeColor: "#C0C0C0",
    sortOrder: 2
  },
  {
    achievementKey: "session_50",
    title: "\uC138\uC158 \uC804\uBB38\uAC00",
    description: "50\uBC88\uC758 \uD654\uC0C1 \uC138\uC158\uC744 \uC644\uB8CC\uD588\uC2B5\uB2C8\uB2E4!",
    category: "LEARNING",
    type: "COUNT",
    tier: "GOLD",
    targetValue: 50,
    targetUnit: "\uC138\uC158",
    xpReward: 2e3,
    badgeColor: "#FFD700",
    sortOrder: 3
  },
  {
    achievementKey: "streak_7",
    title: "\uC77C\uC8FC\uC77C \uC5F0\uC18D",
    description: "7\uC77C \uC5F0\uC18D\uC73C\uB85C \uC138\uC158\uC5D0 \uCC38\uC5EC\uD588\uC2B5\uB2C8\uB2E4!",
    category: "ENGAGEMENT",
    type: "STREAK",
    tier: "SILVER",
    targetValue: 7,
    targetUnit: "\uC77C",
    xpReward: 750,
    badgeColor: "#C0C0C0",
    sortOrder: 4
  },
  {
    achievementKey: "streak_30",
    title: "\uD55C \uB2EC \uC5F0\uC18D",
    description: "30\uC77C \uC5F0\uC18D\uC73C\uB85C \uC138\uC158\uC5D0 \uCC38\uC5EC\uD588\uC2B5\uB2C8\uB2E4!",
    category: "ENGAGEMENT",
    type: "STREAK",
    tier: "GOLD",
    targetValue: 30,
    targetUnit: "\uC77C",
    xpReward: 3e3,
    badgeColor: "#FFD700",
    sortOrder: 5
  },
  {
    achievementKey: "first_friend",
    title: "\uCCAB \uCE5C\uAD6C",
    description: "\uCCAB \uBC88\uC9F8 \uD559\uC2B5 \uCE5C\uAD6C\uB97C \uB9CC\uB4E4\uC5C8\uC2B5\uB2C8\uB2E4!",
    category: "SOCIAL",
    type: "COUNT",
    tier: "BRONZE",
    targetValue: 1,
    targetUnit: "\uCE5C\uAD6C",
    xpReward: 200,
    badgeColor: "#CD7F32",
    sortOrder: 6
  },
  {
    achievementKey: "friends_5",
    title: "\uC778\uAE30\uC7C1\uC774",
    description: "5\uBA85\uC758 \uD559\uC2B5 \uCE5C\uAD6C\uB97C \uB9CC\uB4E4\uC5C8\uC2B5\uB2C8\uB2E4!",
    category: "SOCIAL",
    type: "COUNT",
    tier: "SILVER",
    targetValue: 5,
    targetUnit: "\uCE5C\uAD6C",
    xpReward: 1e3,
    badgeColor: "#C0C0C0",
    sortOrder: 7
  },
  {
    achievementKey: "study_hours_10",
    title: "10\uC2DC\uAC04 \uB2EC\uC131",
    description: "\uCD1D 10\uC2DC\uAC04\uC758 \uD559\uC2B5\uC744 \uC644\uB8CC\uD588\uC2B5\uB2C8\uB2E4!",
    category: "TIME",
    type: "ACCUMULATE",
    tier: "BRONZE",
    targetValue: 600,
    targetUnit: "\uBD84",
    xpReward: 500,
    badgeColor: "#CD7F32",
    sortOrder: 8
  },
  {
    achievementKey: "study_hours_50",
    title: "50\uC2DC\uAC04 \uB2EC\uC131",
    description: "\uCD1D 50\uC2DC\uAC04\uC758 \uD559\uC2B5\uC744 \uC644\uB8CC\uD588\uC2B5\uB2C8\uB2E4!",
    category: "TIME",
    type: "ACCUMULATE",
    tier: "SILVER",
    targetValue: 3e3,
    targetUnit: "\uBD84",
    xpReward: 2500,
    badgeColor: "#C0C0C0",
    sortOrder: 9
  },
  {
    achievementKey: "study_hours_100",
    title: "100\uC2DC\uAC04 \uB2EC\uC131",
    description: "\uCD1D 100\uC2DC\uAC04\uC758 \uD559\uC2B5\uC744 \uC644\uB8CC\uD588\uC2B5\uB2C8\uB2E4!",
    category: "TIME",
    type: "ACCUMULATE",
    tier: "GOLD",
    targetValue: 6e3,
    targetUnit: "\uBD84",
    xpReward: 5e3,
    badgeColor: "#FFD700",
    sortOrder: 10
  },
  {
    achievementKey: "level_up_first",
    title: "\uCCAB \uB808\uBCA8\uC5C5",
    description: "\uCC98\uC74C\uC73C\uB85C \uB808\uBCA8\uC774 \uC62C\uB790\uC2B5\uB2C8\uB2E4!",
    category: "SKILL",
    type: "THRESHOLD",
    tier: "BRONZE",
    targetValue: 2,
    targetUnit: "\uB808\uBCA8",
    xpReward: 300,
    badgeColor: "#CD7F32",
    sortOrder: 11
  },
  {
    achievementKey: "level_5",
    title: "\uC911\uAE09\uC790",
    description: "\uB808\uBCA8 5\uC5D0 \uB3C4\uB2EC\uD588\uC2B5\uB2C8\uB2E4!",
    category: "SKILL",
    type: "THRESHOLD",
    tier: "SILVER",
    targetValue: 5,
    targetUnit: "\uB808\uBCA8",
    xpReward: 1500,
    badgeColor: "#C0C0C0",
    sortOrder: 12
  },
  {
    achievementKey: "level_10",
    title: "\uACE0\uAE09\uC790",
    description: "\uB808\uBCA8 10\uC5D0 \uB3C4\uB2EC\uD588\uC2B5\uB2C8\uB2E4!",
    category: "SKILL",
    type: "THRESHOLD",
    tier: "GOLD",
    targetValue: 10,
    targetUnit: "\uB808\uBCA8",
    xpReward: 5e3,
    badgeColor: "#FFD700",
    sortOrder: 13
  },
  {
    achievementKey: "early_adopter",
    title: "\uC5BC\uB9AC \uC5B4\uB2F5\uD130",
    description: "\uC11C\uBE44\uC2A4 \uC624\uD508 \uCCAB \uB2EC\uC5D0 \uAC00\uC785\uD588\uC2B5\uB2C8\uB2E4!",
    category: "SPECIAL",
    type: "MILESTONE",
    tier: "LEGENDARY",
    xpReward: 1e3,
    badgeColor: "#9932CC",
    isHidden: true,
    sortOrder: 14
  },
  {
    achievementKey: "perfect_week",
    title: "\uC644\uBCBD\uD55C \uD55C \uC8FC",
    description: "\uC77C\uC8FC\uC77C \uB3D9\uC548 \uB9E4\uC77C \uC138\uC158\uC5D0 \uCC38\uC5EC\uD588\uC2B5\uB2C8\uB2E4!",
    category: "ENGAGEMENT",
    type: "COMBINATION",
    tier: "PLATINUM",
    targetValue: 7,
    targetUnit: "\uC77C",
    xpReward: 2e3,
    badgeColor: "#E5E4E2",
    sortOrder: 15
  }
];
function toBoolean(value) {
  return value === 1 || value === true;
}
__name(toBoolean, "toBoolean");
function aliasCategory(original) {
  if (!original) return "GENERAL";
  return CATEGORY_ALIAS[original] ?? original;
}
__name(aliasCategory, "aliasCategory");
function mapAchievementRow(row) {
  return {
    id: row.achievement_id,
    achievementKey: row.achievement_key,
    title: row.title,
    description: row.description ?? void 0,
    category: aliasCategory(row.category),
    originalCategory: row.category,
    type: row.type,
    tier: row.tier,
    targetValue: row.target_value ?? void 0,
    targetUnit: row.target_unit ?? void 0,
    xpReward: row.xp_reward ?? void 0,
    badgeIconUrl: row.badge_icon_url ?? void 0,
    badgeColor: row.badge_color ?? void 0,
    isActive: toBoolean(row.is_active),
    isHidden: toBoolean(row.is_hidden),
    sortOrder: row.sort_order ?? void 0,
    prerequisiteAchievementId: row.prerequisite_achievement_id ?? void 0
  };
}
__name(mapAchievementRow, "mapAchievementRow");
function mapUserAchievementRow(row) {
  const achievement = mapAchievementRow({
    achievement_id: row.achievement_id,
    achievement_key: row.achievement_key,
    title: row.title,
    description: row.description,
    category: row.category,
    type: row.type,
    tier: row.tier,
    target_value: row.target_value,
    target_unit: row.target_unit,
    xp_reward: row.xp_reward,
    badge_icon_url: row.badge_icon_url,
    badge_color: row.badge_color,
    is_active: row.is_active,
    is_hidden: row.is_hidden,
    sort_order: row.sort_order,
    prerequisite_achievement_id: row.prerequisite_achievement_id,
    created_at: "",
    updated_at: ""
  });
  const targetValue = row.target_value ?? 0;
  const current = row.current_progress ?? 0;
  const progressPercentage = targetValue > 0 ? Math.min(100, current / targetValue * 100) : toBoolean(row.is_completed) ? 100 : 0;
  return {
    id: row.user_achievement_id,
    achievement,
    currentProgress: current,
    isCompleted: toBoolean(row.is_completed),
    completedAt: row.completed_at ?? void 0,
    isRewardClaimed: toBoolean(row.is_reward_claimed),
    rewardClaimedAt: row.reward_claimed_at ?? void 0,
    progressPercentage
  };
}
__name(mapUserAchievementRow, "mapUserAchievementRow");
async function seedDefaultAchievements(env2) {
  const countRow = await queryFirst(
    env2.DB,
    "SELECT COUNT(*) as count FROM achievements"
  );
  if ((countRow?.count ?? 0) > 0) {
    return;
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await transaction(
    env2.DB,
    DEFAULT_ACHIEVEMENTS.map((item) => ({
      sql: `INSERT INTO achievements (
              achievement_key,
              title,
              description,
              category,
              type,
              tier,
              target_value,
              target_unit,
              xp_reward,
              badge_icon_url,
              badge_color,
              is_active,
              is_hidden,
              sort_order,
              created_at,
              updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, 1, ?, ?, ?, ?)`,
      params: [
        item.achievementKey,
        item.title,
        item.description ?? null,
        item.category,
        item.type,
        item.tier,
        item.targetValue ?? null,
        item.targetUnit ?? null,
        item.xpReward ?? null,
        item.badgeColor ?? null,
        item.isHidden ? 1 : 0,
        item.sortOrder ?? null,
        now,
        now
      ]
    }))
  );
}
__name(seedDefaultAchievements, "seedDefaultAchievements");
async function fetchAchievementByKey(env2, achievementKey) {
  const row = await queryFirst(
    env2.DB,
    "SELECT * FROM achievements WHERE achievement_key = ? AND is_active = 1 LIMIT 1",
    [achievementKey]
  );
  if (!row) {
    throw new AppError("\uC874\uC7AC\uD558\uC9C0 \uC54A\uB294 \uC5C5\uC801\uC785\uB2C8\uB2E4.", 404, "ACHIEVEMENT_NOT_FOUND");
  }
  return row;
}
__name(fetchAchievementByKey, "fetchAchievementByKey");
async function ensureUserAchievement(env2, userId, achievementId) {
  const existing = await queryFirst(
    env2.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ? AND ua.achievement_id = ?
      LIMIT 1`,
    [userId, achievementId]
  );
  if (existing) {
    return existing;
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await execute(
    env2.DB,
    `INSERT INTO user_achievements (
        user_id,
        achievement_id,
        current_progress,
        is_completed,
        completed_at,
        is_reward_claimed,
        reward_claimed_at,
        created_at,
        updated_at
      ) VALUES (?, ?, 0, 0, NULL, 0, NULL, ?, ?)`,
    [userId, achievementId, now, now]
  );
  const inserted = await queryFirst(
    env2.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ? AND ua.achievement_id = ?
      LIMIT 1`,
    [userId, achievementId]
  );
  if (!inserted) {
    throw new AppError("\uC5C5\uC801 \uC815\uBCF4\uB97C \uCD08\uAE30\uD654\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", 500, "ACHIEVEMENT_INIT_FAILED");
  }
  return inserted;
}
__name(ensureUserAchievement, "ensureUserAchievement");
async function updateUserAchievementProgress(env2, userId, achievement, progress, incrementMode) {
  const targetValue = achievement.target_value ?? void 0;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const row = await ensureUserAchievement(env2, userId, achievement.achievement_id);
  const current = incrementMode ? Math.max(0, (row.current_progress ?? 0) + progress) : Math.max(0, progress);
  let isCompleted = row.is_completed;
  let completedAt = row.completed_at;
  if (typeof targetValue === "number" && current >= targetValue && !toBoolean(row.is_completed)) {
    isCompleted = 1;
    completedAt = now;
  }
  await execute(
    env2.DB,
    `UPDATE user_achievements
        SET current_progress = ?,
            is_completed = ?,
            completed_at = ?,
            updated_at = ?
      WHERE user_id = ? AND achievement_id = ?`,
    [current, isCompleted, completedAt, now, userId, achievement.achievement_id]
  );
  const updated = await queryFirst(
    env2.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ? AND ua.achievement_id = ?
      LIMIT 1`,
    [userId, achievement.achievement_id]
  );
  if (!updated) {
    throw new AppError("\uC5C5\uC801 \uC9C4\uD589\uB3C4\uB97C \uAC31\uC2E0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", 500, "ACHIEVEMENT_UPDATE_FAILED");
  }
  return updated;
}
__name(updateUserAchievementProgress, "updateUserAchievementProgress");
async function getAllAchievements(env2) {
  await seedDefaultAchievements(env2);
  const rows = await query(
    env2.DB,
    `SELECT * FROM achievements
      WHERE is_active = 1
      ORDER BY COALESCE(sort_order, 9999), title`
  );
  return rows.map(mapAchievementRow);
}
__name(getAllAchievements, "getAllAchievements");
async function getAchievementsByCategory(env2, category) {
  await seedDefaultAchievements(env2);
  const normalized = category.toUpperCase();
  const rows = await query(
    env2.DB,
    `SELECT * FROM achievements
      WHERE is_active = 1 AND UPPER(category) = ?
      ORDER BY COALESCE(sort_order, 9999), title`,
    [normalized]
  );
  return rows.map(mapAchievementRow);
}
__name(getAchievementsByCategory, "getAchievementsByCategory");
async function getUserAchievements(env2, userId) {
  await seedDefaultAchievements(env2);
  const rows = await query(
    env2.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ?
      ORDER BY ua.is_completed DESC, ua.completed_at DESC, COALESCE(a.sort_order, 9999)`,
    [userId]
  );
  return rows.map(mapUserAchievementRow);
}
__name(getUserAchievements, "getUserAchievements");
async function getCompletedAchievements(env2, userId) {
  const rows = await query(
    env2.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ? AND ua.is_completed = 1
      ORDER BY ua.completed_at DESC`,
    [userId]
  );
  return rows.map(mapUserAchievementRow);
}
__name(getCompletedAchievements, "getCompletedAchievements");
async function getInProgressAchievements(env2, userId) {
  const rows = await query(
    env2.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ? AND ua.is_completed = 0
      ORDER BY ua.current_progress DESC, COALESCE(a.sort_order, 9999)`,
    [userId]
  );
  return rows.map(mapUserAchievementRow);
}
__name(getInProgressAchievements, "getInProgressAchievements");
async function getAchievementStats(env2, userId) {
  await seedDefaultAchievements(env2);
  const [totalRow, completedRow, inProgressRow, totalXpRow, unclaimedRow] = await Promise.all([
    queryFirst(env2.DB, "SELECT COUNT(*) as count FROM achievements WHERE is_active = 1"),
    queryFirst(
      env2.DB,
      "SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ? AND is_completed = 1",
      [userId]
    ),
    queryFirst(
      env2.DB,
      "SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ? AND is_completed = 0 AND current_progress > 0",
      [userId]
    ),
    queryFirst(
      env2.DB,
      `SELECT COALESCE(SUM(a.xp_reward), 0) as total
         FROM user_achievements ua
         JOIN achievements a ON a.achievement_id = ua.achievement_id
        WHERE ua.user_id = ? AND ua.is_reward_claimed = 1`,
      [userId]
    ),
    queryFirst(
      env2.DB,
      "SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ? AND is_completed = 1 AND is_reward_claimed = 0",
      [userId]
    )
  ]);
  const achievementsByCategoryRows = await query(
    env2.DB,
    `SELECT a.category as key, COUNT(*) as count
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ? AND ua.is_completed = 1
      GROUP BY a.category`,
    [userId]
  );
  const achievementsByTierRows = await query(
    env2.DB,
    `SELECT a.tier as key, COUNT(*) as count
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ? AND ua.is_completed = 1
      GROUP BY a.tier`,
    [userId]
  );
  const recentRows = await query(
    env2.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ? AND ua.is_completed = 1
      ORDER BY ua.completed_at DESC
      LIMIT 5`,
    [userId]
  );
  const nearCompletionRows = await query(
    env2.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ?
        AND ua.is_completed = 0
        AND a.target_value IS NOT NULL
        AND a.target_value > 0
        AND (ua.current_progress * 100.0 / a.target_value) >= 80
      ORDER BY (ua.current_progress * 100.0 / a.target_value) DESC
      LIMIT 5`,
    [userId]
  );
  const totalAchievements = totalRow?.count ?? 0;
  const completedAchievements = completedRow?.count ?? 0;
  const completionRate = totalAchievements > 0 ? completedAchievements / totalAchievements * 100 : 0;
  const achievementsByCategory = {};
  for (const row of achievementsByCategoryRows) {
    achievementsByCategory[aliasCategory(row.key)] = row.count;
  }
  const achievementsByTier = {};
  for (const row of achievementsByTierRows) {
    achievementsByTier[row.key ?? "UNKNOWN"] = row.count;
  }
  return {
    totalAchievements,
    completedAchievements,
    inProgressAchievements: inProgressRow?.count ?? 0,
    totalXpEarned: totalXpRow?.total ?? 0,
    unclaimedRewards: unclaimedRow?.count ?? 0,
    completionRate,
    achievementsByCategory,
    achievementsByTier,
    recentCompletions: recentRows.map(mapUserAchievementRow),
    nearCompletion: nearCompletionRows.map(mapUserAchievementRow)
  };
}
__name(getAchievementStats, "getAchievementStats");
async function updateAchievementProgress(env2, userId, achievementKey, progress) {
  if (!achievementKey) {
    throw new AppError("achievementKey\uB294 \uD544\uC218\uC785\uB2C8\uB2E4.", 400, "INVALID_ACHIEVEMENT_KEY");
  }
  if (!Number.isFinite(progress) || progress < 0) {
    throw new AppError("progress\uB294 0 \uC774\uC0C1\uC758 \uC22B\uC790\uC5EC\uC57C \uD569\uB2C8\uB2E4.", 400, "INVALID_PROGRESS");
  }
  const achievement = await fetchAchievementByKey(env2, achievementKey);
  const updated = await updateUserAchievementProgress(env2, userId, achievement, progress, false);
  return mapUserAchievementRow(updated);
}
__name(updateAchievementProgress, "updateAchievementProgress");
async function incrementAchievementProgress(env2, userId, achievementKey, increment) {
  if (!achievementKey) {
    throw new AppError("achievementKey\uB294 \uD544\uC218\uC785\uB2C8\uB2E4.", 400, "INVALID_ACHIEVEMENT_KEY");
  }
  if (!Number.isFinite(increment) || increment <= 0) {
    throw new AppError("increment\uB294 1 \uC774\uC0C1\uC758 \uC22B\uC790\uC5EC\uC57C \uD569\uB2C8\uB2E4.", 400, "INVALID_INCREMENT");
  }
  const achievement = await fetchAchievementByKey(env2, achievementKey);
  const updated = await updateUserAchievementProgress(env2, userId, achievement, increment, true);
  return mapUserAchievementRow(updated);
}
__name(incrementAchievementProgress, "incrementAchievementProgress");
async function claimAchievementReward(env2, userId, userAchievementId) {
  const row = await queryFirst(
    env2.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_achievement_id = ?
      LIMIT 1`,
    [userAchievementId]
  );
  if (!row) {
    throw new AppError("\uC874\uC7AC\uD558\uC9C0 \uC54A\uB294 \uC0AC\uC6A9\uC790 \uC5C5\uC801\uC785\uB2C8\uB2E4.", 404, "USER_ACHIEVEMENT_NOT_FOUND");
  }
  if (row.user_id !== userId) {
    throw new AppError("\uBCF8\uC778\uC758 \uC5C5\uC801\uB9CC \uBCF4\uC0C1\uC744 \uBC1B\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.", 403, "FORBIDDEN");
  }
  if (!toBoolean(row.is_completed)) {
    throw new AppError("\uC644\uB8CC\uB418\uC9C0 \uC54A\uC740 \uC5C5\uC801\uC785\uB2C8\uB2E4.", 400, "ACHIEVEMENT_NOT_COMPLETED");
  }
  if (toBoolean(row.is_reward_claimed)) {
    throw new AppError("\uC774\uBBF8 \uBCF4\uC0C1\uC744 \uC218\uB839\uD588\uC2B5\uB2C8\uB2E4.", 400, "ACHIEVEMENT_REWARD_ALREADY_CLAIMED");
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await execute(
    env2.DB,
    `UPDATE user_achievements
        SET is_reward_claimed = 1,
            reward_claimed_at = ?,
            updated_at = ?
      WHERE user_achievement_id = ?`,
    [now, now, userAchievementId]
  );
  const updated = await queryFirst(
    env2.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_achievement_id = ?
      LIMIT 1`,
    [userAchievementId]
  );
  if (!updated) {
    throw new AppError("\uC5C5\uC801 \uBCF4\uC0C1 \uC815\uBCF4\uB97C \uAC31\uC2E0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", 500, "ACHIEVEMENT_REWARD_FAILED");
  }
  return mapUserAchievementRow(updated);
}
__name(claimAchievementReward, "claimAchievementReward");
async function initializeUserAchievements(env2, userId) {
  await seedDefaultAchievements(env2);
  const achievementIds = await query(
    env2.DB,
    "SELECT achievement_id FROM achievements WHERE is_active = 1"
  );
  const statements = achievementIds.map(({ achievement_id }) => ({
    sql: `INSERT OR IGNORE INTO user_achievements (
            user_id,
            achievement_id,
            current_progress,
            is_completed,
            completed_at,
            is_reward_claimed,
            reward_claimed_at,
            created_at,
            updated_at
          ) VALUES (?, ?, 0, 0, NULL, 0, NULL, ?, ?)`,
    params: [userId, achievement_id, (/* @__PURE__ */ new Date()).toISOString(), (/* @__PURE__ */ new Date()).toISOString()]
  }));
  if (statements.length) {
    await transaction(env2.DB, statements);
  }
}
__name(initializeUserAchievements, "initializeUserAchievements");
async function checkAndCompleteAchievements(env2, userId) {
  await seedDefaultAchievements(env2);
  const candidates = await query(
    env2.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ? AND ua.is_completed = 0
      ORDER BY ua.current_progress DESC`,
    [userId]
  );
  const completed = [];
  const now = (/* @__PURE__ */ new Date()).toISOString();
  for (const candidate of candidates) {
    const targetValue = candidate.target_value ?? null;
    if (typeof targetValue !== "number" || candidate.current_progress < targetValue) {
      continue;
    }
    if (candidate.prerequisite_achievement_id) {
      const prereq = await queryFirst(
        env2.DB,
        `SELECT is_completed FROM user_achievements
          WHERE user_id = ? AND achievement_id = ?
          LIMIT 1`,
        [userId, candidate.prerequisite_achievement_id]
      );
      if (!prereq || !toBoolean(prereq.is_completed)) {
        continue;
      }
    }
    await execute(
      env2.DB,
      `UPDATE user_achievements
          SET is_completed = 1,
              completed_at = COALESCE(completed_at, ?),
              updated_at = ?
        WHERE user_achievement_id = ?`,
      [now, now, candidate.user_achievement_id]
    );
    const updated = await queryFirst(
      env2.DB,
      `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
              a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
              a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
         FROM user_achievements ua
         JOIN achievements a ON a.achievement_id = ua.achievement_id
        WHERE ua.user_achievement_id = ?
        LIMIT 1`,
      [candidate.user_achievement_id]
    );
    if (updated) {
      completed.push(mapUserAchievementRow(updated));
    }
  }
  return completed;
}
__name(checkAndCompleteAchievements, "checkAndCompleteAchievements");

// src/routes/achievements.ts
var achievementsRoutes = new Hono2();
var requireAuth9 = auth();
function requireUserId2(userId) {
  if (!userId) {
    throw new AppError("\uC778\uC99D \uC815\uBCF4\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.", 401, "UNAUTHORIZED");
  }
  return userId;
}
__name(requireUserId2, "requireUserId");
achievementsRoutes.use("*", requireAuth9);
achievementsRoutes.get("/", async (c) => {
  const achievements = await getAllAchievements(c.env);
  return successResponse(c, achievements);
});
achievementsRoutes.get("/category/:category", async (c) => {
  const category = c.req.param("category");
  if (!category) {
    throw new AppError("\uCE74\uD14C\uACE0\uB9AC\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.", 400, "INVALID_CATEGORY");
  }
  const achievements = await getAchievementsByCategory(c.env, category);
  return successResponse(c, achievements);
});
achievementsRoutes.get("/my", async (c) => {
  const userId = requireUserId2(c.get("userId"));
  await initializeUserAchievements(c.env, userId);
  const achievements = await getUserAchievements(c.env, userId);
  return successResponse(c, achievements);
});
achievementsRoutes.get("/my/completed", async (c) => {
  const userId = requireUserId2(c.get("userId"));
  const achievements = await getCompletedAchievements(c.env, userId);
  return successResponse(c, achievements);
});
achievementsRoutes.get("/my/in-progress", async (c) => {
  const userId = requireUserId2(c.get("userId"));
  const achievements = await getInProgressAchievements(c.env, userId);
  return successResponse(c, achievements);
});
achievementsRoutes.get("/my/stats", async (c) => {
  const userId = requireUserId2(c.get("userId"));
  await initializeUserAchievements(c.env, userId);
  const stats = await getAchievementStats(c.env, userId);
  return successResponse(c, stats);
});
achievementsRoutes.post("/progress", async (c) => {
  const userId = requireUserId2(c.get("userId"));
  const body = await c.req.json().catch(() => ({}));
  const achievementKey = typeof body?.achievementKey === "string" ? body.achievementKey.trim() : "";
  const progress = typeof body?.progress === "number" ? body.progress : Number(body?.progress);
  if (!achievementKey) {
    throw new AppError("achievementKey\uB294 \uD544\uC218\uC785\uB2C8\uB2E4.", 400, "INVALID_ACHIEVEMENT_KEY");
  }
  if (!Number.isFinite(progress)) {
    throw new AppError("progress\uB294 \uC22B\uC790\uC5EC\uC57C \uD569\uB2C8\uB2E4.", 400, "INVALID_PROGRESS");
  }
  const updated = await updateAchievementProgress(c.env, userId, achievementKey, progress);
  return successResponse(c, updated);
});
achievementsRoutes.post("/progress/increment", async (c) => {
  const userId = requireUserId2(c.get("userId"));
  const achievementKey = (c.req.query("achievementKey") || "").trim();
  const incrementRaw = c.req.query("increment");
  const increment = incrementRaw ? Number(incrementRaw) : 1;
  if (!achievementKey) {
    throw new AppError("achievementKey\uB294 \uD544\uC218\uC785\uB2C8\uB2E4.", 400, "INVALID_ACHIEVEMENT_KEY");
  }
  if (!Number.isFinite(increment)) {
    throw new AppError("increment\uB294 \uC22B\uC790\uC5EC\uC57C \uD569\uB2C8\uB2E4.", 400, "INVALID_INCREMENT");
  }
  const updated = await incrementAchievementProgress(c.env, userId, achievementKey, increment);
  return successResponse(c, updated);
});
achievementsRoutes.post("/:userAchievementId/claim-reward", async (c) => {
  const userId = requireUserId2(c.get("userId"));
  const idRaw = c.req.param("userAchievementId");
  const userAchievementId = Number(idRaw);
  if (!Number.isFinite(userAchievementId)) {
    throw new AppError("userAchievementId\uAC00 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.", 400, "INVALID_PATH_PARAM");
  }
  const result = await claimAchievementReward(c.env, userId, userAchievementId);
  return successResponse(c, result);
});
achievementsRoutes.post("/initialize", async (c) => {
  const userId = requireUserId2(c.get("userId"));
  await initializeUserAchievements(c.env, userId);
  return successResponse(c, { initialized: true });
});
achievementsRoutes.post("/check-completion", async (c) => {
  const userId = requireUserId2(c.get("userId"));
  const completed = await checkAndCompleteAchievements(c.env, userId);
  return successResponse(c, completed);
});
var achievements_default = achievementsRoutes;

// src/routes/chat.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_errors();

// src/services/chat.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
init_errors();
function nowIso5() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(nowIso5, "nowIso");
function toBoolean2(value) {
  return value === 1 || value === true;
}
__name(toBoolean2, "toBoolean");
function mapParticipant(row) {
  return {
    userId: row.user_id,
    name: row.name ?? void 0,
    profileImage: row.profile_image ?? void 0
  };
}
__name(mapParticipant, "mapParticipant");
async function fetchParticipants2(env2, roomId) {
  const rows = await query(
    env2.DB,
    `SELECT p.room_id, p.user_id, p.joined_at, u.name, u.profile_image
       FROM chat_room_participant p
       LEFT JOIN users u ON u.user_id = p.user_id
      WHERE p.room_id = ?
      ORDER BY p.joined_at ASC`,
    [roomId]
  );
  return rows.map(mapParticipant);
}
__name(fetchParticipants2, "fetchParticipants");
function computeMessageType(row, images, files) {
  const hasText = Boolean(row.message && row.message.trim().length > 0);
  const hasImages = images.length > 0;
  const hasAudio = Boolean(row.audio_url);
  const hasFiles = files.length > 0;
  if (hasAudio && !hasImages && !hasText && !hasFiles) return "AUDIO";
  if (hasImages && !hasAudio && !hasText && !hasFiles) return "IMAGE";
  if (hasFiles && !hasAudio && !hasImages && !hasText) return "FILE";
  if (hasText && !hasAudio && !hasImages && !hasFiles) return "TEXT";
  return "MIXED";
}
__name(computeMessageType, "computeMessageType");
function mapFile(row) {
  return {
    fileId: row.file_id,
    originalFilename: row.original_filename,
    fileUrl: row.file_url ?? `/api/v1/upload/file/${row.file_path}`,
    fileType: row.file_type,
    contentType: row.content_type ?? void 0,
    fileSize: row.file_size ?? void 0,
    thumbnailUrl: row.thumbnail_url ?? void 0,
    duration: row.duration ?? void 0,
    createdAt: row.created_at
  };
}
__name(mapFile, "mapFile");
function mapMessage(row, images, files) {
  const participant = {
    userId: row.user_id,
    name: row.name ?? void 0,
    profileImage: row.profile_image ?? void 0
  };
  return {
    messageId: row.message_id,
    roomId: row.room_id,
    sender: participant,
    message: row.message ?? void 0,
    imageUrls: images.map((img) => img.image_url),
    audioUrl: row.audio_url ?? void 0,
    audioDuration: void 0,
    files,
    messageType: computeMessageType(row, images, files),
    sentAt: row.created_at
  };
}
__name(mapMessage, "mapMessage");
async function ensureRoomExists(env2, roomId) {
  const row = await queryFirst(
    env2.DB,
    "SELECT * FROM chat_room WHERE room_id = ? LIMIT 1",
    [roomId]
  );
  if (!row) {
    throw new AppError("\uCC44\uD305\uBC29\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", 404, "CHAT_ROOM_NOT_FOUND");
  }
  return row;
}
__name(ensureRoomExists, "ensureRoomExists");
async function mapRoom(env2, room) {
  const participants = await fetchParticipants2(env2, room.room_id);
  const lastMessageRow = await queryFirst(
    env2.DB,
    `SELECT m.message, m.created_at
       FROM chat_message m
      WHERE m.room_id = ?
      ORDER BY m.created_at DESC
      LIMIT 1`,
    [room.room_id]
  );
  return {
    roomId: room.room_id,
    roomName: room.room_name,
    roomType: room.room_type,
    isPublic: toBoolean2(room.is_public),
    maxParticipants: room.max_participants ?? void 0,
    participants,
    lastMessage: lastMessageRow?.message ?? void 0,
    lastMessageAt: lastMessageRow?.created_at ?? void 0
  };
}
__name(mapRoom, "mapRoom");
async function listUserChatRooms(env2, userId) {
  const rows = await query(
    env2.DB,
    `SELECT r.*
       FROM chat_room r
       JOIN chat_room_participant p ON p.room_id = r.room_id
      WHERE p.user_id = ?
      ORDER BY r.updated_at DESC, r.created_at DESC`,
    [userId]
  );
  const summaries = [];
  for (const row of rows) {
    summaries.push(await mapRoom(env2, row));
  }
  return summaries;
}
__name(listUserChatRooms, "listUserChatRooms");
async function listPublicChatRooms(env2, userId) {
  const rows = await query(
    env2.DB,
    `SELECT r.*
       FROM chat_room r
      WHERE r.is_public = 1
        AND r.room_id NOT IN (SELECT room_id FROM chat_room_participant WHERE user_id = ?)
      ORDER BY r.created_at DESC`,
    [userId]
  );
  const summaries = [];
  for (const row of rows) {
    summaries.push(await mapRoom(env2, row));
  }
  return summaries;
}
__name(listPublicChatRooms, "listPublicChatRooms");
async function createChatRoom(env2, creatorId, roomName, participantIds = [], options) {
  if (!roomName?.trim()) {
    throw new AppError("\uCC44\uD305\uBC29 \uC774\uB984\uC740 \uD544\uC218\uC785\uB2C8\uB2E4.", 400, "INVALID_ROOM_NAME");
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const isPublic = options?.isPublic ? 1 : 0;
  const roomType = options?.roomType ?? "GROUP";
  const maxParticipants = options?.maxParticipants ?? null;
  await execute(
    env2.DB,
    `INSERT INTO chat_room (room_name, room_type, is_public, max_participants, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)`,
    [roomName.trim(), roomType, isPublic, maxParticipants, now, now]
  );
  const roomIdRow = await queryFirst(env2.DB, "SELECT last_insert_rowid() as id");
  const roomId = Number(roomIdRow?.id ?? 0);
  if (!roomId) {
    throw new AppError("\uCC44\uD305\uBC29\uC744 \uC0DD\uC131\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", 500, "CHAT_ROOM_CREATE_FAILED");
  }
  const uniqueIds = /* @__PURE__ */ new Set([creatorId, ...participantIds]);
  const statements = Array.from(uniqueIds).map((id) => ({
    sql: `INSERT OR IGNORE INTO chat_room_participant (room_id, user_id, joined_at)
            VALUES (?, ?, ?)`,
    params: [roomId, id, now]
  }));
  await transaction(env2.DB, statements);
  const room = await ensureRoomExists(env2, roomId);
  return mapRoom(env2, room);
}
__name(createChatRoom, "createChatRoom");
async function joinChatRoom(env2, roomId, userId) {
  const room = await ensureRoomExists(env2, roomId);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await execute(
    env2.DB,
    `INSERT OR IGNORE INTO chat_room_participant (room_id, user_id, joined_at)
      VALUES (?, ?, ?)`,
    [roomId, userId, now]
  );
  return mapRoom(env2, room);
}
__name(joinChatRoom, "joinChatRoom");
async function leaveChatRoom(env2, roomId, userId) {
  await ensureRoomExists(env2, roomId);
  await execute(
    env2.DB,
    "DELETE FROM chat_room_participant WHERE room_id = ? AND user_id = ?",
    [roomId, userId]
  );
}
__name(leaveChatRoom, "leaveChatRoom");
async function listRoomMessages(env2, roomId, page, size) {
  await ensureRoomExists(env2, roomId);
  const offset = Math.max(page, 0) * size;
  const messageRows = await query(
    env2.DB,
    `SELECT m.*, u.name, u.profile_image
       FROM chat_message m
       LEFT JOIN users u ON u.user_id = m.user_id
      WHERE m.room_id = ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?`,
    [roomId, size, offset]
  );
  const messageIds = messageRows.map((row) => row.message_id);
  if (messageIds.length === 0) {
    return [];
  }
  const imageRows = await query(
    env2.DB,
    `SELECT message_id, image_url
       FROM chat_image
      WHERE message_id IN (${messageIds.map(() => "?").join(",")})`,
    messageIds
  );
  const fileRows = await query(
    env2.DB,
    `SELECT f.*
       FROM chat_files f
      WHERE f.message_id IN (${messageIds.map(() => "?").join(",")})
        AND f.is_deleted = 0`,
    messageIds
  );
  const imageMap = /* @__PURE__ */ new Map();
  for (const img of imageRows) {
    const list = imageMap.get(img.message_id) ?? [];
    list.push(img);
    imageMap.set(img.message_id, list);
  }
  const fileMap = /* @__PURE__ */ new Map();
  for (const file of fileRows) {
    const mapped = mapFile(file);
    const list = fileMap.get(file.message_id) ?? [];
    list.push(mapped);
    fileMap.set(file.message_id, list);
  }
  const messages = messageRows.map((row) => {
    const images = imageMap.get(row.message_id) ?? [];
    const files = fileMap.get(row.message_id) ?? [];
    return mapMessage(row, images, files);
  }).reverse();
  return messages;
}
__name(listRoomMessages, "listRoomMessages");
async function searchRoomMessages(env2, roomId, keyword, page, size) {
  await ensureRoomExists(env2, roomId);
  if (!keyword?.trim()) {
    return [];
  }
  const offset = Math.max(page, 0) * size;
  const messageRows = await query(
    env2.DB,
    `SELECT m.*, u.name, u.profile_image
       FROM chat_message m
       LEFT JOIN users u ON u.user_id = m.user_id
      WHERE m.room_id = ? AND m.message LIKE ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?`,
    [roomId, `%${keyword}%`, size, offset]
  );
  const messageIds = messageRows.map((row) => row.message_id);
  if (messageIds.length === 0) {
    return [];
  }
  const imageRows = await query(
    env2.DB,
    `SELECT message_id, image_url
       FROM chat_image
      WHERE message_id IN (${messageIds.map(() => "?").join(",")})`,
    messageIds
  );
  const fileRows = await query(
    env2.DB,
    `SELECT f.*
       FROM chat_files f
      WHERE f.message_id IN (${messageIds.map(() => "?").join(",")})
        AND f.is_deleted = 0`,
    messageIds
  );
  const imageMap = /* @__PURE__ */ new Map();
  for (const img of imageRows) {
    const list = imageMap.get(img.message_id) ?? [];
    list.push(img);
    imageMap.set(img.message_id, list);
  }
  const fileMap = /* @__PURE__ */ new Map();
  for (const file of fileRows) {
    const mapped = mapFile(file);
    const list = fileMap.get(file.message_id) ?? [];
    list.push(mapped);
    fileMap.set(file.message_id, list);
  }
  return messageRows.map((row) => mapMessage(row, imageMap.get(row.message_id) ?? [], fileMap.get(row.message_id) ?? [])).reverse();
}
__name(searchRoomMessages, "searchRoomMessages");
async function uploadChatImages(env2, roomId, userId, files) {
  await ensureRoomExists(env2, roomId);
  const participant = await queryFirst(
    env2.DB,
    "SELECT 1 FROM chat_room_participant WHERE room_id = ? AND user_id = ? LIMIT 1",
    [roomId, userId]
  );
  if (!participant) {
    throw new AppError("\uCC44\uD305\uBC29\uC5D0 \uCC38\uC5EC\uD558\uC9C0 \uC54A\uC740 \uC0AC\uC6A9\uC790\uC785\uB2C8\uB2E4.", 403, "CHAT_ROOM_FORBIDDEN");
  }
  if (!files.length) {
    return [];
  }
  const urls = [];
  for (const file of files) {
    const buffer = await file.arrayBuffer();
    const key = `chat/${roomId}/images/${generateUniqueFileName(file.name, userId)}`;
    await saveToR2(env2.STORAGE, key, buffer, file.type, {
      roomId: String(roomId),
      uploader: userId,
      fileName: file.name
    });
    const url = `/api/v1/upload/file/${key}`;
    urls.push(url);
  }
  return urls;
}
__name(uploadChatImages, "uploadChatImages");
async function uploadChatAudio(env2, roomId, userId, file) {
  await ensureRoomExists(env2, roomId);
  const participant = await queryFirst(
    env2.DB,
    "SELECT 1 FROM chat_room_participant WHERE room_id = ? AND user_id = ? LIMIT 1",
    [roomId, userId]
  );
  if (!participant) {
    throw new AppError("\uCC44\uD305\uBC29\uC5D0 \uCC38\uC5EC\uD558\uC9C0 \uC54A\uC740 \uC0AC\uC6A9\uC790\uC785\uB2C8\uB2E4.", 403, "CHAT_ROOM_FORBIDDEN");
  }
  const buffer = await file.arrayBuffer();
  const key = `chat/${roomId}/audio/${generateUniqueFileName(file.name, userId)}`;
  await saveToR2(env2.STORAGE, key, buffer, file.type, {
    roomId: String(roomId),
    uploader: userId,
    fileName: file.name
  });
  return `/api/v1/upload/file/${key}`;
}
__name(uploadChatAudio, "uploadChatAudio");
async function listMyChatFiles(env2, userId) {
  const rows = await query(
    env2.DB,
    `SELECT f.*
       FROM chat_files f
       JOIN chat_message m ON m.message_id = f.message_id
      WHERE m.user_id = ? AND f.is_deleted = 0
      ORDER BY f.created_at DESC`,
    [userId]
  );
  return rows.map(mapFile);
}
__name(listMyChatFiles, "listMyChatFiles");
async function deleteChatFile(env2, userId, fileId) {
  const row = await queryFirst(
    env2.DB,
    `SELECT f.*
       FROM chat_files f
       JOIN chat_message m ON m.message_id = f.message_id
      WHERE f.file_id = ?
      LIMIT 1`,
    [fileId]
  );
  if (!row) {
    throw new AppError("\uD30C\uC77C\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", 404, "CHAT_FILE_NOT_FOUND");
  }
  const messageOwner = await queryFirst(
    env2.DB,
    "SELECT user_id FROM chat_message WHERE message_id = ? LIMIT 1",
    [row.message_id]
  );
  if (messageOwner?.user_id !== userId) {
    throw new AppError("\uBCF8\uC778\uC774 \uC5C5\uB85C\uB4DC\uD55C \uD30C\uC77C\uB9CC \uC0AD\uC81C\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.", 403, "CHAT_FILE_FORBIDDEN");
  }
  await execute(
    env2.DB,
    "UPDATE chat_files SET is_deleted = 1, updated_at = ? WHERE file_id = ?",
    [(/* @__PURE__ */ new Date()).toISOString(), fileId]
  );
}
__name(deleteChatFile, "deleteChatFile");
function parseDataUrl(base64DataUrl) {
  const match = base64DataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) {
    throw new AppError("\uC798\uBABB\uB41C \uC624\uB514\uC624 \uB370\uC774\uD130\uC785\uB2C8\uB2E4.", 400, "INVALID_AUDIO_DATA");
  }
  const contentType = match[1];
  const base64 = match[2];
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return { contentType, buffer: bytes.buffer };
}
__name(parseDataUrl, "parseDataUrl");
async function createChatMessage(env2, userId, payload) {
  const roomId = Number(payload.roomId);
  if (!Number.isFinite(roomId)) {
    throw new AppError("roomId\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.", 400, "INVALID_ROOM_ID");
  }
  const room = await queryFirst(
    env2.DB,
    "SELECT * FROM chat_room WHERE room_id = ? LIMIT 1",
    [roomId]
  );
  if (!room) {
    throw new AppError("\uCC44\uD305\uBC29\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", 404, "CHAT_ROOM_NOT_FOUND");
  }
  const participant = await queryFirst(
    env2.DB,
    "SELECT 1 FROM chat_room_participant WHERE room_id = ? AND user_id = ? LIMIT 1",
    [roomId, userId]
  );
  if (!participant) {
    throw new AppError("\uCC44\uD305\uBC29\uC5D0 \uCC38\uC5EC\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.", 403, "CHAT_ROOM_FORBIDDEN");
  }
  const now = nowIso5();
  const messageText = typeof payload.message === "string" && payload.message.trim().length > 0 ? payload.message.trim() : null;
  const imageUrls = Array.isArray(payload.imageUrls) ? payload.imageUrls.filter((url) => typeof url === "string" && url.length > 0) : [];
  let audioUrl = payload.audioUrl ?? null;
  if (!audioUrl && typeof payload.audioData === "string" && payload.audioData.startsWith("data:")) {
    const { contentType, buffer } = parseDataUrl(payload.audioData);
    const key = `chat/${roomId}/audio/${generateUniqueFileName("voice-message.webm", userId)}`;
    await saveToR2(env2.STORAGE, key, buffer, contentType, {
      roomId: String(roomId),
      uploader: userId,
      type: "voice-message"
    });
    audioUrl = `/api/v1/upload/file/${key}`;
  }
  if (!messageText && !imageUrls.length && !audioUrl) {
    throw new AppError("\uBA54\uC2DC\uC9C0 \uB0B4\uC6A9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.", 400, "EMPTY_MESSAGE");
  }
  await execute(
    env2.DB,
    `INSERT INTO chat_message (
        room_id,
        user_id,
        message,
        audio_url,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
    [roomId, userId, messageText ?? null, audioUrl, now, now]
  );
  const messageIdRow = await queryFirst(env2.DB, "SELECT last_insert_rowid() as id");
  const messageId = Number(messageIdRow?.id ?? 0);
  if (!messageId) {
    throw new AppError("\uBA54\uC2DC\uC9C0\uB97C \uC800\uC7A5\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", 500, "CHAT_MESSAGE_CREATE_FAILED");
  }
  if (imageUrls.length) {
    for (const url of imageUrls) {
      await execute(
        env2.DB,
        `INSERT INTO chat_image (message_id, image_url, created_at, updated_at)
          VALUES (?, ?, ?, ?)`,
        [messageId, url, now, now]
      );
    }
  }
  await execute(
    env2.DB,
    "UPDATE chat_room SET updated_at = ? WHERE room_id = ?",
    [now, roomId]
  );
  const messageRow = await queryFirst(
    env2.DB,
    `SELECT m.*, u.name, u.profile_image
       FROM chat_message m
       LEFT JOIN users u ON u.user_id = m.user_id
      WHERE m.message_id = ?
      LIMIT 1`,
    [messageId]
  );
  if (!messageRow) {
    throw new AppError("\uBA54\uC2DC\uC9C0\uB97C \uC870\uD68C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", 500, "CHAT_MESSAGE_LOAD_FAILED");
  }
  const images = await query(
    env2.DB,
    "SELECT message_id, image_url FROM chat_image WHERE message_id = ?",
    [messageId]
  );
  const files = await query(
    env2.DB,
    "SELECT * FROM chat_files WHERE message_id = ? AND is_deleted = 0",
    [messageId]
  );
  const mappedFiles = files.map(mapFile);
  return mapMessage(messageRow, images, mappedFiles);
}
__name(createChatMessage, "createChatMessage");
async function markRoomMessagesAsRead(env2, roomId, userId) {
  await ensureRoomExists(env2, roomId);
  const messageIds = await query(
    env2.DB,
    "SELECT message_id FROM chat_message WHERE room_id = ? AND user_id != ?",
    [roomId, userId]
  );
  if (!messageIds.length) {
    return;
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const statements = messageIds.map(({ message_id }) => ({
    sql: `INSERT OR REPLACE INTO message_read_status (message_id, user_id, read_at, is_deleted, created_at, updated_at)
            VALUES (?, ?, ?, 0, ?, ?)`,
    params: [message_id, userId, now, now, now]
  }));
  await transaction(env2.DB, statements);
}
__name(markRoomMessagesAsRead, "markRoomMessagesAsRead");
async function getUnreadCountForRoom(env2, roomId, userId) {
  await ensureRoomExists(env2, roomId);
  const row = await queryFirst(
    env2.DB,
    `SELECT COUNT(*) as count
       FROM chat_message m
      WHERE m.room_id = ?
        AND m.user_id != ?
        AND m.message_id NOT IN (
          SELECT message_id FROM message_read_status
           WHERE user_id = ? AND is_deleted = 0
        )`,
    [roomId, userId, userId]
  );
  return row?.count ?? 0;
}
__name(getUnreadCountForRoom, "getUnreadCountForRoom");
async function getTotalUnreadCount(env2, userId) {
  const row = await queryFirst(
    env2.DB,
    `SELECT COUNT(*) as count
       FROM chat_message m
      WHERE m.user_id != ?
        AND m.message_id NOT IN (
          SELECT message_id FROM message_read_status WHERE user_id = ? AND is_deleted = 0
        )`,
    [userId, userId]
  );
  return row?.count ?? 0;
}
__name(getTotalUnreadCount, "getTotalUnreadCount");

// src/routes/chat.ts
var chatRoutes = new Hono2();
var requireAuth10 = auth();
function requireUserId3(userId) {
  if (!userId) {
    throw new AppError("\uC778\uC99D \uC815\uBCF4\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.", 401, "UNAUTHORIZED");
  }
  return userId;
}
__name(requireUserId3, "requireUserId");
function parseRoomId(raw2) {
  const roomId = Number(raw2);
  if (!Number.isFinite(roomId)) {
    throw new AppError("\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 roomId \uC785\uB2C8\uB2E4.", 400, "INVALID_ROOM_ID");
  }
  return roomId;
}
__name(parseRoomId, "parseRoomId");
chatRoutes.use("*", requireAuth10);
chatRoutes.get("/rooms", async (c) => {
  const userId = requireUserId3(c.get("userId"));
  const rooms = await listUserChatRooms(c.env, userId);
  return successResponse(c, rooms);
});
chatRoutes.get("/rooms/public", async (c) => {
  const userId = requireUserId3(c.get("userId"));
  const rooms = await listPublicChatRooms(c.env, userId);
  return successResponse(c, rooms);
});
chatRoutes.post("/rooms", async (c) => {
  const userId = requireUserId3(c.get("userId"));
  const body = await c.req.json().catch(() => ({}));
  const roomName = typeof body?.roomName === "string" ? body.roomName : "";
  const participantIds = Array.isArray(body?.participantIds) ? body.participantIds.filter((id) => typeof id === "string") : [];
  const isPublic = Boolean(body?.isPublic);
  const roomType = typeof body?.roomType === "string" ? body.roomType : void 0;
  const maxParticipants = typeof body?.maxParticipants === "number" ? Number(body.maxParticipants) : void 0;
  const room = await createChatRoom(c.env, userId, roomName, participantIds, {
    isPublic,
    roomType,
    maxParticipants
  });
  try {
    const hubId = c.env.CHAT_HUB.idFromName("global");
    const hubStub = c.env.CHAT_HUB.get(hubId);
    const publish = /* @__PURE__ */ __name((destination, payload, targetUserId) => hubStub.fetch("https://chat-hub/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination, payload, userId: targetUserId })
    }), "publish");
    if (room.isPublic) {
      await publish("/sub/chat/public-rooms", room);
    }
    if (Array.isArray(room.participants)) {
      await Promise.all(
        room.participants.filter((participant) => participant.userId).map((participant) => publish("/user/queue/rooms", room, participant.userId))
      );
    }
  } catch (error3) {
    console.error("[chatRoutes] Failed to publish room creation event", error3);
  }
  return successResponse(c, room);
});
chatRoutes.post("/rooms/:roomId/join", async (c) => {
  const userId = requireUserId3(c.get("userId"));
  const roomId = parseRoomId(c.req.param("roomId"));
  const room = await joinChatRoom(c.env, roomId, userId);
  return successResponse(c, room);
});
chatRoutes.post("/rooms/:roomId/leave", async (c) => {
  const userId = requireUserId3(c.get("userId"));
  const roomId = parseRoomId(c.req.param("roomId"));
  await leaveChatRoom(c.env, roomId, userId);
  return successResponse(c, { success: true });
});
chatRoutes.get("/rooms/:roomId/messages", async (c) => {
  const userId = requireUserId3(c.get("userId"));
  const roomId = parseRoomId(c.req.param("roomId"));
  const page = Number(c.req.query("page") ?? "0");
  const size = Number(c.req.query("size") ?? "50");
  if (!Number.isFinite(page) || page < 0) {
    throw new AppError("page \uAC12\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.", 400, "INVALID_PAGE_PARAM");
  }
  const perPage = Number.isFinite(size) && size > 0 ? Math.min(size, 200) : 50;
  const messages = await listRoomMessages(c.env, roomId, page, perPage);
  return successResponse(c, messages);
});
chatRoutes.get("/rooms/:roomId/messages/search", async (c) => {
  const userId = requireUserId3(c.get("userId"));
  const roomId = parseRoomId(c.req.param("roomId"));
  const keyword = c.req.query("keyword") ?? "";
  const page = Number(c.req.query("page") ?? "0");
  const size = Number(c.req.query("size") ?? "20");
  const perPage = Number.isFinite(size) && size > 0 ? Math.min(size, 100) : 20;
  const messages = await searchRoomMessages(c.env, roomId, keyword, page, perPage);
  return successResponse(c, messages);
});
chatRoutes.post("/rooms/:roomId/images", async (c) => {
  const userId = requireUserId3(c.get("userId"));
  const roomId = parseRoomId(c.req.param("roomId"));
  const formData = await c.req.formData();
  const entries = formData.getAll("files");
  const files = entries.filter((value) => typeof value === "object" && value !== null && "arrayBuffer" in value).map((value) => value);
  if (!files.length) {
    return successResponse(c, []);
  }
  const urls = await uploadChatImages(c.env, roomId, userId, files);
  return successResponse(c, urls);
});
chatRoutes.post("/upload/image", async (c) => {
  const userId = requireUserId3(c.get("userId"));
  const formData = await c.req.formData();
  const roomIdValue = formData.get("roomId");
  const roomId = typeof roomIdValue === "string" ? Number(roomIdValue) : Number(roomIdValue);
  if (!Number.isFinite(roomId)) {
    throw new AppError("roomId\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.", 400, "INVALID_ROOM_ID");
  }
  const fileEntry = formData.get("image") ?? formData.get("file");
  if (!fileEntry || typeof fileEntry !== "object" || !("arrayBuffer" in fileEntry)) {
    throw new AppError("\uC774\uBBF8\uC9C0 \uD30C\uC77C\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.", 400, "IMAGE_FILE_REQUIRED");
  }
  const file = fileEntry;
  const urls = await uploadChatImages(c.env, roomId, userId, [file]);
  const primary = urls.length > 0 ? urls[0] : null;
  return successResponse(c, { url: primary, urls });
});
chatRoutes.post("/rooms/:roomId/audio", async (c) => {
  const userId = requireUserId3(c.get("userId"));
  const roomId = parseRoomId(c.req.param("roomId"));
  const formData = await c.req.formData();
  const entry = formData.get("file");
  if (!entry || typeof entry !== "object" || !("arrayBuffer" in entry)) {
    throw new AppError("\uC624\uB514\uC624 \uD30C\uC77C\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.", 400, "AUDIO_FILE_REQUIRED");
  }
  const file = entry;
  const url = await uploadChatAudio(c.env, roomId, userId, file);
  return successResponse(c, url);
});
chatRoutes.get("/files/my-files", async (c) => {
  const userId = requireUserId3(c.get("userId"));
  const files = await listMyChatFiles(c.env, userId);
  return successResponse(c, files);
});
chatRoutes.delete("/files/:fileId", async (c) => {
  const userId = requireUserId3(c.get("userId"));
  const fileId = Number(c.req.param("fileId"));
  if (!Number.isFinite(fileId)) {
    throw new AppError("\uD30C\uC77C ID\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.", 400, "INVALID_FILE_ID");
  }
  await deleteChatFile(c.env, userId, fileId);
  return successResponse(c, { success: true });
});
chatRoutes.post("/read-status/rooms/:roomId/read-all", async (c) => {
  const userId = requireUserId3(c.get("userId"));
  const roomId = parseRoomId(c.req.param("roomId"));
  await markRoomMessagesAsRead(c.env, roomId, userId);
  return successResponse(c, { success: true });
});
chatRoutes.get("/read-status/rooms/:roomId/unread-count", async (c) => {
  const userId = requireUserId3(c.get("userId"));
  const roomId = parseRoomId(c.req.param("roomId"));
  const count3 = await getUnreadCountForRoom(c.env, roomId, userId);
  return successResponse(c, count3);
});
chatRoutes.get("/read-status/total-unread-count", async (c) => {
  const userId = requireUserId3(c.get("userId"));
  const count3 = await getTotalUnreadCount(c.env, userId);
  return successResponse(c, count3);
});
var chat_default = chatRoutes;

// src/routes/settings.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_errors();
init_db();
var settingsRoutes = new Hono2();
var requireAuth11 = auth();
settingsRoutes.use("*", requireAuth11);
async function loadSettingsMap(env2, userId) {
  const rows = await query(
    env2.DB,
    "SELECT setting_key, setting_value FROM user_settings WHERE user_id = ?",
    [userId]
  );
  const map = /* @__PURE__ */ new Map();
  for (const row of rows) {
    if (row.setting_key) {
      map.set(row.setting_key, row.setting_value ?? "");
    }
  }
  return map;
}
__name(loadSettingsMap, "loadSettingsMap");
async function saveSettingsEntries(env2, userId, entries) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const statements = Object.entries(entries).filter(([_, value]) => value !== void 0).map(([key, value]) => ({
    sql: "INSERT OR REPLACE INTO user_settings (user_id, setting_key, setting_value, updated_at) VALUES (?, ?, ?, ?)",
    params: [userId, key, value === null ? null : String(value), now]
  }));
  if (statements.length === 0) return;
  await transaction(env2.DB, statements);
}
__name(saveSettingsEntries, "saveSettingsEntries");
async function deleteSettingsKeys(env2, userId, keys) {
  if (!keys.length) return;
  const placeholders = keys.map(() => "?").join(",");
  await execute(
    env2.DB,
    `DELETE FROM user_settings WHERE user_id = ? AND setting_key IN (${placeholders})`,
    [userId, ...keys]
  );
}
__name(deleteSettingsKeys, "deleteSettingsKeys");
function toBool(value, fallback = false) {
  if (value === void 0) return fallback;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return fallback;
}
__name(toBool, "toBool");
settingsRoutes.get("/account", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const [profile3, settings] = await Promise.all([
    getUserProfile(c.env, userId),
    loadSettingsMap(c.env, userId)
  ]);
  if (!profile3) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }
  return successResponse(c, {
    email: profile3.email ?? "",
    phoneNumber: settings.get("account.phoneNumber") ?? "",
    englishName: profile3.englishName ?? "",
    residence: settings.get("account.residence") ?? profile3.location?.country ?? "",
    profileImage: profile3.profileImage ?? null,
    bio: profile3.selfBio ?? "",
    birthDate: profile3.birthday ?? "",
    gender: profile3.gender ?? ""
  });
});
settingsRoutes.patch("/account", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  const profilePayload = {};
  if (typeof body.englishName === "string") profilePayload.englishName = body.englishName.trim();
  if (typeof body.bio === "string") profilePayload.selfBio = body.bio.trim();
  if (typeof body.birthDate === "string") profilePayload.birthday = body.birthDate;
  if (typeof body.gender === "string") profilePayload.gender = body.gender;
  if (typeof body.profileImage === "string" && body.profileImage.length > 0) {
    profilePayload.profileImage = body.profileImage;
  }
  if (Object.keys(profilePayload).length > 0) {
    await updateUserProfile(c.env, userId, profilePayload);
  }
  const entries = {};
  if (body.phoneNumber !== void 0) entries["account.phoneNumber"] = body.phoneNumber ? String(body.phoneNumber) : "";
  if (body.residence !== void 0) entries["account.residence"] = body.residence ? String(body.residence) : "";
  if (body.email !== void 0) entries["account.email"] = body.email ? String(body.email) : "";
  await saveSettingsEntries(c.env, userId, entries);
  if (body.email && typeof body.email === "string") {
    await execute(
      c.env.DB,
      "UPDATE users SET email = ?, updated_at = ? WHERE user_id = ?",
      [body.email.trim(), (/* @__PURE__ */ new Date()).toISOString(), userId]
    );
  }
  return successResponse(c, { success: true });
});
settingsRoutes.delete("/account", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  await execute(
    c.env.DB,
    "UPDATE users SET user_disable = 1, updated_at = ? WHERE user_id = ?",
    [(/* @__PURE__ */ new Date()).toISOString(), userId]
  );
  return successResponse(c, { disabled: true });
});
settingsRoutes.get("/notifications", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const settings = await getUserSettings(c.env, userId);
  const prefs = settings.notificationPreferences ?? {};
  return successResponse(c, {
    email: prefs.email ?? false,
    push: prefs.push ?? false,
    sms: prefs.sms ?? false
  });
});
settingsRoutes.patch("/notifications", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  const preferences = {};
  for (const key of ["email", "push", "sms"]) {
    if (body[key] !== void 0) {
      preferences[key] = Boolean(body[key]);
    }
  }
  await updateUserSettings(c.env, userId, { notificationPreferences: preferences });
  return successResponse(c, { success: true });
});
settingsRoutes.get("/privacy", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const map = await loadSettingsMap(c.env, userId);
  return successResponse(c, {
    profilePublic: toBool(map.get("privacy.profilePublic"), true),
    showOnlineStatus: toBool(map.get("privacy.showOnlineStatus"), true),
    allowMessages: toBool(map.get("privacy.allowMessages"), true)
  });
});
settingsRoutes.patch("/privacy", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  const entries = {};
  if (body.profilePublic !== void 0) entries["privacy.profilePublic"] = String(Boolean(body.profilePublic));
  if (body.showOnlineStatus !== void 0) entries["privacy.showOnlineStatus"] = String(Boolean(body.showOnlineStatus));
  if (body.allowMessages !== void 0) entries["privacy.allowMessages"] = String(Boolean(body.allowMessages));
  await saveSettingsEntries(c.env, userId, entries);
  return successResponse(c, { success: true });
});
settingsRoutes.get("/language", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const settings = await getUserSettings(c.env, userId);
  return successResponse(c, {
    language: settings.language ?? "ko",
    timeZone: settings.timeZone ?? "Asia/Seoul"
  });
});
settingsRoutes.patch("/language", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  const payload = {};
  if (body.language !== void 0) payload.language = String(body.language);
  if (body.timeZone !== void 0) payload.timeZone = String(body.timeZone);
  if (body.marketingOptIn !== void 0) payload.marketingOptIn = Boolean(body.marketingOptIn);
  await updateUserSettings(c.env, userId, payload);
  return successResponse(c, { success: true });
});
settingsRoutes.patch("/password", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  if (typeof body.currentPassword !== "string" || typeof body.newPassword !== "string") {
    throw new AppError("currentPassword and newPassword are required", 400, "INVALID_PAYLOAD");
  }
  return successResponse(c, { success: true, message: "Password change acknowledged (no-op in worker)." });
});
settingsRoutes.post("/export", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const profile3 = await getUserProfile(c.env, userId);
  return successResponse(c, {
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    profile: profile3,
    sessions: [],
    messages: []
  });
});
settingsRoutes.get("/login-history", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const ninetyDaysAgo = /* @__PURE__ */ new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const history = await query(
    c.env.DB,
    `SELECT
      id,
      login_time,
      ip_address,
      device,
      browser,
      location,
      country_code,
      suspicious,
      suspicious_reason,
      success
    FROM login_history
    WHERE user_id = ? AND login_time >= ? AND success = 1
    ORDER BY login_time DESC
    LIMIT 100`,
    [userId, ninetyDaysAgo.toISOString()]
  );
  const formattedHistory = history.map((record) => ({
    loginTime: record.login_time,
    ipAddress: record.ip_address || "Unknown",
    device: record.device || "Unknown Device",
    browser: record.browser || null,
    location: record.location || "Unknown Location",
    countryCode: record.country_code || null,
    suspicious: Boolean(record.suspicious),
    suspiciousReason: record.suspicious_reason || null
  }));
  return successResponse(c, formattedHistory);
});
settingsRoutes.get("/two-factor", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const map = await loadSettingsMap(c.env, userId);
  const pending = map.get("security.twoFactor.setup");
  return successResponse(c, {
    enabled: toBool(map.get("security.twoFactor.enabled"), false),
    qrCode: pending ? map.get("security.twoFactor.qrCode") ?? null : null
  });
});
settingsRoutes.post("/two-factor/enable", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const secret = crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
  const otpauth = `otpauth://totp/StudyMate:${userId}?secret=${secret}&issuer=StudyMate`;
  await saveSettingsEntries(c.env, userId, {
    "security.twoFactor.setup": "pending",
    "security.twoFactor.secret": secret,
    "security.twoFactor.qrCode": otpauth
  });
  return successResponse(c, { qrCode: otpauth });
});
settingsRoutes.post("/two-factor/disable", async (c) => {
  const userId = c.get("userId");
  if (!userId) throw new AppError("User id missing from context", 500, "CONTEXT_MISSING_USER");
  const body = await c.req.json().catch(() => ({}));
  const map = await loadSettingsMap(c.env, userId);
  if (map.get("security.twoFactor.setup") === "pending") {
    await saveSettingsEntries(c.env, userId, { "security.twoFactor.enabled": "true" });
    await deleteSettingsKeys(c.env, userId, ["security.twoFactor.setup", "security.twoFactor.qrCode"]);
    return successResponse(c, { success: true, enabled: true, verified: true });
  }
  await saveSettingsEntries(c.env, userId, { "security.twoFactor.enabled": "false" });
  await deleteSettingsKeys(c.env, userId, ["security.twoFactor.secret", "security.twoFactor.qrCode"]);
  return successResponse(c, { success: true, enabled: false });
});
var settings_default = settingsRoutes;

// src/durable/WebRTCRoom.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
import { DurableObject } from "cloudflare:workers";
var WebRTCRoom = class extends DurableObject {
  static {
    __name(this, "WebRTCRoom");
  }
  constructor(state, env2) {
    super(state, env2);
    this.env = env2;
    this.roomId = state.id.toString();
    this.roomData = {
      id: this.roomId,
      participants: [],
      maxParticipants: 4,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      type: "audio",
      metadata: {},
      settings: {
        allowScreenShare: true,
        allowRecording: false,
        autoMuteOnJoin: false,
        stunServers: [
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun.cloudflare.com:3478" }
        ],
        turnServers: [
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject"
          },
          {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject"
          },
          {
            urls: "turn:freestun.net:3478",
            username: "free",
            credential: "free"
          }
        ],
        recordingSettings: {
          enabled: true,
          autoStart: false,
          maxDuration: 60,
          // 1시간
          format: "webm",
          quality: "medium",
          audioOnly: false
        }
      },
      metrics: {
        totalParticipants: 0,
        peakParticipants: 0,
        messagesExchanged: 0,
        connectionErrors: 0,
        lastActivity: (/* @__PURE__ */ new Date()).toISOString(),
        sessionDuration: 0
      }
    };
    this.restoreParticipants();
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (request.headers.get("Upgrade") === "websocket") {
      return this.handleWebSocket(request);
    }
    switch (url.pathname) {
      case "/init":
        return this.handleInit(request);
      case "/join":
        return this.handleJoin(request);
      case "/leave":
        return this.handleLeave(request);
      case "/info":
        return this.handleInfo();
      case "/settings":
        return this.handleSettings(request);
      case "/metadata":
        return this.handleMetadata(request);
      case "/ice-servers":
        return this.handleIceServers();
      case "/metrics":
        return this.handleMetrics();
      default:
        return new Response("Not Found", { status: 404 });
    }
  }
  async handleWebSocket(request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const userName = url.searchParams.get("userName") || "Anonymous";
    if (!userId) {
      return new Response("Missing userId parameter", { status: 400 });
    }
    const activeParticipants = this.getActiveParticipants();
    if (activeParticipants.length >= this.roomData.maxParticipants) {
      return new Response(JSON.stringify({ error: "Room is full" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    const userData = {
      userId,
      userName,
      joinedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    server.serializeAttachment(userData);
    this.ctx.acceptWebSocket(server, [userId]);
    const participant = {
      id: userId,
      name: userName,
      joinedAt: userData.joinedAt,
      audioEnabled: true,
      videoEnabled: this.roomData.type === "video",
      isScreenSharing: false
    };
    this.roomData.participants.push(participant);
    this.updateMetrics("join");
    await this.saveRoomData();
    await this.syncActiveRoomCache();
    await this.sendAnalytics("participant_joined", {
      userId,
      userName,
      totalParticipants: this.roomData.participants.length,
      roomType: this.roomData.type
    });
    server.send(JSON.stringify({
      type: "connected",
      roomData: this.roomData,
      userId
    }));
    this.broadcast({
      type: "participant-joined",
      participant
    }, userId);
    return new Response(null, { status: 101, webSocket: client });
  }
  async handleInit(request) {
    try {
      const { roomType = "audio", maxParticipants = 4, metadata = {} } = await request.json();
      this.roomData.type = roomType;
      this.roomData.maxParticipants = maxParticipants;
      this.roomData.createdAt = (/* @__PURE__ */ new Date()).toISOString();
      this.roomData.metadata = metadata || {};
      await this.saveRoomData();
      await this.syncActiveRoomCache();
      return new Response(JSON.stringify({
        success: true,
        roomId: this.roomId,
        roomType,
        maxParticipants,
        metadata,
        createdAt: this.roomData.createdAt
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error3) {
      log3.error("Init error", error3, void 0, { component: "WEBRTC_ROOM" });
      return new Response(JSON.stringify({
        error: "Failed to initialize room"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  async handleJoin(request) {
    try {
      const { userId, userName, roomType } = await request.json();
      const existingParticipant = this.roomData.participants.find((p) => p.id === userId);
      if (existingParticipant) {
        return new Response(JSON.stringify({
          success: true,
          roomData: this.roomData,
          message: "Already in room"
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      const activeParticipants = this.getActiveParticipants();
      if (activeParticipants.length >= this.roomData.maxParticipants) {
        return new Response(JSON.stringify({
          error: "Room is full"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (roomType && this.roomData.participants.length === 0) {
        this.roomData.type = roomType;
      }
      await this.saveRoomData();
      return new Response(JSON.stringify({
        success: true,
        roomData: this.roomData,
        websocketUrl: `/room/${this.roomId}/websocket?userId=${userId}&userName=${encodeURIComponent(userName)}`
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error3) {
      log3.error("Join error", error3, void 0, { component: "WEBRTC_ROOM" });
      return new Response(JSON.stringify({
        error: "Failed to join room"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  async handleLeave(request) {
    try {
      const { userId } = await request.json();
      await this.handleParticipantLeave(userId);
      return new Response(JSON.stringify({ success: true }));
    } catch (error3) {
      log3.error("Leave error", error3, void 0, { component: "WEBRTC_ROOM" });
      return new Response(JSON.stringify({
        error: "Failed to leave room"
      }), { status: 500 });
    }
  }
  async handleSignal(request) {
    try {
      const { from, to, signal } = await request.json();
      const websockets = this.ctx.getWebSockets(to);
      websockets.forEach((ws) => {
        try {
          ws.send(JSON.stringify({ type: "signal", from, signal }));
        } catch (e) {
          log3.error("Signal forward error", e, void 0, { component: "WEBRTC_ROOM" });
        }
      });
      return new Response(JSON.stringify({ success: true }));
    } catch (error3) {
      log3.error("Signal error", error3, void 0, { component: "WEBRTC_ROOM" });
      return new Response(JSON.stringify({
        error: "Failed to send signal"
      }), { status: 500 });
    }
  }
  async handleInfo() {
    const roomData = await this.ctx.storage.get("roomData") || this.roomData;
    return new Response(JSON.stringify(roomData));
  }
  // WebSocket Hibernation API event handlers
  async webSocketMessage(ws, message) {
    try {
      const userData = ws.deserializeAttachment();
      if (!userData) {
        ws.close(1008, "User data not found");
        return;
      }
      const msg = typeof message === "string" ? JSON.parse(message) : null;
      if (!msg) return;
      await this.handleWebSocketMessage(ws, userData.userId, msg);
    } catch (error3) {
      log3.error("WebSocket message error", error3, void 0, { component: "WEBRTC_ROOM" });
      this.updateMetrics("error");
      await this.sendAnalytics("websocket_error", { error: String(error3) });
      ws.send(JSON.stringify({
        type: "error",
        message: "Invalid message format"
      }));
    }
  }
  async webSocketClose(ws, code, reason, wasClean) {
    const userData = ws.deserializeAttachment();
    if (userData) {
      await this.handleParticipantLeave(userData.userId);
    }
  }
  async webSocketError(ws, error3) {
    log3.error("WebSocket error", error3, void 0, { component: "WEBRTC_ROOM" });
    this.updateMetrics("error");
    await this.sendAnalytics("websocket_connection_error", { error: String(error3) });
    const userData = ws.deserializeAttachment();
    if (userData) {
      await this.handleParticipantLeave(userData.userId);
    }
  }
  async handleWebSocketMessage(ws, userId, message) {
    const { type, data } = message;
    this.updateMetrics("message");
    switch (type) {
      case "offer":
      case "answer":
      case "ice-candidate":
        if (data.to) {
          this.sendToParticipant(data.to, {
            type,
            from: userId,
            data: data.signal || data
          });
        }
        break;
      case "toggle-audio":
        await this.updateParticipantStatus(userId, { audioEnabled: data.enabled });
        break;
      case "toggle-video":
        await this.updateParticipantStatus(userId, { videoEnabled: data.enabled });
        break;
      case "toggle-screen-share":
        await this.updateParticipantStatus(userId, { isScreenSharing: data.enabled });
        this.broadcast({
          type: "screen-share-changed",
          userId,
          isSharing: data.enabled
        }, userId);
        break;
      case "chat":
        this.broadcast({
          type: "chat",
          from: userId,
          message: data.message,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        break;
      case "start-recording":
        if (this.roomData.settings.allowRecording && this.roomData.settings.recordingSettings?.enabled) {
          this.broadcast({
            type: "recording-started",
            initiatedBy: userId,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            settings: this.roomData.settings.recordingSettings
          });
          await this.sendAnalytics("recording_started", { userId });
        }
        break;
      case "stop-recording":
        this.broadcast({
          type: "recording-stopped",
          stoppedBy: userId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        await this.sendAnalytics("recording_stopped", { userId });
        break;
      case "recording-chunk":
        await this.handleRecordingChunk(userId, data);
        break;
      case "quality-report":
        await this.handleQualityReport(userId, data);
        break;
      case "ping":
        ws.send(JSON.stringify({ type: "pong" }));
        break;
      default:
        log3.warn("Unknown message type", { component: "WEBRTC_ROOM" }, { type });
    }
  }
  async updateParticipantStatus(userId, updates) {
    const participant = this.roomData.participants.find((p) => p.id === userId);
    if (participant) {
      Object.assign(participant, updates);
      await this.saveRoomData();
      this.broadcast({
        type: "participant-updated",
        participant
      });
    }
  }
  async handleParticipantLeave(userId) {
    const participantIndex = this.roomData.participants.findIndex((p) => p.id === userId);
    if (participantIndex === -1) return;
    this.roomData.participants.splice(participantIndex, 1);
    this.updateMetrics("leave");
    await this.saveRoomData();
    await this.syncActiveRoomCache();
    await this.sendAnalytics("participant_left", {
      userId,
      remainingParticipants: this.roomData.participants.length,
      sessionDuration: this.roomData.metrics.sessionDuration
    });
    this.broadcast({
      type: "participant-left",
      userId
    });
    const activeParticipants = this.getActiveParticipants();
    if (activeParticipants.length === 0) {
      const cleanupTime = Date.now() + 6e4;
      await this.ctx.storage.setAlarm(cleanupTime);
    }
  }
  // Handle alarm for room cleanup
  async alarm() {
    const activeParticipants = this.getActiveParticipants();
    if (activeParticipants.length === 0) {
      await this.ctx.storage.deleteAll();
      await this.syncActiveRoomCache({ forceRemove: true });
    }
  }
  async handleSettings(request) {
    if (request.method === "GET") {
      return new Response(JSON.stringify(this.roomData.settings), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (request.method === "PATCH") {
      try {
        const updates = await request.json();
        Object.assign(this.roomData.settings, updates);
        await this.saveRoomData();
        await this.syncActiveRoomCache();
        this.broadcast({
          type: "settings-updated",
          settings: this.roomData.settings
        });
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (error3) {
        return new Response(JSON.stringify({ error: "Invalid request" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    return new Response("Method not allowed", { status: 405 });
  }
  async handleMetadata(request) {
    if (request.method !== "PATCH" && request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
    try {
      const metadata = await request.json();
      if (!metadata || typeof metadata !== "object") {
        return new Response(JSON.stringify({ error: "metadata object is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      this.roomData.metadata = {
        ...this.roomData.metadata || {},
        ...metadata
      };
      await this.saveRoomData();
      await this.syncActiveRoomCache();
      return new Response(JSON.stringify({
        success: true,
        metadata: this.roomData.metadata
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error3) {
      log3.error("Metadata update error", error3, void 0, { component: "WEBRTC_ROOM" });
      return new Response(JSON.stringify({ error: "Failed to update metadata" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  async syncActiveRoomCache(options) {
    if (!this.env?.CACHE) {
      return;
    }
    try {
      if (options?.forceRemove) {
        await removeActiveRoom(this.env.CACHE, this.roomId);
        return;
      }
      const activeCount = this.getActiveParticipants().length;
      const roomInfo = {
        roomId: this.roomId,
        roomType: this.roomData.type === "video" ? "video" : "audio",
        currentParticipants: activeCount,
        maxParticipants: this.roomData.maxParticipants,
        status: activeCount > 0 ? "active" : "waiting",
        createdAt: this.roomData.createdAt,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        metadata: this.roomData.metadata || {}
      };
      await upsertActiveRoom(this.env.CACHE, roomInfo);
    } catch (error3) {
      log3.warn("Active room cache sync failed", void 0, {
        component: "WEBRTC_ROOM",
        error: error3 instanceof Error ? error3.message : String(error3)
      });
    }
  }
  broadcast(message, excludeUserId) {
    const data = JSON.stringify(message);
    this.ctx.getWebSockets().forEach((ws) => {
      try {
        const userData = ws.deserializeAttachment();
        if (userData && userData.userId !== excludeUserId) {
          ws.send(data);
        }
      } catch (error3) {
        log3.error("Broadcast error", error3, void 0, { component: "WEBRTC_ROOM" });
      }
    });
  }
  sendToParticipant(userId, message) {
    const data = JSON.stringify(message);
    const websockets = this.ctx.getWebSockets(userId);
    websockets.forEach((ws) => {
      try {
        ws.send(data);
      } catch (error3) {
        log3.error("Send to user error", error3, void 0, { component: "WEBRTC_ROOM", userId });
      }
    });
  }
  async handleIceServers() {
    const iceServers = [
      ...this.roomData.settings.stunServers || [],
      ...this.roomData.settings.turnServers || []
    ];
    return new Response(JSON.stringify({
      iceServers,
      ttl: 3600
      // ICE 서버 정보 TTL (1시간)
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  async handleMetrics() {
    this.updateMetrics("message");
    const activeParticipants = this.getActiveParticipants();
    const metricsData = {
      roomId: this.roomData.id,
      currentParticipants: activeParticipants.length,
      metrics: this.roomData.metrics,
      roomSettings: {
        type: this.roomData.type,
        maxParticipants: this.roomData.maxParticipants,
        createdAt: this.roomData.createdAt
      },
      participants: activeParticipants.map((p) => ({
        id: p.id,
        name: p.name,
        joinedAt: p.joinedAt,
        audioEnabled: p.audioEnabled,
        videoEnabled: p.videoEnabled,
        isScreenSharing: p.isScreenSharing
      }))
    };
    return new Response(JSON.stringify(metricsData), {
      headers: { "Content-Type": "application/json" }
    });
  }
  getActiveParticipants() {
    const connectedUserIds = /* @__PURE__ */ new Set();
    this.ctx.getWebSockets().forEach((ws) => {
      const userData = ws.deserializeAttachment();
      if (userData) {
        connectedUserIds.add(userData.userId);
      }
    });
    return this.roomData.participants.filter((p) => connectedUserIds.has(p.id));
  }
  async saveRoomData() {
    await this.ctx.storage.put("roomData", this.roomData);
  }
  updateMetrics(type, data) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.roomData.metrics.lastActivity = now;
    switch (type) {
      case "join":
        this.roomData.metrics.totalParticipants++;
        const currentCount = this.roomData.participants.length;
        if (currentCount > this.roomData.metrics.peakParticipants) {
          this.roomData.metrics.peakParticipants = currentCount;
        }
        break;
      case "message":
        this.roomData.metrics.messagesExchanged++;
        break;
      case "error":
        this.roomData.metrics.connectionErrors++;
        break;
    }
    const createdTime = new Date(this.roomData.createdAt).getTime();
    const currentTime = new Date(now).getTime();
    this.roomData.metrics.sessionDuration = Math.floor((currentTime - createdTime) / 1e3);
  }
  async sendAnalytics(event, data) {
    try {
      if (this.env?.ANALYTICS) {
        await this.env.ANALYTICS.writeDataPoint({
          blobs: [this.roomData.id, event],
          doubles: [
            this.roomData.participants.length,
            this.roomData.metrics.peakParticipants,
            this.roomData.metrics.messagesExchanged,
            this.roomData.metrics.connectionErrors
          ],
          indexes: [this.roomData.id]
        });
      }
    } catch (error3) {
      console.error("Analytics error:", error3);
    }
  }
  async handleRecordingChunk(userId, data) {
    try {
      const { filename, size, duration } = data;
      const recordingMetadata = {
        roomId: this.roomData.id,
        userId,
        filename,
        size,
        duration,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        participants: this.roomData.participants.map((p) => ({
          id: p.id,
          name: p.name
        }))
      };
      if (this.env?.CACHE) {
        const recordingKey = `recording:${this.roomData.id}:${filename}`;
        await this.env.CACHE.put(recordingKey, JSON.stringify(recordingMetadata), {
          expirationTtl: 86400 * 30
          // 30일 보관
        });
      }
      this.broadcast({
        type: "recording-chunk-saved",
        filename,
        size,
        duration,
        uploadedBy: userId,
        timestamp: recordingMetadata.timestamp
      }, userId);
      await this.sendAnalytics("recording_chunk_saved", {
        userId,
        filename,
        size,
        duration
      });
    } catch (error3) {
      console.error("Recording chunk handling error:", error3);
    }
  }
  async handleQualityReport(userId, data) {
    try {
      const { qualityData, timestamp } = data;
      if (this.env?.CACHE) {
        const qualityKey = `quality:${this.roomId}:${userId}:${Date.now()}`;
        const qualityReport = {
          roomId: this.roomData.id,
          userId,
          timestamp: timestamp || (/* @__PURE__ */ new Date()).toISOString(),
          quality: qualityData,
          participantCount: this.roomData.participants.length
        };
        await this.env.CACHE.put(qualityKey, JSON.stringify(qualityReport), {
          expirationTtl: 3600
          // 1시간 보관
        });
      }
      await this.sendQualityAnalytics(userId, qualityData);
      if (qualityData.overall === "poor" || qualityData.overall === "fair") {
        this.broadcast({
          type: "quality-alert",
          userId,
          quality: qualityData.overall,
          issues: this.extractQualityIssues(qualityData),
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }, userId);
      }
      const participant = this.roomData.participants.find((p) => p.id === userId);
      if (participant) {
        participant.connectionQuality = qualityData.overall;
        participant.lastQualityUpdate = (/* @__PURE__ */ new Date()).toISOString();
        await this.saveRoomData();
      }
    } catch (error3) {
      console.error("Quality report handling error:", error3);
    }
  }
  async sendQualityAnalytics(userId, qualityData) {
    try {
      if (this.env?.ANALYTICS) {
        await this.env.ANALYTICS.writeDataPoint({
          blobs: [this.roomData.id, userId, "quality_report"],
          doubles: [
            qualityData.audio?.stats?.packetLossRate || 0,
            qualityData.video?.stats?.packetLossRate || 0,
            qualityData.network?.stats?.roundTripTime || 0,
            qualityData.audio?.stats?.jitter || 0,
            this.getQualityScore(qualityData.overall)
          ],
          indexes: [this.roomData.id, userId]
        });
      }
    } catch (error3) {
      console.error("Quality analytics error:", error3);
    }
  }
  getQualityScore(quality) {
    const scores = { "excellent": 100, "good": 75, "fair": 50, "poor": 25 };
    return scores[quality] || 0;
  }
  extractQualityIssues(qualityData) {
    const issues = [];
    if (qualityData.audio?.stats?.packetLossRate > 0.05) {
      issues.push("audio_packet_loss");
    }
    if (qualityData.video?.stats?.packetLossRate > 0.05) {
      issues.push("video_packet_loss");
    }
    if (qualityData.network?.stats?.roundTripTime > 300) {
      issues.push("high_latency");
    }
    if (qualityData.audio?.stats?.jitter > 50) {
      issues.push("audio_jitter");
    }
    return issues;
  }
  async restoreParticipants() {
    const stored = await this.ctx.storage.get("roomData");
    if (stored) {
      this.roomData = stored;
      const activeParticipants = this.getActiveParticipants();
      this.roomData.participants = activeParticipants;
      if (activeParticipants.length !== stored.participants.length) {
        await this.saveRoomData();
      }
    }
  }
};

// src/durable/UserPresence.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
import { DurableObject as DurableObject2 } from "cloudflare:workers";

// src/services/userStatus.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function isoNow() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(isoNow, "isoNow");
async function updateUserStatus(env2, userId, status, options = {}) {
  const payload = {
    userId,
    status,
    sessionId: options.sessionId ?? null,
    deviceInfo: options.deviceInfo ?? null,
    metadata: options.metadata ?? null,
    updatedAt: isoNow()
  };
  const result = await env2.DB.prepare(
    `UPDATE user_status
       SET status = ?,
           current_session_id = ?,
           device_info = ?,
           last_seen_at = ?,
           updated_at = ?
     WHERE user_id = ?`
  ).bind(status, options.sessionId ?? null, options.deviceInfo ?? null, payload.updatedAt, payload.updatedAt, userId).run();
  if (result.changes === 0) {
    await env2.DB.prepare(
      `INSERT INTO user_status (
          user_id,
          status,
          last_seen_at,
          device_info,
          current_session_id,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      userId,
      status,
      payload.updatedAt,
      options.deviceInfo ?? null,
      options.sessionId ?? null,
      payload.updatedAt,
      payload.updatedAt
    ).run();
  }
}
__name(updateUserStatus, "updateUserStatus");
async function touchUserStatus(env2, userId) {
  const now = isoNow();
  const result = await env2.DB.prepare(
    `UPDATE user_status
       SET last_seen_at = ?,
           updated_at = ?
     WHERE user_id = ?`
  ).bind(now, now, userId).run();
  if (result.changes === 0) {
    await env2.DB.prepare(
      `INSERT INTO user_status (
          user_id,
          status,
          last_seen_at,
          device_info,
          current_session_id,
          created_at,
          updated_at
        ) VALUES (?, 'OFFLINE', ?, NULL, NULL, ?, ?)`
    ).bind(userId, now, now, now).run();
  }
}
__name(touchUserStatus, "touchUserStatus");
async function setInactiveUsersOffline(env2, cutoffMinutes) {
  const now = isoNow();
  const cutoffDate = new Date(Date.now() - cutoffMinutes * 60 * 1e3).toISOString();
  const result = await env2.DB.prepare(
    `UPDATE user_status
        SET status = 'OFFLINE',
            current_session_id = NULL,
            updated_at = ?,
            device_info = device_info
      WHERE status != 'OFFLINE'
        AND last_seen_at IS NOT NULL
        AND last_seen_at < ?`
  ).bind(now, cutoffDate).run();
  return result.changes ?? 0;
}
__name(setInactiveUsersOffline, "setInactiveUsersOffline");

// src/durable/UserPresence.ts
var STATUS_KEY = "status";
var ONLINE_LIST_PREFIX = "presence:online";
var SESSION_PREFIX2 = "presence:session";
var INACTIVE_THRESHOLD_MS = 15 * 60 * 1e3;
var UserPresence = class extends DurableObject2 {
  static {
    __name(this, "UserPresence");
  }
  constructor(state, env2) {
    super(state, env2);
    this.env = env2;
    this.userId = state.id.toString();
  }
  async ensureState() {
    const cached = await this.ctx.storage.get(STATUS_KEY);
    if (cached) {
      return cached;
    }
    const row = await this.env.DB.prepare(
      `SELECT status, last_seen_at, device_info, current_session_id
         FROM user_status WHERE user_id = ? LIMIT 1`
    ).bind(this.userId).first();
    if (!row) {
      return null;
    }
    const state = {
      userId: this.userId,
      status: row.status ?? "OFFLINE",
      lastSeenAt: row.last_seen_at ?? (/* @__PURE__ */ new Date()).toISOString(),
      deviceInfo: row.device_info ?? void 0,
      sessionId: row.current_session_id ?? void 0
    };
    await this.ctx.storage.put(STATUS_KEY, state);
    await this.updateIndexes(state);
    return state;
  }
  async setStatus(request) {
    const body = await request.json();
    const state = {
      ...body,
      userId: body.userId ?? this.userId,
      lastSeenAt: body.lastSeenAt ?? (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.ctx.storage.put(STATUS_KEY, state);
    await this.updateIndexes(state);
    await updateUserStatus(this.env, state.userId, state.status, {
      sessionId: state.sessionId,
      deviceInfo: state.deviceInfo
    });
    return new Response(JSON.stringify(state), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  async touch() {
    const current = await this.ctx.storage.get(STATUS_KEY) ?? await this.ensureState();
    if (!current) {
      return new Response(JSON.stringify({ success: false, reason: "USER_NOT_FOUND" }), { status: 404 });
    }
    const updated = {
      ...current,
      lastSeenAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.ctx.storage.put(STATUS_KEY, updated);
    await this.updateIndexes(updated);
    await touchUserStatus(this.env, updated.userId);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  async getStatus() {
    const current = await this.ctx.storage.get(STATUS_KEY) ?? await this.ensureState();
    if (!current) {
      return new Response(JSON.stringify({ status: "OFFLINE" }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify(current), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  async setOffline() {
    const current = await this.ctx.storage.get(STATUS_KEY) ?? await this.ensureState();
    if (!current) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
    const updated = {
      ...current,
      status: "OFFLINE",
      sessionId: void 0,
      lastSeenAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.ctx.storage.put(STATUS_KEY, updated);
    await this.updateIndexes(updated, { removeFromSession: current.sessionId });
    await updateUserStatus(this.env, updated.userId, "OFFLINE");
    return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  async alarm() {
    const current = await this.ctx.storage.get(STATUS_KEY);
    if (!current) {
      return;
    }
    const lastSeen = new Date(current.lastSeenAt).getTime();
    if (Date.now() - lastSeen > INACTIVE_THRESHOLD_MS && current.status !== "OFFLINE") {
      await this.setOffline();
    } else {
      await this.scheduleAlarm();
    }
  }
  async fetch(request) {
    const url = new URL(request.url);
    switch (url.pathname) {
      case "/status":
        return this.getStatus();
      case "/set":
        if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
        await this.scheduleAlarm();
        return this.setStatus(request);
      case "/touch":
        if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
        await this.scheduleAlarm();
        return this.touch();
      case "/offline":
        if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
        return this.setOffline();
      default:
        return new Response("Not Found", { status: 404 });
    }
  }
  async updateIndexes(state, options = {}) {
    const { status, userId, sessionId } = state;
    if (!userId) return;
    if (status === "ONLINE" || status === "STUDYING" || status === "AWAY") {
      await this.env.CACHE.put(`${ONLINE_LIST_PREFIX}:${userId}`, state.status, { expirationTtl: 60 * 10 });
    } else {
      await this.env.CACHE.delete(`${ONLINE_LIST_PREFIX}:${userId}`);
    }
    if (sessionId) {
      await this.env.CACHE.put(`${SESSION_PREFIX2}:${sessionId}:${userId}`, state.status, { expirationTtl: 60 * 10 });
    }
    if (options.removeFromSession) {
      await this.env.CACHE.delete(`${SESSION_PREFIX2}:${options.removeFromSession}:${userId}`);
    }
  }
  async scheduleAlarm() {
    const alarmTime = Date.now() + INACTIVE_THRESHOLD_MS;
    await this.ctx.storage.setAlarm(alarmTime);
  }
};

// src/durable/ChatHub.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
init_errors();
init_jwt4();
init_security();
function nowIso6() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(nowIso6, "nowIso");
function parseStompFrame(raw2) {
  const trimmed = raw2.replace(/\r/g, "");
  if (!trimmed.trim()) {
    return null;
  }
  const parts = trimmed.split("\n");
  const command = parts.shift() ?? "";
  const headers = {};
  while (parts.length > 0) {
    const line = parts.shift();
    if (line === "") {
      break;
    }
    const idx = line.indexOf(":");
    if (idx > -1) {
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      headers[key] = value;
    }
  }
  const body = parts.join("\n");
  return { command, headers, body };
}
__name(parseStompFrame, "parseStompFrame");
function serializeStompFrame(frame) {
  const headerLines = Object.entries(frame.headers).map(([key, value]) => `${key}:${value}`).join("\n");
  return `${frame.command}
${headerLines}

${frame.body}\0`;
}
__name(serializeStompFrame, "serializeStompFrame");
function normalizeDestination(destination, userId) {
  if (destination.startsWith("/user/")) {
    const keyUser = userId ?? "";
    return `${destination}|${keyUser}`;
  }
  return destination;
}
__name(normalizeDestination, "normalizeDestination");
function safeJsonParse(input) {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}
__name(safeJsonParse, "safeJsonParse");
function buildMessageFrame(subscriptionId, destination, body) {
  return {
    command: "MESSAGE",
    headers: {
      subscription: subscriptionId,
      "message-id": crypto.randomUUID(),
      destination,
      "content-type": "application/json"
    },
    body: JSON.stringify(body ?? null)
  };
}
__name(buildMessageFrame, "buildMessageFrame");
var ChatHub = class {
  constructor(state, env2) {
    this.state = state;
    this.env = env2;
    this.connections = /* @__PURE__ */ new Map();
    this.destinationMap = /* @__PURE__ */ new Map();
  }
  static {
    __name(this, "ChatHub");
  }
  async fetch(request) {
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader && upgradeHeader.toLowerCase() === "websocket") {
      const pair = new WebSocketPair();
      const client = pair[0];
      const server = pair[1];
      this.acceptWebSocket(server);
      return new Response(null, { status: 101, webSocket: client });
    }
    if (request.method === "POST") {
      const event = await request.json();
      await this.publish(event.destination, event.payload, event.userId);
      return new Response(null, { status: 204 });
    }
    return new Response("Not Found", { status: 404 });
  }
  acceptWebSocket(socket, userId) {
    const id = crypto.randomUUID();
    const state = {
      id,
      userId: userId ?? "",
      subscriptions: /* @__PURE__ */ new Map(),
      buffer: ""
    };
    this.connections.set(socket, state);
    socket.accept();
    socket.addEventListener("message", (event) => {
      if (typeof event.data !== "string") {
        return;
      }
      state.buffer += event.data;
      let frameEnd = state.buffer.indexOf("\0");
      while (frameEnd >= 0) {
        const rawFrame = state.buffer.slice(0, frameEnd);
        state.buffer = state.buffer.slice(frameEnd + 1);
        const frame = parseStompFrame(rawFrame);
        if (frame) {
          this.handleFrame(socket, state, frame).catch((error3) => {
            console.error("[ChatHub] Failed to handle frame", error3);
          });
        }
        frameEnd = state.buffer.indexOf("\0");
      }
    });
    socket.addEventListener("close", () => {
      this.cleanup(socket);
    });
    socket.addEventListener("error", () => {
      this.cleanup(socket);
    });
  }
  async handleFrame(socket, state, frame) {
    switch (frame.command) {
      case "CONNECT": {
        const auth2 = await this.authenticateConnection(frame.headers);
        if (!auth2) {
          this.sendError(socket, "Unauthorized");
          socket.close(1008, "Unauthorized");
          return;
        }
        state.userId = auth2.id;
        const profile3 = await this.getUserProfile(auth2.id);
        state.profile = {
          name: profile3.name ?? auth2.name,
          profileImage: profile3.profileImage
        };
        this.sendFrame(socket, {
          command: "CONNECTED",
          headers: {
            version: "1.2",
            "heart-beat": "0,0"
          },
          body: ""
        });
        break;
      }
      case "SUBSCRIBE": {
        const destination = frame.headers.destination;
        const subscriptionId = frame.headers.id;
        if (!destination || !subscriptionId) {
          this.sendError(socket, "SUBSCRIBE frame missing destination or id");
          return;
        }
        const key = normalizeDestination(destination, state.userId);
        state.subscriptions.set(subscriptionId, key);
        let subMap = this.destinationMap.get(key);
        if (!subMap) {
          subMap = /* @__PURE__ */ new Map();
          this.destinationMap.set(key, subMap);
        }
        subMap.set(socket, subscriptionId);
        break;
      }
      case "UNSUBSCRIBE": {
        const subscriptionId = frame.headers.id;
        if (!subscriptionId) {
          return;
        }
        const key = state.subscriptions.get(subscriptionId);
        if (!key) {
          return;
        }
        state.subscriptions.delete(subscriptionId);
        const subMap = this.destinationMap.get(key);
        subMap?.delete(socket);
        if (subMap && subMap.size === 0) {
          this.destinationMap.delete(key);
        }
        break;
      }
      case "SEND": {
        const destination = frame.headers.destination;
        if (!destination) {
          this.sendError(socket, "SEND frame missing destination");
          return;
        }
        await this.handleSend(socket, destination, frame.body, state);
        break;
      }
      case "DISCONNECT": {
        socket.close(1e3, "Client disconnect");
        break;
      }
      default:
        break;
    }
  }
  async handleSend(socket, destination, body, state) {
    if (!state.userId) {
      this.sendError(socket, "Unauthorized");
      socket.close(1008, "Unauthorized");
      return;
    }
    if (destination === "/pub/chat/message") {
      const parsed = safeJsonParse(body) ?? {};
      const roomId = Number(parsed.roomId);
      if (!Number.isFinite(roomId)) {
        throw new AppError("roomId\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.", 400, "INVALID_ROOM_ID");
      }
      const message = await createChatMessage(this.env, state.userId, {
        roomId,
        message: parsed.message,
        imageUrls: parsed.imageUrls,
        audioData: parsed.audioData,
        audioUrl: parsed.audioUrl,
        messageType: parsed.messageType
      });
      await this.publish(`/sub/chat/room/${message.roomId}`, message);
    } else if (destination === "/pub/chat/typing") {
      const payload = safeJsonParse(body);
      if (!payload || !Number.isFinite(payload.roomId)) {
        return;
      }
      const profile3 = state.profile ?? await this.getUserProfile(state.userId);
      state.profile = profile3;
      await this.publish(`/sub/chat/room/${payload.roomId}/typing`, {
        userId: state.userId,
        userName: profile3.name,
        userProfileImage: profile3.profileImage,
        isTyping: Boolean(payload.isTyping),
        timestamp: nowIso6()
      });
    }
  }
  async authenticateConnection(headers) {
    const authorization = headers["Authorization"] ?? headers["authorization"];
    if (!authorization) {
      return null;
    }
    const match = authorization.match(/^Bearer (.+)$/i);
    if (!match) {
      return null;
    }
    try {
      const secret = assertEnvVar(this.env.JWT_SECRET, "JWT_SECRET");
      const verifyOptions = { alg: "HS512" };
      const issuer = this.env.JWT_ISSUER ?? this.env.API_BASE_URL;
      if (issuer) {
        verifyOptions.iss = issuer;
      }
      const payload = await verify2(match[1], secret, verifyOptions);
      const id = payload.sub ? String(payload.sub) : "";
      if (!id) {
        return null;
      }
      return { id, name: payload.name };
    } catch {
      return null;
    }
  }
  async getUserProfile(userId) {
    const row = await queryFirst(
      this.env.DB,
      "SELECT name, profile_image FROM users WHERE user_id = ? LIMIT 1",
      [userId]
    );
    return {
      name: row?.name ?? void 0,
      profileImage: row?.profile_image ?? void 0
    };
  }
  async publish(destination, payload, userId) {
    const key = normalizeDestination(destination, userId);
    const subscribers = this.destinationMap.get(key);
    if (!subscribers || subscribers.size === 0) {
      return;
    }
    for (const [socket, subscriptionId] of subscribers.entries()) {
      if (socket.readyState !== WebSocket.OPEN) {
        continue;
      }
      this.sendFrame(socket, buildMessageFrame(subscriptionId, destination, payload));
    }
  }
  sendFrame(socket, frame) {
    try {
      socket.send(serializeStompFrame(frame));
    } catch (error3) {
      console.error("[ChatHub] Failed to send frame", error3);
      socket.close(1011, "Frame send error");
    }
  }
  sendError(socket, message) {
    this.sendFrame(socket, {
      command: "ERROR",
      headers: { message },
      body: message
    });
  }
  cleanup(socket) {
    const state = this.connections.get(socket);
    if (!state) {
      return;
    }
    for (const [subscriptionId, key] of state.subscriptions.entries()) {
      const subMap = this.destinationMap.get(key);
      subMap?.delete(socket);
      if (subMap && subMap.size === 0) {
        this.destinationMap.delete(key);
      }
    }
    this.connections.delete(socket);
  }
};

// src/middleware/index.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/middleware/logger.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/middleware/request-id/index.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/middleware/request-id/request-id.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/index.ts
init_analytics();

// src/websocket/notificationSocket.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_jwt4();
init_security();
var HEARTBEAT_INTERVAL_MS = 25e3;
var NOTIFICATION_POLL_INTERVAL_MS = 15e3;
var MAX_SENT_HISTORY = 200;
async function handleNotificationWebSocket(c) {
  const url = new URL(c.req.url);
  const token = url.searchParams.get("token") ?? extractBearerToken(c.req.header("Authorization")) ?? "";
  const user = await verifyUserToken(token, c.env);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { 0: client, 1: server } = new WebSocketPair();
  const session = new NotificationSocketSession(server, c.env, user.id);
  session.start();
  return new Response(null, { status: 101, webSocket: client });
}
__name(handleNotificationWebSocket, "handleNotificationWebSocket");
function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader) return void 0;
  const match = authorizationHeader.match(/^Bearer (.+)$/i);
  return match?.[1];
}
__name(extractBearerToken, "extractBearerToken");
async function verifyUserToken(token, env2) {
  if (!token) return null;
  try {
    const secret = assertEnvVar(env2.JWT_SECRET, "JWT_SECRET");
    const verifyOptions = { alg: "HS512" };
    const issuer = env2.JWT_ISSUER ?? env2.API_BASE_URL;
    if (issuer) {
      verifyOptions.iss = issuer;
    }
    const payload = await verify2(token, secret, verifyOptions);
    if (typeof payload.sub !== "string") {
      return null;
    }
    return { id: payload.sub };
  } catch (error3) {
    console.error("[notifications-ws] Failed to verify token", error3);
    return null;
  }
}
__name(verifyUserToken, "verifyUserToken");
var NotificationSocketSession = class {
  constructor(ws, env2, userId) {
    this.buffer = "";
    this.connected = false;
    this.subscriptions = /* @__PURE__ */ new Map();
    this.sentHistory = /* @__PURE__ */ new Set();
    this.sentOrder = [];
    this.ws = ws;
    this.env = env2;
    this.userId = userId;
  }
  static {
    __name(this, "NotificationSocketSession");
  }
  start() {
    this.ws.accept();
    this.ws.addEventListener("message", (event) => {
      this.handleIncomingData(event.data);
    });
    this.ws.addEventListener("close", () => {
      this.cleanup();
    });
    this.ws.addEventListener("error", (event) => {
      console.error("[notifications-ws] Socket error", event);
      this.cleanup();
    });
  }
  handleIncomingData(data) {
    const text = typeof data === "string" ? data : data instanceof ArrayBuffer ? new TextDecoder().decode(data) : "";
    if (!text) {
      return;
    }
    this.buffer += text;
    while (true) {
      const terminatorIndex = this.buffer.indexOf("\0");
      if (terminatorIndex === -1) {
        break;
      }
      const frameText = this.buffer.slice(0, terminatorIndex);
      this.buffer = this.buffer.slice(terminatorIndex + 1);
      const trimmed = frameText.trim();
      if (trimmed === "") {
        continue;
      }
      const frame = this.parseFrame(frameText);
      if (frame) {
        this.handleFrame(frame);
      }
    }
  }
  parseFrame(raw2) {
    const lines = raw2.split("\n");
    if (!lines.length) return null;
    const command = lines.shift()?.trim() ?? "";
    if (!command) return null;
    const headers = {};
    let line;
    while ((line = lines.shift()) !== void 0) {
      if (line === "") break;
      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) continue;
      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      headers[key] = value;
    }
    const body = lines.join("\n");
    return { command, headers, body };
  }
  handleFrame(frame) {
    const { command } = frame;
    switch (command) {
      case "CONNECT":
      case "STOMP":
        this.handleConnect(frame);
        break;
      case "SUBSCRIBE":
        this.handleSubscribe(frame);
        break;
      case "UNSUBSCRIBE":
        this.handleUnsubscribe(frame);
        break;
      case "DISCONNECT":
        this.handleDisconnect(frame);
        break;
      case "SEND":
        this.ackReceipt(frame.headers["receipt"]);
        break;
      default:
        console.warn("[notifications-ws] Unsupported STOMP command", command);
        this.sendError(`Unsupported command: ${command}`);
    }
  }
  handleConnect(frame) {
    if (this.connected) {
      return;
    }
    const heartbeatHeader = frame.headers["heart-beat"] ?? "0,0";
    const [, clientHeartbeatRaw] = heartbeatHeader.split(",");
    const clientHeartbeat = Number(clientHeartbeatRaw) || 0;
    const serverHeartbeat = Math.max(clientHeartbeat, HEARTBEAT_INTERVAL_MS);
    this.connected = true;
    this.sendFrame("CONNECTED", {
      version: "1.2",
      "heart-beat": `0,${serverHeartbeat}`
    });
    this.scheduleHeartbeat(serverHeartbeat);
  }
  scheduleHeartbeat(interval) {
    if (interval <= 0) return;
    const sendBeat = /* @__PURE__ */ __name(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send("\n");
        this.heartbeatTimer = setTimeout(sendBeat, interval);
      }
    }, "sendBeat");
    this.heartbeatTimer = setTimeout(sendBeat, interval);
  }
  handleSubscribe(frame) {
    const id = frame.headers["id"] ?? crypto.randomUUID();
    const destination = frame.headers["destination"];
    if (!destination) {
      this.sendError("SUBSCRIBE frame missing destination header");
      return;
    }
    this.subscriptions.set(id, { destination });
    if (destination.includes("notifications")) {
      this.startNotificationPolling(id, destination);
    }
    this.ackReceipt(frame.headers["receipt"]);
  }
  handleUnsubscribe(frame) {
    const id = frame.headers["id"];
    if (!id) {
      this.sendError("UNSUBSCRIBE frame missing id header");
      return;
    }
    this.stopNotificationPolling(id);
    this.subscriptions.delete(id);
    this.ackReceipt(frame.headers["receipt"]);
  }
  handleDisconnect(frame) {
    this.ackReceipt(frame.headers["receipt"]);
    this.cleanup();
    this.ws.close(1e3, "Client disconnected");
  }
  ackReceipt(receiptId) {
    if (!receiptId) return;
    this.sendFrame("RECEIPT", { "receipt-id": receiptId });
  }
  sendError(message) {
    this.sendFrame("ERROR", { message }, message);
  }
  sendFrame(command, headers = {}, body = "") {
    if (this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    const headerLines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
    const frame = [command, ...headerLines, "", body, "\0"].join("\n");
    this.ws.send(frame);
  }
  async startNotificationPolling(subscriptionId, destination) {
    const poll = /* @__PURE__ */ __name(async () => {
      try {
        await this.sendNotificationSnapshot(subscriptionId, destination);
      } catch (error3) {
        console.error("[notifications-ws] Failed to send notification snapshot", error3);
      }
      const context2 = this.subscriptions.get(subscriptionId);
      if (!context2) return;
      context2.pollTimer = setTimeout(poll, NOTIFICATION_POLL_INTERVAL_MS);
    }, "poll");
    await poll();
  }
  stopNotificationPolling(subscriptionId) {
    const context2 = this.subscriptions.get(subscriptionId);
    if (context2?.pollTimer) {
      clearTimeout(context2.pollTimer);
    }
  }
  async sendNotificationSnapshot(subscriptionId, destination) {
    const result = await listNotifications(this.env, this.userId, {
      page: 1,
      size: 20,
      unreadOnly: true
    });
    const freshNotifications = result.data.filter((item) => this.registerNotification(item.id));
    for (const notification of freshNotifications) {
      const payload = this.serializeNotification(notification, result.unreadCount);
      this.sendFrame("MESSAGE", {
        subscription: subscriptionId,
        "message-id": crypto.randomUUID(),
        destination,
        "content-type": "application/json"
      }, payload);
    }
  }
  registerNotification(notificationId) {
    if (this.sentHistory.has(notificationId)) {
      return false;
    }
    this.sentHistory.add(notificationId);
    this.sentOrder.push(notificationId);
    if (this.sentOrder.length > MAX_SENT_HISTORY) {
      const expired = this.sentOrder.shift();
      if (typeof expired === "number") {
        this.sentHistory.delete(expired);
      }
    }
    return true;
  }
  serializeNotification(notification, unreadCount) {
    const payload = {
      ...notification,
      unreadCount,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    return JSON.stringify(payload);
  }
  cleanup() {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = void 0;
    }
    for (const [id, context2] of this.subscriptions.entries()) {
      if (context2.pollTimer) {
        clearTimeout(context2.pollTimer);
      }
      this.subscriptions.delete(id);
    }
  }
};

// src/index.ts
var scheduled = /* @__PURE__ */ __name(async (controller, env2, ctx) => {
  const job = (async () => {
    try {
      const changed = await setInactiveUsersOffline(env2, 15);
      if (changed > 0) {
        console.log(`[presence-cron] Marked ${changed} users offline.`);
      }
    } catch (error3) {
      console.error("[presence-cron] Failed to update inactive users", error3);
    }
    try {
      const delivered = await processScheduledNotifications(env2);
      if (delivered > 0) {
        console.log(`[notifications-cron] Delivered ${delivered} scheduled notifications.`);
      }
    } catch (error3) {
      console.error("[notifications-cron] Failed to process scheduled notifications", error3);
    }
  })();
  ctx.waitUntil(job);
}, "scheduled");
var API_VERSION = "v1";
var app8 = new Hono2();
app8.use("*", errorHandler2);
app8.use(errorTrackingMiddleware);
app8.use(analyticsMiddleware);
app8.use("*", async (c, next) => {
  const corsOrigin = c.env?.CORS_ORIGIN || "http://localhost:3000";
  const allowedOrigins = corsOrigin.split(",").map((o) => o.trim());
  const corsMiddleware = cors({
    origin: /* @__PURE__ */ __name((origin) => {
      if (!origin) return corsOrigin;
      if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
        return origin;
      }
      return allowedOrigins[0];
    }, "origin"),
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Request-ID", "X-API-Key"],
    exposeHeaders: ["Content-Length", "X-Request-ID", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
    maxAge: 86400,
    credentials: true
  });
  return corsMiddleware(c, next);
});
app8.get("/ws/chat", (c) => {
  const id = c.env.CHAT_HUB.idFromName("global");
  const stub = c.env.CHAT_HUB.get(id);
  return stub.fetch(c.req.raw);
});
app8.get("/ws/notifications", (c) => handleNotificationWebSocket(c));
app8.get("/", (c) => {
  return successResponse(c, {
    name: "STUDYMATE API",
    version: API_VERSION,
    status: "operational",
    documentation: "/api/docs",
    endpoints: {
      health: "/health",
      levelTest: `/api/${API_VERSION}/level-test`,
      webrtc: `/api/${API_VERSION}/room`,
      upload: `/api/${API_VERSION}/upload`,
      whisper: `/api/${API_VERSION}/whisper`,
      llm: `/api/${API_VERSION}/llm`,
      images: `/api/${API_VERSION}/images`,
      cache: `/api/${API_VERSION}/cache`,
      transcribe: `/api/${API_VERSION}/transcribe`,
      analytics: `/api/${API_VERSION}/analytics`,
      translate: `/api/${API_VERSION}/translate`
    }
  });
});
app8.get("/health", (c) => {
  return successResponse(c, {
    status: "healthy",
    environment: c.env?.ENVIRONMENT,
    version: API_VERSION,
    services: {
      ai: "operational",
      storage: "operational",
      cache: "operational",
      durableObjects: "operational"
    }
  });
});
app8.get("/metrics", (c) => {
  return c.text(`# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",endpoint="/health"} 1
`);
});
var v1 = new Hono2();
v1.route("/auth", auth_default);
v1.route("/login", auth_default);
v1.route("/users", users_default);
v1.route("/onboarding", onboarding_default);
v1.route("/sessions", sessions_default);
v1.route("/notifications", notifications_default);
v1.route("/group-sessions", groupSessions_default);
v1.route("/group-sessions/ai", groupSessionsAI_default);
v1.route("/presence", presence_default);
v1.route("/matching", matching_default);
v1.route("/achievements", achievements_default);
v1.route("/chat", chat_default);
v1.route("/settings", settings_default);
v1.route("/level-test", levelTestRoutes);
v1.route("/room", webrtcRoutes);
v1.route("/upload", uploadRoutes);
v1.route("/whisper", whisper_default);
v1.route("/llm", llm_default);
v1.route("/images", images_default);
v1.route("/cache", cache_default);
v1.route("/transcribe", transcribe_default);
v1.route("/translate", translate_default);
v1.route("/analytics", app7);
v1.route("/internal", internal_default);
app8.route(`/api/${API_VERSION}`, v1);
app8.get(`/api/${API_VERSION}/health`, (c) => {
  return successResponse(c, {
    status: "healthy",
    environment: c.env?.ENVIRONMENT,
    version: API_VERSION,
    services: {
      ai: "operational",
      storage: "operational",
      cache: "operational",
      durableObjects: "operational"
    }
  });
});
app8.get("/login/oauth2/code/:provider", async (c) => {
  const provider = c.req.param("provider");
  const code = c.req.query("code");
  const state = c.req.query("state") || void 0;
  if (!code) {
    return c.json({
      success: false,
      error: {
        message: "Missing OAuth code",
        code: "INVALID_OAUTH_CALLBACK"
      }
    }, 400);
  }
  const { handleOAuthCallback: handleOAuthCallback2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
  const { AppError: AppError2 } = await Promise.resolve().then(() => (init_errors(), errors_exports));
  try {
    const result = await handleOAuthCallback2(
      c.env,
      provider,
      { code, state },
      {
        userAgent: c.req.header("User-Agent") || void 0,
        ipAddress: c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || c.req.header("X-Real-IP") || void 0
      }
    );
    const acceptsJson = (c.req.header("Accept") || "").includes("application/json");
    if (!acceptsJson) {
      const redirectTarget = result.callbackUrl || result.redirectUri;
      if (!redirectTarget) {
        return successResponse(c, result);
      }
      const redirectUrl = new URL(redirectTarget);
      redirectUrl.searchParams.set("accessToken", result.accessToken);
      redirectUrl.searchParams.set("refreshToken", result.refreshToken);
      redirectUrl.searchParams.set("provider", provider);
      if (state) {
        redirectUrl.searchParams.set("state", state);
      }
      if (result.redirectUri && result.redirectUri !== redirectTarget) {
        redirectUrl.searchParams.set("redirect", result.redirectUri);
      }
      return c.redirect(redirectUrl.toString());
    }
    return successResponse(c, result);
  } catch (error3) {
    if (error3 instanceof AppError2) {
      throw error3;
    }
    const message = error3 instanceof Error ? error3.message : "Authentication failure";
    throw new AppError2(message, 500, "AUTH_OPERATION_FAILED");
  }
});
app8.notFound(notFoundHandler2);
var fetchHandler = /* @__PURE__ */ __name((request, env2, ctx) => app8.fetch(request, env2, ctx), "fetchHandler");
var worker = {
  fetch: fetchHandler,
  scheduled
};
var src_default = worker;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-e6xCjn/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-e6xCjn/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker2) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker2;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker2.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker2.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker2,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker2.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker2.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  ChatHub,
  UserPresence,
  WebRTCRoom,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  app8 as app,
  middleware_loader_entry_default as default,
  scheduled
};
//# sourceMappingURL=index.js.map

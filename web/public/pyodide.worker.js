// Pyodide Web Worker
// 从 CDN 加载 Pyodide，接收主线程的代码并在沙箱中执行
// 主线程通过 5 秒超时 + worker.terminate() 防止死循环卡住浏览器

const PYODIDE_VERSION = '0.27.0';
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full`;

importScripts(`${PYODIDE_URL}/pyodide.js`);

// issue #289/#290：Pyodide 沙箱是单线程，浏览器事件循环始终在运行，用户代码里的
// asyncio.run() 会撞上「asyncio.run() cannot be called from a running event loop」
// 而报错——连 async 章节 4 道题的标准答案也跑不通。修法是在执行用户代码前，把
// asyncio.run 换成「把协程调度成 task」：不再去抢已在跑的事件循环，而是交给它，
// 由下面的 ASYNCIO_DRAIN 在用户代码结束后统一 await 到完成。
const ASYNCIO_PATCH =
  `import asyncio as __aio\n` +
  `def __pyodide_asyncio_run(__main, *, debug=None):\n` +
  `    return __aio.get_running_loop().create_task(__main)\n` +
  `__aio.run = __pyodide_asyncio_run\n`;

// 收尾：把本次运行新建、但还没跑完的协程 task 全部 await 到结束。用 while 反复
// 扫描，处理 task 里再派生 task 的情况；必须排除 current_task() 自己，否则
// gather 会把这段收尾代码自身也等进去 → 永久死锁。
const ASYNCIO_DRAIN =
  `import asyncio as __aio\n` +
  `while True:\n` +
  `    __cur = __aio.current_task()\n` +
  `    __pending = [__t for __t in __aio.all_tasks() if not __t.done() and __t is not __cur]\n` +
  `    if not __pending:\n` +
  `        break\n` +
  `    await __aio.gather(*__pending)\n`;

// 练习题判分用「隔离命名空间」执行：每次 run 前新建一个空 dict 当命名空间，跑完即销毁。
// 起因——worker 复用同一个 pyodide 实例（见 pyodideSingleton.ts：跨题/跨路由存活，只有
// timeout 才重建）。若所有运行都共用 pyodide.globals，上一道题定义的变量会残留：新手常把
// 内置名当变量（max = .. / list = [..] / tuple = ..），一旦覆盖，本会话后续用到该内置的题
// 连标准答案都跑不通，重载页面才好——issue #296/#301。
// 为什么不直接「每次清空 globals」：教学代码块（RunnableCodeBlock）共用同一个 worker，且
// 故意「接着上一块累积变量」（前块 import re / 定义 Color，后块直接用）。清空 globals 会把
// 这些教学块全改崩成 NameError。所以按用途分两条命名空间：
//   - 练习题（msg.isolated=true）：每次跑在全新 dict 里 → 互不污染、也不碰教学累积状态；
//   - 教学块（msg.isolated 缺省）：仍跑在共享的 pyodide.globals 里 → 保持跨块累积。
// 隔离 dict 预置 __name__='__main__'，模拟「直接运行脚本」语义（否则 if __name__ 取不到名）；
// __builtins__ 由 CPython 首次 exec 时自动注入，故内置函数照常可用。
function makeRunGlobals(isolated) {
  return isolated ? pyodide.toPy({ __name__: '__main__' }) : null;
}

let pyodide = null;
let initPromise = null;

async function initPyodide() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    // eslint-disable-next-line no-undef
    pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
    self.postMessage({ type: 'ready' });
  })();
  return initPromise;
}

// run 串行链。onmessage 是 async 的，两条 'run' 消息会交错执行，而 sys.stdout 重定向、
// asyncio 任务收尾（ASYNCIO_DRAIN 的 all_tasks）都是解释器级全局状态——交错时两次运行的
// DRAIN 会互相 gather 对方，直接死锁（教学块与练习并发即可触发，worker 假死 → 5 秒超时
// 整体重载）。这里把所有 run 排进一条 promise 链，上一个完全结束才开始下一个。
let runChain = Promise.resolve();

self.onmessage = (event) => {
  const msg = event.data;

  if (msg.type === 'init') {
    initPyodide().catch((e) => {
      self.postMessage({ type: 'init-error', error: String(e) });
    });
    return;
  }

  if (msg.type === 'run') {
    runChain = runChain
      .then(() => handleRun(msg))
      .catch((e) => {
        // handleRun 意外抛错的兜底：保证链不断、主线程必有回包
        // （否则只能等 5 秒超时，误报「死循环」并重载整个 worker）
        try {
          self.postMessage({
            type: 'result',
            runId: msg.runId,
            stdout: '',
            stderr: '',
            vars: {},
            astNodes: [],
            error: (e && e.message) || String(e),
          });
        } catch (_) { /* ignore */ }
      });
  }
};

async function handleRun(msg) {
  if (!pyodide) {
    self.postMessage({
      type: 'result',
      runId: msg.runId,
      stdout: '',
      stderr: '',
      vars: {},
      astNodes: [],
      error: 'Pyodide 未初始化',
    });
    return;
  }

  // 选择本次运行的命名空间：练习题隔离（全新 dict）、教学块共享（默认 globals，runNs=null）。
  // runOpts 透传给本次所有 runPython/runPythonAsync，确保重定向、用户代码、收尾、取变量、
  // AST 都在同一命名空间里（详见顶部 makeRunGlobals）。
  const runNs = makeRunGlobals(msg.isolated);
  const runOpts = runNs ? { globals: runNs } : undefined;

  // 用 io.StringIO 重定向 stdout/stderr：比 setStdout({batched}) 更稳定，
  // 能完整捕获所有字符（包括 trailing \n），中文 UTF-8 也不会出错。
  pyodide.runPython(
    `import io, sys\n` +
    `__captured_stdout = io.StringIO()\n` +
    `__captured_stderr = io.StringIO()\n` +
    `sys.stdout = __captured_stdout\n` +
    `sys.stderr = __captured_stderr\n`,
    runOpts
  );

  let error;
  try {
    // 先打上 asyncio.run 补丁（见文件顶部 ASYNCIO_PATCH），再执行用户代码
    pyodide.runPython(ASYNCIO_PATCH, runOpts);
    await pyodide.runPythonAsync(msg.code, runOpts);
  } catch (e) {
    error = e.message || String(e);
  }
  // 不论上面成功还是失败，都把本次产生的协程 task 收尾跑完：既能拿到协程内的
  // print 输出，也避免残留 task 污染下一次运行（worker 复用同一个 pyodide）。
  try {
    await pyodide.runPythonAsync(ASYNCIO_DRAIN, runOpts);
  } catch (e) {
    // 协程内部抛的异常会在这里冒出来——保留它作为给用户的报错
    if (!error) error = e.message || String(e);
  }

  let stdout = '';
  let stderr = '';
  try {
    stdout = pyodide.runPython(
      `import sys\n` +
      `sys.stdout.flush()\n` +
      `__r = __captured_stdout.getvalue()\n` +
      `sys.stdout = sys.__stdout__\n` +
      `__r`,
      runOpts
    ) || '';
    stderr = pyodide.runPython(
      `import sys\n` +
      `sys.stderr.flush()\n` +
      `__r = __captured_stderr.getvalue()\n` +
      `sys.stderr = sys.__stderr__\n` +
      `__r`,
      runOpts
    ) || '';
  } catch (_) { /* ignore */ }

  // 收集指定的全局变量值
  // dict_converter: Object.fromEntries —— 把 Python dict 转成 plain JS object，
  // 否则 toJs() 默认返回 Map，内部嵌套的 PyProxy 引用会让跨 worker 的 postMessage
  // 报 "[object Map] could not be cloned"，主线程永不收到 result → 5 秒超时（issue #281）
  const vars = {};
  if (msg.expectedVarNames && msg.expectedVarNames.length > 0) {
    // 隔离模式从本次的 runNs 取变量，共享模式从 pyodide.globals 取
    const globals = runNs ?? pyodide.globals;
    for (const name of msg.expectedVarNames) {
      let v;
      try {
        if (!globals.has(name)) continue;
        v = globals.get(name);
        let jsv;
        if (v && typeof v.toJs === 'function') {
          jsv = v.toJs({ dict_converter: Object.fromEntries });
        } else {
          jsv = v;
        }
        // toJs 转不动的类型（函数/类实例）会原样返回 PyProxy，postMessage 结构化克隆
        // 必抛 → 主线程收不到 result，5 秒后误报「死循环」还整个重载 worker。这里
        // 预检克隆，转不动就退化成 repr 字符串，判分会给出「值不对」的正常提示。
        try {
          structuredClone(jsv);
        } catch (_) {
          jsv = String(jsv);
        }
        vars[name] = jsv;
      } catch (_) {
        /* ignore：拿不到就当未定义，由判分给出"变量未定义"提示 */
      } finally {
        // 释放 PyProxy 引用，避免内存泄漏
        if (v && typeof v.destroy === 'function') {
          try { v.destroy(); } catch (_) { /* ignore */ }
        }
      }
    }
  }

  // AST 检测：对用户代码做 ast.parse 并返回所有节点的 Type:Name 列表
  // Import/ImportFrom 特殊处理：除了裸节点名（如 'ImportFrom'），还从 names 列表
  // 展开成 'Import:re' / 'ImportFrom:Path' 形式 —— 因为 ast.Import 本身没有 name
  // 属性（只有 names: list[alias]），不展开就永远命中不了 requiredAst: ["Import:re"]
  // 这种直觉写法。issue #284-#288 就是这个 bug。
  let astNodes = [];
  if (msg.detectAst) {
    try {
      const result = pyodide.runPython(
        `import ast, json\n` +
        `__nodes = []\n` +
        `__skip = set()\n` +
        `__tree = ast.parse(${JSON.stringify(msg.code)})\n` +
        `for __n in ast.walk(__tree):\n` +
        `    if id(__n) in __skip:\n` +
        `        continue\n` +
        `    __t = type(__n).__name__\n` +
        `    if __t in ('Import', 'ImportFrom'):\n` +
        `        __nodes.append(__t)\n` +
        `        for __a in getattr(__n, 'names', None) or []:\n` +
        `            __an = getattr(__a, 'name', None)\n` +
        `            if __an:\n` +
        `                __nodes.append(f"{__t}:{__an}")\n` +
        `            __skip.add(id(__a))\n` +
        `        continue\n` +
        `    __nm = getattr(__n, 'name', None)\n` +
        `    if __nm:\n` +
        `        __nodes.append(f"{__t}:{__nm}")\n` +
        `    elif hasattr(__n, 'targets'):\n` +
        `        for __target in __n.targets:\n` +
        `            if hasattr(__target, 'id'):\n` +
        `                __nodes.append(f"{__t}:{__target.id}")\n` +
        `    else:\n` +
        `        __nodes.append(__t)\n` +
        `json.dumps(__nodes)`,
        runOpts
      );
      astNodes = JSON.parse(result);
    } catch (_) { /* ignore */ }
  }

  // 释放隔离命名空间的 PyProxy，避免内存泄漏（共享模式 runNs 为 null，跳过）
  if (runNs) {
    try { runNs.destroy(); } catch (_) { /* ignore */ }
  }

  const result = { type: 'result', runId: msg.runId, stdout, stderr, vars, astNodes, error };
  try {
    self.postMessage(result);
  } catch (e) {
    // vars 仍含无法结构化克隆的值（嵌套 PyProxy 等漏网情况）——丢弃 vars 兜底回包，
    // 绝不让主线程空等超时
    self.postMessage({ ...result, vars: {}, error: error || `结果含无法传输的值：${(e && e.message) || e}` });
  }
}

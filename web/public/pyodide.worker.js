// Pyodide Web Worker
// 从 CDN 加载 Pyodide，接收主线程的代码并在沙箱中执行
// 主线程通过 5 秒超时 + worker.terminate() 防止死循环卡住浏览器

const PYODIDE_VERSION = '0.27.0';
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full`;

importScripts(`${PYODIDE_URL}/pyodide.js`);

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

self.onmessage = async (event) => {
  const msg = event.data;

  if (msg.type === 'init') {
    try {
      await initPyodide();
    } catch (e) {
      self.postMessage({ type: 'init-error', error: String(e) });
    }
    return;
  }

  if (msg.type === 'run') {
    if (!pyodide) {
      self.postMessage({
        type: 'result',
        stdout: '',
        stderr: '',
        vars: {},
        astNodes: [],
        error: 'Pyodide 未初始化',
      });
      return;
    }

    // 用 io.StringIO 重定向 stdout/stderr：比 setStdout({batched}) 更稳定，
    // 能完整捕获所有字符（包括 trailing \n），中文 UTF-8 也不会出错。
    pyodide.runPython(
      `import io, sys\n` +
      `__captured_stdout = io.StringIO()\n` +
      `__captured_stderr = io.StringIO()\n` +
      `sys.stdout = __captured_stdout\n` +
      `sys.stderr = __captured_stderr\n`
    );

    let error;
    try {
      await pyodide.runPythonAsync(msg.code);
    } catch (e) {
      error = e.message || String(e);
    }

    let stdout = '';
    let stderr = '';
    try {
      stdout = pyodide.runPython(
        `import sys\n` +
        `sys.stdout.flush()\n` +
        `__r = __captured_stdout.getvalue()\n` +
        `sys.stdout = sys.__stdout__\n` +
        `__r`
      ) || '';
      stderr = pyodide.runPython(
        `import sys\n` +
        `sys.stderr.flush()\n` +
        `__r = __captured_stderr.getvalue()\n` +
        `sys.stderr = sys.__stderr__\n` +
        `__r`
      ) || '';
    } catch (_) { /* ignore */ }

    // 收集指定的全局变量值
    // dict_converter: Object.fromEntries —— 把 Python dict 转成 plain JS object，
    // 否则 toJs() 默认返回 Map，内部嵌套的 PyProxy 引用会让跨 worker 的 postMessage
    // 报 "[object Map] could not be cloned"，主线程永不收到 result → 5 秒超时（issue #281）
    const vars = {};
    if (msg.expectedVarNames && msg.expectedVarNames.length > 0) {
      const globals = pyodide.globals;
      for (const name of msg.expectedVarNames) {
        let v;
        try {
          if (!globals.has(name)) continue;
          v = globals.get(name);
          if (v && typeof v.toJs === 'function') {
            vars[name] = v.toJs({ dict_converter: Object.fromEntries });
          } else {
            vars[name] = v;
          }
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
    let astNodes = [];
    if (msg.detectAst) {
      try {
        const result = pyodide.runPython(
          `import ast, json\n` +
          `__nodes = []\n` +
          `__tree = ast.parse(${JSON.stringify(msg.code)})\n` +
          `for __n in ast.walk(__tree):\n` +
          `    __t = type(__n).__name__\n` +
          `    __nm = getattr(__n, 'name', None)\n` +
          `    if __nm:\n` +
          `        __nodes.append(f"{__t}:{__nm}")\n` +
          `    elif hasattr(__n, 'targets'):\n` +
          `        for __target in __n.targets:\n` +
          `            if hasattr(__target, 'id'):\n` +
          `                __nodes.append(f"{__t}:{__target.id}")\n` +
          `    else:\n` +
          `        __nodes.append(__t)\n` +
          `json.dumps(__nodes)`
        );
        astNodes = JSON.parse(result);
      } catch (_) { /* ignore */ }
    }

    self.postMessage({ type: 'result', stdout, stderr, vars, astNodes, error });
  }
};

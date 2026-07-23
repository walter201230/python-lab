// 把 Monaco 编辑器（min/vs）从 node_modules 复制到 public/monaco/vs，随静态导出同源部署。
// 与 copy-pyodide.mjs 同因（issue #303）：@monaco-editor/react 默认从 cdn.jsdelivr.net
// 动态加载 monaco，CDN 不可达的网络环境下练习题编辑器渲染不出来。同源托管后由
// ExerciseEditor 的 loader.config({ paths: { vs: '/monaco/vs' } }) 指向本地。
// public/monaco/ 不进 git（见 .gitignore），predev/prebuild 时从依赖复制。
import { cpSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, 'node_modules', 'monaco-editor', 'min', 'vs');
const dest = join(root, 'public', 'monaco', 'vs');

mkdirSync(dirname(dest), { recursive: true });
cpSync(src, dest, { recursive: true });
console.log('✓ monaco-editor min/vs → public/monaco/vs');

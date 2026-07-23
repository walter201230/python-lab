// 把 Pyodide 核心运行时从 node_modules 复制到 public/pyodide/，随静态导出同源部署。
// 起因 issue #303：此前只从 cdn.jsdelivr.net 加载，该 CDN 在部分网络环境（尤其大陆）
// 不可达，用户能打开网站却「Python 环境加载失败」。同源托管后两者可用性一致。
// public/pyodide/ 不进 git（见 .gitignore），predev/prebuild 时从依赖复制。
import { copyFileSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, 'node_modules', 'pyodide');
const dest = join(root, 'public', 'pyodide');

// loadPyodide({ indexURL }) 运行所需的最小文件集（stdlib-only，本项目不用额外包）
const FILES = [
  'pyodide.js',
  'pyodide.asm.js',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
];

mkdirSync(dest, { recursive: true });
for (const f of FILES) {
  copyFileSync(join(src, f), join(dest, f));
}
const total = FILES.reduce((n, f) => n + statSync(join(dest, f)).size, 0);
console.log(`✓ pyodide → public/pyodide/（${FILES.length} 个文件，${(total / 1024 / 1024).toFixed(1)}MB）`);

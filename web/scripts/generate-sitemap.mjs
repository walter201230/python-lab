#!/usr/bin/env node
// 扫 out/ 下所有 index.html 生成 sitemap.xml。
// 必须在 `next build`（静态导出）之后跑，由 package.json 的 postbuild 触发。

import { readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'out');
const SITE_URL = process.env.SITE_URL || 'https://learn-py.org';

// 这些目录不进 sitemap：Next 内部、404、未找到
const EXCLUDE_DIRS = new Set(['_next', '_not-found', '404']);

async function walk(dir) {
  const found = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (EXCLUDE_DIRS.has(e.name)) continue;
      found.push(...(await walk(join(dir, e.name))));
    } else if (e.name === 'index.html') {
      found.push(join(dir, e.name));
    }
  }
  return found;
}

const files = await walk(OUT_DIR);
const today = new Date().toISOString().split('T')[0];

const urls = files
  .map((f) => relative(OUT_DIR, f))
  .map((rel) => (rel === 'index.html' ? '/' : '/' + rel.replace(/index\.html$/, '')))
  .sort();

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map(
      (p) =>
        `  <url>\n` +
        `    <loc>${SITE_URL}${p}</loc>\n` +
        `    <lastmod>${today}</lastmod>\n` +
        `    <changefreq>weekly</changefreq>\n` +
        `    <priority>${p === '/' ? '1.0' : '0.8'}</priority>\n` +
        `  </url>`,
    )
    .join('\n') +
  `\n</urlset>\n`;

await writeFile(join(OUT_DIR, 'sitemap.xml'), xml, 'utf8');
console.log(`✓ sitemap.xml generated with ${urls.length} URLs → ${SITE_URL}/sitemap.xml`);

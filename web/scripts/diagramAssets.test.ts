import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import manifest from '../content/diagram-assets.json';
import { TeachingImage } from '../src/components/lesson/TeachingImage';

test('正文图在阅读和闯关路由均存在，所有静态副本与清单摘要一致', () => {
  const root=process.cwd();
  const figures=manifest.figures as Record<string,{sha256:string;width:number;height:number}>;
  const copies=manifest.copies as Record<string,string>;
  for(const [url,name] of Object.entries(copies)) {
    const data=readFileSync(join(root,'public',url));
    assert.equal(createHash('sha256').update(data).digest('hex'),figures[name].sha256,url);
    const svg=data.toString('utf8');
    assert.ok(svg.includes('<title')&&svg.includes('<desc'),name);
    assert.ok(!/<script\b|<foreignObject\b|(?:href|src)=["']https?:/i.test(svg),name);
  }
  let references=0;
  for(const chapter of readdirSync(join(root,'content/lessons'))) {
    for(const lesson of readdirSync(join(root,'content/lessons',chapter))) {
      const dir=join(root,'content/lessons',chapter,lesson);
      const meta=JSON.parse(readFileSync(join(dir,'lesson.json'),'utf8'));
      const files=new Set<string>(meta.blocks.filter((b:{kind:string})=>b.kind==='step').map((b:{file:string})=>b.file));
      for(const file of files) {
        const text=readFileSync(join(dir,'steps',file),'utf8');
        for(const m of text.matchAll(/!\[([^\]]*)\]\(([^\s)]*images\/diagrams\/([^/\s)]+\.svg))\)/g)) {
          assert.ok(m[1].trim(),'替代文字不得为空');
          for(const tail of ['', 'read/']) {
            const url=new URL(m[2],`https://example.test/lessons/${chapter}/${lesson}/${tail}`).pathname;
            assert.equal(copies[url],m[3],url);
          }
          references++;
        }
      }
    }
  }
  assert.equal(references,manifest.uses.length);
  assert.equal(references,18);
});

test('SVG 图示保留替代文字和键盘滚动区域，不添加额外链接，普通图片保持原路径', () => {
  const href='../../images/diagrams/variable-rebinding.svg';
  const html=renderToStaticMarkup(createElement(ReactMarkdown,{components:{img:TeachingImage}},`![变量重新指向](${href})`));
  assert.ok(html.includes('tutorial-diagram-scroll'));
  assert.ok(html.includes('tabindex="0"'));
  assert.ok(html.includes('alt="变量重新指向"'));
  assert.ok(html.includes(`src="${href}"`));
  assert.ok(!html.includes('<a '));
  assert.ok(!html.includes('<p><div'));
  const original=renderToStaticMarkup(createElement(TeachingImage,{src:'chart.png',alt:'历史走势图'}));
  assert.ok(original.includes('src="chart.png"'));
  assert.ok(!original.includes('tutorial-diagram'));
});

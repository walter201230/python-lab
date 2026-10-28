import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  SITE_NAME,
  SITE_URL,
  breadcrumbJsonLd,
  serializeJsonLd,
  socialMetadata,
  websiteJsonLd,
} from '../src/lib/siteMetadata';

test('分享元数据补齐站点名称、语言与规范网址，无图时使用 summary 卡片', () => {
  const meta = socialMetadata({
    title: '正则表达式 — 小白学 Python',
    description: '摘要',
    path: '/lessons/python14/regex/read/',
    type: 'article',
  });
  assert.deepEqual(meta.openGraph, {
    title: '正则表达式 — 小白学 Python',
    description: '摘要',
    url: '/lessons/python14/regex/read/',
    siteName: SITE_NAME,
    locale: 'zh_CN',
    type: 'article',
  });
  assert.deepEqual(meta.twitter, { card: 'summary', title: '正则表达式 — 小白学 Python', description: '摘要' });
});

test('普通页面默认使用 website 类型', () => {
  const meta = socialMetadata({ title: '关于本站 — 小白学 Python', description: '摘要', path: '/about/' });
  assert.equal((meta.openGraph as { type?: string }).type, 'website');
});

test('WebSite 结构化数据只描述首页网址与站点名称', () => {
  assert.deepEqual(websiteJsonLd(), {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '小白学 Python',
    url: 'https://learn-py.org/',
    inLanguage: 'zh-CN',
  });
});

test('阅读页面包屑为首页 › 课程，全部使用绝对网址', () => {
  const data = breadcrumbJsonLd({ title: '正则表达式', path: '/lessons/python14/regex/read/' });
  assert.equal(data['@type'], 'BreadcrumbList');
  assert.deepEqual(data.itemListElement, [
    { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: '正则表达式', item: `${SITE_URL}/lessons/python14/regex/read/` },
  ]);
});

test('序列化 JSON-LD 时转义 <，防止提前闭合 script', () => {
  const html = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
  assert.ok(!html.includes('<'));
  assert.deepEqual(JSON.parse(html), { name: '</script><script>alert(1)</script>' });
});

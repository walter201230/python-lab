/**
 * 站点级 SEO 元数据：分享卡片与 JSON-LD 结构化数据（纯函数，便于单测）。
 */
import type { Metadata } from 'next';

export const SITE_NAME = '小白学 Python';
export const SITE_URL = 'https://learn-py.org';
export const SITE_TITLE = '小白学 Python — 浏览器里就能跑';
export const SITE_DESCRIPTION = '小白学 Python 是面向零基础的免费中文 Python 在线教程，提供 29 章讲解和 100 道练习，覆盖变量、容器、函数、面向对象、装饰器、异步编程及现代项目工具。无需安装环境或注册账号，在浏览器中编写代码、查看结果并自动判分，做对一题解锁下一段；也可通过完整阅读页系统通读，学习进度保存在当前浏览器。';

interface SocialInput {
  title: string;
  description: string;
  /** 该页 canonical 的站内路径，由根布局的 metadataBase 解析为绝对网址 */
  path: string;
  type?: 'website' | 'article';
}

/**
 * 子页面一旦设置 openGraph 就会整体覆盖父级（Next 浅合并），
 * 所以每页都经由这里补齐公共字段，根布局不设 openGraph，避免 404 继承首页分享信息。
 */
export function socialMetadata({ title, description, path, type = 'website' }: SocialInput): Pick<Metadata, 'openGraph' | 'twitter'> {
  return {
    openGraph: { title, description, url: path, siteName: SITE_NAME, locale: 'zh_CN', type },
    // 暂无分享图，使用不要求图片的 summary 卡片
    twitter: { card: 'summary', title, description },
  };
}

/** 首页 WebSite：Google 据此确定搜索结果中显示的站点名称 */
export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    inLanguage: 'zh-CN',
  };
}

/** 阅读页面包屑：首页 › 课程；只输出在规范版本（阅读页）上 */
export function breadcrumbJsonLd({ title, path }: { title: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: title, item: `${SITE_URL}${path}` },
    ],
  };
}

/** 按 Next JSON-LD 指南转义 <，防止内容提前闭合 <script> */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

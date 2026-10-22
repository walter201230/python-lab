/**
 * 全站共享的布局常量，避免散落的 magic number。
 */

/**
 * 全局顶栏 + 实测学习工具栏高度 + 留白；导航未水合时使用 CSS 兜底。
 *
 * 用作 anchor 跳转时的 scroll-margin-top，让目标元素不被 sticky bar 遮挡。
 */
export const STICKY_BAR_SCROLL_OFFSET = 'var(--lesson-scroll-offset, 180px)';

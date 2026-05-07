/**
 * 全站共享的布局常量，避免散落的 magic number。
 */

/**
 * sticky header (57px) + lesson sticky bar (~63px) 总高度。
 *
 * 用作 anchor 跳转时的 scroll-margin-top，让目标元素不被 sticky bar 遮挡。
 */
export const STICKY_BAR_SCROLL_OFFSET = '120px';

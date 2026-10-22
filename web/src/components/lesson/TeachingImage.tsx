/* eslint-disable @next/next/no-img-element -- 教学 SVG 保留相对地址及父元素的 color-scheme，不进行位图优化。 */
import type { ComponentProps } from 'react';

export function TeachingImage({ src, alt, title }: ComponentProps<'img'>) {
  if (typeof src !== 'string' || !src.includes('/images/diagrams/') || !src.endsWith('.svg')) {
    return <img src={src} alt={alt ?? ''} title={title} />;
  }
  return (
    <span className="tutorial-diagram">
      <span className="tutorial-diagram-scroll" tabIndex={0} role="region" aria-label={`${alt ?? '图示'}，窄屏可横向滚动`}>
        <img src={src} alt={alt ?? ''} title={title} loading="lazy" />
      </span>
    </span>
  );
}

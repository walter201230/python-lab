'use client';

import { useState } from 'react';

const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#22d3ee', '#a7f3d0'];
const PARTICLE_COUNT = 32;

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  rotate: number;
  color: string;
  size: number;
}

function makeParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: Date.now() + i,
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 1.6 + Math.random() * 0.8,
    rotate: Math.random() * 360,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 6,
  }));
}

/**
 * 章节全部通关时短暂播放的 confetti。
 *
 * - 纯 CSS 动画，无依赖
 * - 自动监听 prefers-reduced-motion，开启时直接 no-op
 * - 父组件用 key 切换让本组件重新挂载，每次重挂触发一次新动画
 */
export function Confetti({ trigger }: { trigger: boolean }) {
  // mount 时一次性生成粒子，CSS 动画跑完会自然淡到屏幕外；卸载靠父组件 key 切换
  const [particles] = useState<Particle[]>(() => {
    if (!trigger) return [];
    if (typeof window !== 'undefined') {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return [];
    }
    return makeParticles();
  });

  if (particles.length === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-screen overflow-hidden"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: `${p.size * 0.4}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

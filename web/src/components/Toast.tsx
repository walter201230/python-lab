'use client';

import Link from 'next/link';
import { useToast } from '@/lib/useToast';

export function Toast() {
  const message = useToast((s) => s.message);
  const link = useToast((s) => s.link);
  const hide = useToast((s) => s.hide);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-emerald-500/30 bg-slate-900/95 px-5 py-2.5 text-sm text-slate-200 shadow-2xl shadow-emerald-500/10 backdrop-blur-sm">
        <span>{message}</span>
        {link && (
          <Link
            href={link.href}
            className="gradient-tech-green rounded-full px-3 py-1 text-xs font-semibold text-slate-950 hover:opacity-95"
          >
            {link.text}
          </Link>
        )}
        <button
          onClick={hide}
          aria-label="关闭"
          className="text-xs text-slate-500 hover:text-slate-300"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

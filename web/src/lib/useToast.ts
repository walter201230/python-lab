'use client';

import { create } from 'zustand';

export interface ToastLink {
  href: string;
  text: string;
}

interface ToastState {
  message: string | null;
  link: ToastLink | null;
  show: (message: string, link?: ToastLink) => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set, get) => ({
  message: null,
  link: null,
  show: (message, link = undefined) => {
    set({ message, link: link ?? null });
    setTimeout(() => {
      if (get().message === message) set({ message: null, link: null });
    }, 4000);
  },
  hide: () => set({ message: null, link: null }),
}));

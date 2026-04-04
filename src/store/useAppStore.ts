'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/user';

interface AppState {
  user: User | null;
  accessToken: string | null;
  perusahaanId: string | null;
  setAuth: (user: User, accessToken: string, perusahaanId?: string) => void;
  clearAuth: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      perusahaanId: null,
      setAuth: (user, accessToken, perusahaanId) =>
        set({ user, accessToken, perusahaanId: perusahaanId ?? null }),
      clearAuth: () => set({ user: null, accessToken: null, perusahaanId: null }),
    }),
    { name: 'dokagen-auth' },
  ),
);

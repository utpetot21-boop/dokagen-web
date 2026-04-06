'use client';

import type { ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  const { data: session } = useSession();
  const initials = session?.user?.email?.[0].toUpperCase() ?? 'U';

  return (
    <header className="bg-white border-b border-[#E5E5EA] px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-textPrimary tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-textSecondary mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {action}
          <div className="flex items-center gap-2 pl-3 border-l border-[#E5E5EA]">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-ios">
              <span className="text-white text-[11px] font-bold">{initials}</span>
            </div>
            <span className="text-xs text-textSecondary hidden md:block max-w-[140px] truncate">
              {session?.user?.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

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

  return (
    <header className="bg-white border-b border-[#E8E8EE] px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-textPrimary">{title}</h1>
          {subtitle && (
            <p className="text-sm text-textSecondary mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {action}
          {/* User avatar */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {session?.user?.email?.[0].toUpperCase() ?? 'U'}
              </span>
            </div>
            <span className="text-sm text-textSecondary hidden md:block">
              {session?.user?.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

'use client';

import { SessionProvider, useSession, signOut } from 'next-auth/react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

function SessionGuard({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      // Token refresh gagal — paksa logout
      signOut({ callbackUrl: '/login' });
    }
  }, [session?.error]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SessionGuard>{children}</SessionGuard>
    </SessionProvider>
  );
}

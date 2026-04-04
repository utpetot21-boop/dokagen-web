'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Props {
  docId: string;
  newStatus: string;
  label: string;
  color: 'primary' | 'success' | 'danger';
}

const colorMap = {
  primary: 'bg-primary hover:bg-[#163264] text-white',
  success: 'bg-success hover:bg-[#17855f] text-white',
  danger: 'bg-danger hover:bg-[#c03e3d] text-white',
};

export default function UpdateStatusButton({ docId, newStatus, label, color }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/dokumen/${docId}/status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full px-4 py-2 rounded-button text-sm font-semibold transition-colors
        disabled:opacity-60 ${colorMap[color]}`}
    >
      {loading ? 'Memproses...' : label}
    </button>
  );
}

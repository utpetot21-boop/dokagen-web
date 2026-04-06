'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export default function ExportCsvButton() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/laporan/export-csv`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (!res.ok) throw new Error('Gagal export');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().slice(0, 10);
      a.download = `dokagen-export-${date}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Gagal mengunduh CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 border border-[#E5E5EA] bg-white text-textPrimary
        px-4 py-2 rounded-button text-sm font-semibold hover:bg-bgLight transition-colors
        disabled:opacity-50 shadow-ios"
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )}
      {loading ? 'Mengunduh...' : 'Export CSV'}
    </button>
  );
}

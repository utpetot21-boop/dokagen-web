'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import StatusBadge from './StatusBadge';
import { formatRupiah, formatTanggalPendek } from '@/lib/formatters';
import type { PaginatedResponse, DokumenRow } from '@/lib/server-api';

const TIPE_OPTIONS = [
  { value: '', label: 'Semua Tipe' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'sph', label: 'SPH' },
  { value: 'surat_hutang', label: 'Surat Hutang' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'terkirim', label: 'Terkirim' },
  { value: 'lunas', label: 'Lunas' },
  { value: 'jatuh_tempo', label: 'Jatuh Tempo' },
];

const tipeLabel: Record<string, string> = {
  invoice: 'Invoice',
  sph: 'SPH',
  surat_hutang: 'Surat Hutang',
};

interface Props {
  initialData: PaginatedResponse<DokumenRow>;
}

export default function DokumenTableClient({ initialData }: Props) {
  const { data: session } = useSession();
  const [data, setData] = useState<PaginatedResponse<DokumenRow>>(initialData);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [tipe, setTipe] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const fetchData = useCallback(
    async (params: { search?: string; tipe?: string; status?: string; page?: number }) => {
      if (!session?.accessToken) return;
      setLoading(true);
      try {
        const q = new URLSearchParams();
        q.set('limit', '15');
        q.set('page', String(params.page ?? 1));
        if (params.search) q.set('search', params.search);
        if (params.tipe) q.set('tipe', params.tipe);
        if (params.status) q.set('status', params.status);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/dokumen?${q}`,
          { headers: { Authorization: `Bearer ${session.accessToken}` } },
        );
        const json = await res.json();
        setData(json.data);
      } catch {
        // keep previous data
      } finally {
        setLoading(false);
      }
    },
    [session?.accessToken],
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    fetchData({ search: value, tipe, status, page: 1 });
  };

  const handleTipe = (value: string) => {
    setTipe(value);
    setPage(1);
    fetchData({ search, tipe: value, status, page: 1 });
  };

  const handleStatus = (value: string) => {
    setStatus(value);
    setPage(1);
    fetchData({ search, tipe, status: value, page: 1 });
  };

  const handlePage = (newPage: number) => {
    setPage(newPage);
    fetchData({ search, tipe, status, page: newPage });
  };

  return (
    <div className="bg-white rounded-card border border-[#E8E8EE] flex flex-col gap-0">
      {/* Filters */}
      <div className="px-4 py-3 border-b border-[#F4F4F8] flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Cari nomor atau klien..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 min-w-[180px] border border-[#E8E8EE] rounded-input px-3 py-2 text-sm
            focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
        <select
          value={tipe}
          onChange={(e) => handleTipe(e.target.value)}
          className="border border-[#E8E8EE] rounded-input px-3 py-2 text-sm
            focus:outline-none focus:border-primary text-textSecondary"
        >
          {TIPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => handleStatus(e.target.value)}
          className="border border-[#E8E8EE] rounded-input px-3 py-2 text-sm
            focus:outline-none focus:border-primary text-textSecondary"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.data.length === 0 ? (
          <div className="p-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-bgLight rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-medium text-textPrimary">Tidak ada dokumen ditemukan</p>
            <p className="text-sm text-textSecondary mt-1">Coba ubah filter pencarian</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-bgLight border-b border-[#E8E8EE]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Nomor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Tipe</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Klien</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Jatuh Tempo</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-textSecondary uppercase tracking-wide">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.data.map((doc) => (
                <tr key={doc.id} className="border-b border-[#F4F4F8] hover:bg-bgLight/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/dokumen/${doc.id}`} className="text-primary font-semibold text-sm hover:underline">
                      {doc.nomor}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-bgLight px-2 py-1 rounded-badge font-medium text-textSecondary">
                      {tipeLabel[doc.tipe] ?? doc.tipe}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-textPrimary">{doc.klienNama ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-textSecondary">{formatTanggalPendek(doc.tanggalDokumen)}</td>
                  <td className="px-4 py-3 text-sm text-textSecondary">
                    {doc.tanggalJatuhTempo ? formatTanggalPendek(doc.tanggalJatuhTempo) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold">{formatRupiah(doc.total)}</td>
                  <td className="px-4 py-3"><StatusBadge status={doc.status} /></td>
                  <td className="px-4 py-3">
                    <Link href={`/dokumen/${doc.id}`}
                      className="text-xs text-primary hover:underline font-medium">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data.meta.totalPages > 1 && (
        <div className="px-4 py-3 border-t border-[#F4F4F8] flex items-center justify-between">
          <p className="text-xs text-textSecondary">
            {data.meta.total} dokumen · Halaman {page} dari {data.meta.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => handlePage(page - 1)}
              className="px-3 py-1.5 text-xs border border-[#E8E8EE] rounded-input
                disabled:opacity-40 hover:bg-bgLight transition-colors"
            >
              ← Prev
            </button>
            <button
              disabled={page >= data.meta.totalPages}
              onClick={() => handlePage(page + 1)}
              className="px-3 py-1.5 text-xs border border-[#E8E8EE] rounded-input
                disabled:opacity-40 hover:bg-bgLight transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

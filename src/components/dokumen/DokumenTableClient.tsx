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
  { value: 'kasbon', label: 'Kasbon' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'terkirim', label: 'Terkirim' },
  { value: 'lunas', label: 'Lunas' },
  { value: 'jatuh_tempo', label: 'Jatuh Tempo' },
];

const tipeLabel: Record<string, string> = {
  invoice: 'Invoice', sph: 'SPH', surat_hutang: 'Surat Hutang', kasbon: 'Kasbon',
};

const tipeColor: Record<string, string> = {
  invoice: 'bg-blue-50 text-blue-600',
  sph: 'bg-purple-50 text-purple-600',
  surat_hutang: 'bg-orange-50 text-orange-600',
  kasbon: 'bg-emerald-50 text-emerald-600',
};

const selectCls = 'bg-bgLight border-0 rounded-input px-3 py-2 text-sm text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all';

interface Props { initialData: PaginatedResponse<DokumenRow>; }

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
      } catch { /* keep prev */ } finally { setLoading(false); }
    },
    [session?.accessToken],
  );

  const handleSearch = (v: string) => { setSearch(v); setPage(1); fetchData({ search: v, tipe, status, page: 1 }); };
  const handleTipe   = (v: string) => { setTipe(v);   setPage(1); fetchData({ search, tipe: v, status, page: 1 }); };
  const handleStatus = (v: string) => { setStatus(v); setPage(1); fetchData({ search, tipe, status: v, page: 1 }); };
  const handlePage   = (n: number) => { setPage(n);              fetchData({ search, tipe, status, page: n }); };

  return (
    <div className="bento-card flex flex-col">
      {/* Filters */}
      <div className="px-4 py-3 border-b border-[#F2F2F7] flex flex-wrap gap-2 items-center">
        <div className="flex-1 min-w-[180px] relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" placeholder="Cari nomor atau klien..." value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-bgLight border-0 rounded-input pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <select value={tipe} onChange={(e) => handleTipe(e.target.value)} className={selectCls}>
          {TIPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={status} onChange={(e) => handleStatus(e.target.value)} className={selectCls}>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.data.length === 0 ? (
          <div className="p-16 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-bgLight rounded-[18px] flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-semibold text-textPrimary text-sm">Tidak ada dokumen</p>
            <p className="text-xs text-textSecondary mt-1">Coba ubah filter pencarian</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F2F2F7]">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-textSecondary uppercase tracking-wider">Nomor</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-textSecondary uppercase tracking-wider">Tipe</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-textSecondary uppercase tracking-wider hidden md:table-cell">Klien</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-textSecondary uppercase tracking-wider hidden lg:table-cell">Tanggal</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-textSecondary uppercase tracking-wider hidden lg:table-cell">Jatuh Tempo</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-textSecondary uppercase tracking-wider">Total</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-textSecondary uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((doc) => (
                <tr key={doc.id} className="border-b border-[#F2F2F7] hover:bg-bgLight/60 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/dokumen/${doc.id}`} className="text-primary font-semibold text-sm hover:underline">
                      {doc.nomor}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-pill ${tipeColor[doc.tipe] ?? 'bg-gray-50 text-gray-600'}`}>
                      {tipeLabel[doc.tipe] ?? doc.tipe}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-textPrimary hidden md:table-cell">{doc.klienNama ?? '—'}</td>
                  <td className="px-5 py-3 text-xs text-textSecondary hidden lg:table-cell">{formatTanggalPendek(doc.tanggalDokumen)}</td>
                  <td className="px-5 py-3 text-xs text-textSecondary hidden lg:table-cell">
                    {doc.tanggalJatuhTempo ? formatTanggalPendek(doc.tanggalJatuhTempo) : '—'}
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-semibold">{formatRupiah(doc.total)}</td>
                  <td className="px-5 py-3"><StatusBadge status={doc.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data.meta.totalPages > 1 && (
        <div className="px-5 py-3 border-t border-[#F2F2F7] flex items-center justify-between">
          <p className="text-xs text-textSecondary">
            {data.meta.total} dokumen · Hal. {page}/{data.meta.totalPages}
          </p>
          <div className="flex gap-1.5">
            <button disabled={page <= 1} onClick={() => handlePage(page - 1)}
              className="px-3 py-1.5 text-xs bg-bgLight rounded-input disabled:opacity-40 hover:bg-border transition-colors font-medium">
              ← Prev
            </button>
            <button disabled={page >= data.meta.totalPages} onClick={() => handlePage(page + 1)}
              className="px-3 py-1.5 text-xs bg-bgLight rounded-input disabled:opacity-40 hover:bg-border transition-colors font-medium">
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { formatRupiah } from '@/lib/formatters';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

interface Ringkasan {
  pendapatan: { total: number; bulanIni: number; bulanLalu: number; growthPersen: number };
  dokumen: { total: number; bulanIni: number; menungguPembayaran: number; jatuhTempo: number };
  klien: { total: number };
}
interface ChartPoint { label: string; total: number }
interface DokumenStat { tipe?: string; status?: string; jumlah: number }
interface KlienTerbaik { klienId: string; nama: string; email: string; totalPendapatan: number; jumlahDokumen: number }

const PIE_COLORS: Record<string, string> = {
  invoice: '#1A3C6E',
  sph: '#378ADD',
  surat_hutang: '#F5A623',
  lunas: '#1D9E75',
  draft: '#F5A623',
  terkirim: '#378ADD',
  jatuh_tempo: '#E24B4A',
  dibatalkan: '#9898A8',
};

const TIPE_LABEL: Record<string, string> = {
  invoice: 'Invoice',
  sph: 'SPH',
  surat_hutang: 'Surat Hutang',
};

const STATUS_LABEL: Record<string, string> = {
  lunas: 'Lunas', draft: 'Draft', terkirim: 'Terkirim',
  jatuh_tempo: 'Jatuh Tempo', dibatalkan: 'Dibatalkan',
};

function StatBox({ label, value, sub, subGreen }: {
  label: string; value: string; sub?: string; subGreen?: boolean;
}) {
  return (
    <div className="bg-white rounded-card border border-[#E8E8EE] p-5">
      <p className="text-xs font-semibold text-textSecondary uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-textPrimary mt-1">{value}</p>
      {sub && (
        <p className={`text-xs mt-1 ${subGreen ? 'text-success' : 'text-textSecondary'}`}>{sub}</p>
      )}
    </div>
  );
}

export default function LaporanClient({ accessToken }: { accessToken?: string }) {
  const [ringkasan, setRingkasan] = useState<Ringkasan | null>(null);
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [dokumenStats, setDokumenStats] = useState<{ byTipe: DokumenStat[]; byStatus: DokumenStat[] } | null>(null);
  const [klienTerbaik, setKlienTerbaik] = useState<KlienTerbaik[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [r1, r2, r3, r4] = await Promise.all([
        fetch(`${BASE}/laporan/ringkasan`, { headers }).then(r => r.json()),
        fetch(`${BASE}/laporan/pendapatan-chart`, { headers }).then(r => r.json()),
        fetch(`${BASE}/laporan/dokumen-stats`, { headers }).then(r => r.json()),
        fetch(`${BASE}/laporan/klien-terbaik?limit=5`, { headers }).then(r => r.json()),
      ]);
      setRingkasan(r1.data);
      setChart(r2.data ?? []);
      setDokumenStats(r3.data);
      setKlienTerbaik(r4.data ?? []);
    } catch { /* keep empty */ }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox
          label="Total Pendapatan"
          value={formatRupiah(ringkasan?.pendapatan.total ?? 0)}
          sub="Semua waktu"
        />
        <StatBox
          label="Bulan Ini"
          value={formatRupiah(ringkasan?.pendapatan.bulanIni ?? 0)}
          sub={`${(ringkasan?.pendapatan.growthPersen ?? 0) >= 0 ? '+' : ''}${ringkasan?.pendapatan.growthPersen ?? 0}% vs bulan lalu`}
          subGreen={(ringkasan?.pendapatan.growthPersen ?? 0) >= 0}
        />
        <StatBox
          label="Menunggu Bayar"
          value={String(ringkasan?.dokumen.menungguPembayaran ?? 0)}
          sub={`${ringkasan?.dokumen.jatuhTempo ?? 0} jatuh tempo`}
        />
        <StatBox
          label="Total Klien"
          value={String(ringkasan?.klien.total ?? 0)}
          sub="Klien aktif"
        />
      </div>

      {/* ── Grafik Pendapatan ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-card border border-[#E8E8EE] p-5">
        <h2 className="font-semibold text-textPrimary mb-4">Pendapatan 6 Bulan Terakhir</h2>
        {chart.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-textSecondary text-sm">
            Belum ada data pendapatan
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chart} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F8" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9898A8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#9898A8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}jt`}
              />
              <Tooltip
                formatter={(value: number) => [formatRupiah(value), 'Pendapatan']}
                contentStyle={{ borderRadius: 10, border: '1px solid #E8E8EE', fontSize: 12 }}
              />
              <Bar dataKey="total" fill="#1A3C6E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Pie Charts ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Tipe */}
        <div className="bg-white rounded-card border border-[#E8E8EE] p-5">
          <h2 className="font-semibold text-textPrimary mb-4">Dokumen per Tipe</h2>
          {!dokumenStats?.byTipe?.length ? (
            <p className="text-sm text-textSecondary text-center py-8">Belum ada data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dokumenStats.byTipe}
                  dataKey="jumlah"
                  nameKey="tipe"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ tipe, percent }) =>
                    `${TIPE_LABEL[tipe] ?? tipe} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {dokumenStats.byTipe.map((entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[entry.tipe ?? ''] ?? '#9898A8'} />
                  ))}
                </Pie>
                <Legend formatter={(v) => TIPE_LABEL[v] ?? v} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By Status */}
        <div className="bg-white rounded-card border border-[#E8E8EE] p-5">
          <h2 className="font-semibold text-textPrimary mb-4">Dokumen per Status</h2>
          {!dokumenStats?.byStatus?.length ? (
            <p className="text-sm text-textSecondary text-center py-8">Belum ada data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dokumenStats.byStatus}
                  dataKey="jumlah"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ status, percent }) =>
                    `${STATUS_LABEL[status] ?? status} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {dokumenStats.byStatus.map((entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[entry.status ?? ''] ?? '#9898A8'} />
                  ))}
                </Pie>
                <Legend formatter={(v) => STATUS_LABEL[v] ?? v} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Klien Terbaik ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-card border border-[#E8E8EE]">
        <div className="px-5 py-4 border-b border-[#E8E8EE]">
          <h2 className="font-semibold text-textPrimary">Top 5 Klien</h2>
        </div>
        {klienTerbaik.length === 0 ? (
          <div className="p-10 text-center text-sm text-textSecondary">Belum ada data klien</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-bgLight border-b border-[#E8E8EE]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">#</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Klien</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-textSecondary uppercase tracking-wide">Dokumen</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-textSecondary uppercase tracking-wide">Total Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              {klienTerbaik.map((k, i) => (
                <tr key={k.klienId} className="border-b border-[#F4F4F8] hover:bg-bgLight/50">
                  <td className="px-5 py-3 text-sm text-textSecondary font-medium">{i + 1}</td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-semibold text-textPrimary">{k.nama}</p>
                    {k.email && <p className="text-xs text-textSecondary">{k.email}</p>}
                  </td>
                  <td className="px-5 py-3 text-center text-sm">{k.jumlahDokumen}</td>
                  <td className="px-5 py-3 text-right text-sm font-semibold text-primary">
                    {formatRupiah(k.totalPendapatan)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

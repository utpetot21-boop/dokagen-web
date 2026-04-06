import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchRingkasan, fetchRecentDokumen } from '@/lib/server-api';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/dokumen/StatusBadge';
import { formatRupiah, formatTanggalPendek } from '@/lib/formatters';
import Link from 'next/link';

const tipeLabel: Record<string, string> = {
  invoice: 'Invoice', sph: 'SPH', surat_hutang: 'S. Hutang', kasbon: 'Kasbon',
};

const tipeColor: Record<string, string> = {
  invoice: 'bg-blue-50 text-blue-700',
  sph: 'bg-purple-50 text-purple-700',
  surat_hutang: 'bg-orange-50 text-orange-700',
  kasbon: 'bg-emerald-50 text-emerald-700',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const [ringkasan, recentDokumen] = await Promise.allSettled([
    fetchRingkasan(),
    fetchRecentDokumen(),
  ]);
  const stats = ringkasan.status === 'fulfilled' ? ringkasan.value : null;
  const dokumenList = recentDokumen.status === 'fulfilled' ? recentDokumen.value.data : [];
  const firstName = session?.user?.email?.split('@')[0] ?? 'User';

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Dashboard"
        subtitle={`Halo, ${firstName} 👋`}
        action={
          <Link
            href="/dokumen/baru"
            className="flex items-center gap-1.5 bg-primary text-white px-4 py-2
              rounded-button text-sm font-semibold hover:bg-[#163264] transition-all
              duration-150 shadow-ios"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Buat Dokumen
          </Link>
        }
      />

      <div className="flex-1 p-5 space-y-4 animate-in">

        {/* ── Bento Row 1: Stats ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

          {/* Revenue — large accent card */}
          <div className="col-span-2 xl:col-span-2 bg-primary rounded-bento p-5 shadow-ios-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
            <div className="relative">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">Pendapatan Bulan Ini</p>
              <p className="text-white text-3xl font-bold tracking-tight mb-1">
                {stats ? formatRupiah(stats.pendapatan.bulanIni) : 'Rp —'}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-pill ${
                  (stats?.pendapatan.growthPersen ?? 0) >= 0
                    ? 'bg-emerald-400/20 text-emerald-300'
                    : 'bg-red-400/20 text-red-300'
                }`}>
                  {stats
                    ? `${stats.pendapatan.growthPersen >= 0 ? '+' : ''}${stats.pendapatan.growthPersen}%`
                    : '—'}
                </span>
                <span className="text-white/50 text-xs">vs bulan lalu</span>
              </div>
            </div>
          </div>

          {/* Total Dokumen */}
          <div className="bento-card p-5">
            <div className="w-9 h-9 bg-blue-50 rounded-[10px] flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-textPrimary tracking-tight">
              {stats?.dokumen.total ?? '—'}
            </p>
            <p className="text-xs font-medium text-textSecondary mt-0.5">Total Dokumen</p>
            {stats && (
              <p className="text-xs text-blue-500 mt-2 font-medium">+{stats.dokumen.bulanIni} bulan ini</p>
            )}
          </div>

          {/* Total Klien */}
          <div className="bento-card p-5">
            <div className="w-9 h-9 bg-violet-50 rounded-[10px] flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-textPrimary tracking-tight">
              {stats?.klien.total ?? '—'}
            </p>
            <p className="text-xs font-medium text-textSecondary mt-0.5">Total Klien</p>
            <p className="text-xs text-violet-500 mt-2 font-medium">Aktif terdaftar</p>
          </div>
        </div>

        {/* ── Bento Row 2: Alert + Quick Actions ────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Jatuh Tempo */}
          <div className="bento-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-red-50 rounded-[10px] flex items-center justify-center">
                <svg className="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {(stats?.dokumen.jatuhTempo ?? 0) > 0 && (
                <span className="w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {stats?.dokumen.jatuhTempo}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-textPrimary tracking-tight">
              {stats?.dokumen.jatuhTempo ?? '—'}
            </p>
            <p className="text-xs font-medium text-textSecondary mt-0.5">Jatuh Tempo</p>
            <p className="text-xs text-textSecondary mt-2">
              {stats?.dokumen.menungguPembayaran ?? 0} menunggu bayar
            </p>
          </div>

          {/* Quick Actions */}
          <div className="xl:col-span-2 bento-card p-5">
            <p className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-3">Aksi Cepat</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { href: '/dokumen/baru?tipe=invoice', label: 'Invoice', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /> },
                { href: '/dokumen/baru?tipe=sph', label: 'SPH', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
                { href: '/klien', label: 'Klien', color: 'bg-violet-50 text-violet-700 hover:bg-violet-100',
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /> },
                { href: '/laporan', label: 'Laporan', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className={`flex flex-col items-center gap-2 p-3 rounded-[14px] text-xs font-semibold transition-all duration-150 ${item.color}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bento Row 3: Recent Documents ─────────────────────────────── */}
        <div className="bento-card overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-[#F2F2F7]">
            <p className="text-sm font-bold text-textPrimary tracking-tight">Dokumen Terbaru</p>
            <Link href="/dokumen"
              className="text-xs font-semibold text-primary hover:text-[#163264] transition-colors">
              Lihat semua →
            </Link>
          </div>

          {dokumenList.length === 0 ? (
            <div className="p-12 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-bgLight rounded-[18px] flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-semibold text-textPrimary text-sm">Belum ada dokumen</p>
              <p className="text-xs text-textSecondary mt-1 mb-4">Buat invoice, SPH, atau surat hutang pertama</p>
              <Link href="/dokumen/baru"
                className="bg-primary text-white px-5 py-2 rounded-button text-xs font-semibold hover:bg-[#163264] transition-colors shadow-ios">
                Buat Dokumen
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F2F2F7]">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-textSecondary uppercase tracking-wider">Nomor</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-textSecondary uppercase tracking-wider">Tipe</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-textSecondary uppercase tracking-wider hidden md:table-cell">Klien</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-textSecondary uppercase tracking-wider hidden lg:table-cell">Tanggal</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-textSecondary uppercase tracking-wider">Total</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-textSecondary uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dokumenList.map((doc) => (
                    <tr key={doc.id} className="border-b border-[#F2F2F7] hover:bg-bgLight/60 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/dokumen/${doc.id}`}
                          className="text-primary font-semibold text-sm hover:underline">
                          {doc.nomor}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-pill ${tipeColor[doc.tipe] ?? 'bg-gray-50 text-gray-600'}`}>
                          {tipeLabel[doc.tipe] ?? doc.tipe}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-textPrimary hidden md:table-cell">
                        {doc.klienNama ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-xs text-textSecondary hidden lg:table-cell">
                        {formatTanggalPendek(doc.tanggalDokumen)}
                      </td>
                      <td className="px-5 py-3 text-right text-sm font-semibold text-textPrimary">
                        {formatRupiah(doc.total)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={doc.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

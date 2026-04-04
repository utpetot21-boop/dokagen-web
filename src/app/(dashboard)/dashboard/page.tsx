import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchRingkasan, fetchRecentDokumen } from '@/lib/server-api';
import Header from '@/components/layout/Header';
import StatCard from '@/components/dashboard/StatCard';
import StatusBadge from '@/components/dokumen/StatusBadge';
import { formatRupiah, formatTanggalPendek } from '@/lib/formatters';
import Link from 'next/link';

const DocIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const MoneyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const PeopleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const tipeLabel: Record<string, string> = {
  invoice: 'Invoice',
  sph: 'SPH',
  surat_hutang: 'S. Hutang',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Fetch data server-side (parallel)
  const [ringkasan, recentDokumen] = await Promise.allSettled([
    fetchRingkasan(),
    fetchRecentDokumen(),
  ]);

  const stats = ringkasan.status === 'fulfilled' ? ringkasan.value : null;
  const dokumenList = recentDokumen.status === 'fulfilled' ? recentDokumen.value.data : [];

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Dashboard"
        subtitle={`Selamat datang, ${session?.user?.email}`}
        action={
          <Link
            href="/dokumen/baru"
            className="bg-accent text-white px-4 py-2 rounded-button text-sm font-semibold
              hover:bg-[#E09520] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Buat Dokumen
          </Link>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Pendapatan Bulan Ini"
            value={stats ? formatRupiah(stats.pendapatan.bulanIni) : 'Rp 0'}
            subtitle={stats
              ? `${stats.pendapatan.growthPersen >= 0 ? '+' : ''}${stats.pendapatan.growthPersen}% vs bulan lalu`
              : 'Memuat...'}
            color="success"
            icon={<MoneyIcon />}
          />
          <StatCard
            title="Total Dokumen"
            value={stats ? String(stats.dokumen.total) : '0'}
            subtitle={stats ? `+${stats.dokumen.bulanIni} bulan ini` : 'Memuat...'}
            color="primary"
            icon={<DocIcon />}
          />
          <StatCard
            title="Jatuh Tempo"
            value={stats ? String(stats.dokumen.jatuhTempo) : '0'}
            subtitle={stats ? `${stats.dokumen.menungguPembayaran} menunggu bayar` : 'Memuat...'}
            color="danger"
            icon={<AlertIcon />}
          />
          <StatCard
            title="Total Klien"
            value={stats ? String(stats.klien.total) : '0'}
            subtitle="Klien aktif terdaftar"
            color="info"
            icon={<PeopleIcon />}
          />
        </div>

        {/* Dokumen terbaru */}
        <div className="bg-white rounded-card border border-[#E8E8EE]">
          <div className="px-5 py-4 border-b border-[#E8E8EE] flex items-center justify-between">
            <h2 className="font-semibold text-textPrimary">Dokumen Terbaru</h2>
            <Link href="/dokumen" className="text-sm text-primary hover:underline">
              Lihat semua
            </Link>
          </div>

          {dokumenList.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-bgLight rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-medium text-textPrimary">Belum ada dokumen</p>
              <p className="text-sm text-textSecondary mt-1">
                Mulai buat invoice, SPH, atau surat hutang pertama Anda
              </p>
              <Link
                href="/dokumen/baru"
                className="mt-4 bg-primary text-white px-5 py-2 rounded-button text-sm font-semibold
                  hover:bg-[#163264] transition-colors"
              >
                Buat Dokumen Pertama
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-bgLight border-b border-[#E8E8EE]">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Nomor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Tipe</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Klien</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Tanggal</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-textSecondary uppercase tracking-wide">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dokumenList.map((doc) => (
                    <tr key={doc.id} className="border-b border-[#F4F4F8] hover:bg-bgLight/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/dokumen/${doc.id}`} className="text-primary font-semibold text-sm hover:underline">
                          {doc.nomor}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-textSecondary">
                          {tipeLabel[doc.tipe] ?? doc.tipe}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-textPrimary">{doc.klienNama ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-textSecondary">
                        {formatTanggalPendek(doc.tanggalDokumen)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-textPrimary">
                        {formatRupiah(doc.total)}
                      </td>
                      <td className="px-4 py-3">
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

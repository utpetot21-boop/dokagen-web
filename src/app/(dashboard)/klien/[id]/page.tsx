import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/dokumen/StatusBadge';
import { formatRupiah, formatTanggalPendek } from '@/lib/formatters';
import type { Klien } from '@/types/klien';
import type { Dokumen } from '@/types/dokumen';
import Link from 'next/link';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

async function fetchKlien(id: string, token?: string): Promise<Klien> {
  const res = await fetch(`${BASE}/klien/${id}`, {
    headers: { Authorization: `Bearer ${token ?? ''}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Klien tidak ditemukan');
  return (await res.json()).data;
}

async function fetchKlienDokumen(id: string, token?: string): Promise<Dokumen[]> {
  const res = await fetch(`${BASE}/klien/${id}/dokumen?limit=50`, {
    headers: { Authorization: `Bearer ${token ?? ''}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.data ?? [];
}

const tipeLabel: Record<string, string> = {
  invoice: 'Invoice', sph: 'SPH', surat_hutang: 'Surat Hutang',
};

export default async function KlienDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const [klien, dokumen] = await Promise.all([
    fetchKlien(params.id, session?.accessToken),
    fetchKlienDokumen(params.id, session?.accessToken),
  ]);

  const totalPendapatan = dokumen
    .filter((d) => d.tipe === 'invoice' && d.status === 'lunas')
    .reduce((s, d) => s + Number(d.total), 0);

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title={klien.nama}
        subtitle={`${klien.tipe === 'perusahaan' ? 'Perusahaan' : 'Perorangan'} · ${klien.kota ?? '-'}`}
        action={
          <Link
            href="/klien"
            className="flex items-center gap-2 border border-[#E8E8EE] bg-white text-textPrimary
              px-4 py-2 rounded-button text-sm font-semibold hover:bg-bgLight transition-colors"
          >
            ← Kembali
          </Link>
        }
      />

      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Side: Info Klien ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Kontak */}
          <div className="bg-white rounded-card border border-[#E8E8EE] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF3FB] flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-primary">
                  {klien.nama[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-bold text-textPrimary">{klien.nama}</p>
                <span className="text-xs bg-bgLight px-2 py-1 rounded-badge text-textSecondary font-medium">
                  {klien.tipe === 'perusahaan' ? 'Perusahaan' : 'Perorangan'}
                </span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {klien.email && (
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-textSecondary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-textSecondary">{klien.email}</span>
                </div>
              )}
              {klien.noTelp && (
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-textSecondary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-textSecondary">{klien.noTelp}</span>
                </div>
              )}
              {klien.alamat && (
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-textSecondary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-textSecondary">{klien.alamat}{klien.kota ? `, ${klien.kota}` : ''}</span>
                </div>
              )}
              {klien.npwp && (
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-textSecondary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" />
                  </svg>
                  <span className="text-textSecondary">NPWP: {klien.npwp}</span>
                </div>
              )}
              {klien.contactPerson && (
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-textSecondary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-textSecondary">CP: {klien.contactPerson}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-card border border-[#E8E8EE] p-5 space-y-3">
            <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wide">Statistik</h3>
            <div className="flex justify-between text-sm">
              <span className="text-textSecondary">Total Dokumen</span>
              <span className="font-semibold">{dokumen.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-textSecondary">Total Pendapatan</span>
              <span className="font-semibold text-primary">{formatRupiah(totalPendapatan)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-textSecondary">Invoice Lunas</span>
              <span className="font-semibold text-success">
                {dokumen.filter((d) => d.tipe === 'invoice' && d.status === 'lunas').length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-textSecondary">Menunggu Bayar</span>
              <span className="font-semibold text-warning">
                {dokumen.filter((d) => d.tipe === 'invoice' && d.status === 'terkirim').length}
              </span>
            </div>
          </div>

          {/* Edit button */}
          <Link
            href="/klien"
            className="block w-full text-center bg-primary text-white px-4 py-2.5
              rounded-button text-sm font-semibold hover:bg-[#163264] transition-colors"
          >
            Edit Data Klien
          </Link>
        </div>

        {/* ── Main: Riwayat Dokumen ────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-card border border-[#E8E8EE]">
            <div className="px-5 py-4 border-b border-[#E8E8EE] flex items-center justify-between">
              <h2 className="font-semibold text-textPrimary">Riwayat Dokumen</h2>
              <Link
                href={`/dokumen/baru`}
                className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
              >
                + Buat Dokumen
              </Link>
            </div>

            {dokumen.length === 0 ? (
              <div className="p-12 flex flex-col items-center text-center">
                <svg className="w-12 h-12 text-textSecondary opacity-30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-textSecondary text-sm">Belum ada dokumen untuk klien ini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-bgLight border-b border-[#E8E8EE]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Nomor</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Tipe</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Tanggal</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-textSecondary uppercase tracking-wide">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dokumen.map((doc) => (
                      <tr key={doc.id} className="border-b border-[#F4F4F8] hover:bg-bgLight/50">
                        <td className="px-4 py-3">
                          <Link href={`/dokumen/${doc.id}`}
                            className="text-primary font-semibold text-sm hover:underline">
                            {doc.nomor}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-bgLight px-2 py-1 rounded-badge font-medium text-textSecondary">
                            {tipeLabel[doc.tipe] ?? doc.tipe}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-textSecondary">
                          {formatTanggalPendek(doc.tanggalDokumen)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold">
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
    </div>
  );
}

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/dokumen/StatusBadge';
import UpdateStatusButton from '@/components/dokumen/UpdateStatusButton';
import PembayaranSection from '@/components/dokumen/PembayaranSection';
import KirimEmailButton from '@/components/dokumen/KirimEmailButton';
import { formatRupiah, formatTanggal } from '@/lib/formatters';
import Link from 'next/link';
import type { Dokumen } from '@/types/dokumen';

async function fetchDokumen(id: string, token?: string): Promise<Dokumen | null> {
  console.log('[DEBUG] fetchDokumen id:', id, '| token:', token ? 'ADA' : 'TIDAK ADA');
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/dokumen/${id}`;
    console.log('[DEBUG] fetch URL:', url);
    const res = await fetch(url,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
      },
    );
    console.log('[DEBUG] API response status:', res.status);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as Dokumen ?? null;
  } catch {
    return null;
  }
}

function DokumenTidakDitemukan() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-[#F4F4F8] rounded-2xl flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-textPrimary mb-2">Dokumen tidak ditemukan</h2>
      <p className="text-sm text-textSecondary mb-6">
        Dokumen mungkin sudah dihapus atau Anda tidak memiliki akses.
      </p>
      <Link
        href="/dokumen"
        className="px-5 py-2.5 bg-primary text-white rounded-button text-sm font-semibold hover:bg-[#163264] transition-colors"
      >
        Kembali ke Daftar Dokumen
      </Link>
    </div>
  );
}

export default async function DokumenDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const doc = await fetchDokumen(params.id, session?.accessToken);
  if (!doc) return <DokumenTidakDitemukan />;

  const pdfUrl = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/dokumen/${doc.id}/pdf`;

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title={doc.nomor}
        subtitle={`${doc.tipe === 'invoice' ? 'Invoice' : doc.tipe === 'sph' ? 'SPH' : doc.tipe === 'kasbon' ? 'Kasbon' : 'Surat Hutang'} · ${formatTanggal(doc.tanggalDokumen)}`}
        action={
          <div className="flex gap-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-[#E8E8EE] bg-white text-textPrimary px-4 py-2
                rounded-button text-sm font-semibold hover:bg-bgLight transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </a>
            <Link
              href={`/dokumen/${doc.id}/edit`}
              className="bg-primary text-white px-4 py-2 rounded-button text-sm font-semibold
                hover:bg-[#163264] transition-colors"
            >
              Edit
            </Link>
          </div>
        }
      />

      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main col */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header info */}
          <div className="bg-white rounded-card border border-[#E8E8EE] p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-textSecondary uppercase tracking-wide font-semibold mb-1">Nomor Dokumen</p>
                <p className="text-lg font-bold text-primary">{doc.nomor}</p>
                {doc.judul && <p className="text-sm text-textSecondary mt-1">{doc.judul}</p>}
              </div>
              <StatusBadge status={doc.status} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-textSecondary text-xs font-semibold uppercase tracking-wide">Tanggal</p>
                <p className="font-medium mt-1">{formatTanggal(doc.tanggalDokumen)}</p>
              </div>
              {doc.tanggalJatuhTempo && (
                <div>
                  <p className="text-textSecondary text-xs font-semibold uppercase tracking-wide">Jatuh Tempo</p>
                  <p className="font-medium mt-1 text-danger">{formatTanggal(doc.tanggalJatuhTempo)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Klien */}
          <div className="bg-white rounded-card border border-[#E8E8EE] p-5">
            <p className="text-xs text-textSecondary uppercase tracking-wide font-semibold mb-3">Klien</p>
            <p className="font-semibold text-textPrimary">{doc.klienNama ?? '-'}</p>
            {doc.klienAlamat && <p className="text-sm text-textSecondary mt-1">{doc.klienAlamat}</p>}
            <div className="flex gap-4 mt-2 text-sm text-textSecondary">
              {doc.klienNoTelp && <span>{doc.klienNoTelp}</span>}
              {doc.klienEmail && <span>{doc.klienEmail}</span>}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-card border border-[#E8E8EE] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#F4F4F8]">
              <p className="text-xs text-textSecondary uppercase tracking-wide font-semibold">Item</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-bgLight text-xs text-textSecondary uppercase tracking-wide">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Nama</th>
                  <th className="px-4 py-2 text-center">Qty</th>
                  <th className="px-4 py-2 text-right">Harga</th>
                  <th className="px-4 py-2 text-center">Diskon</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {doc.items.map((item) => (
                  <tr key={item.id} className="border-t border-[#F4F4F8]">
                    <td className="px-4 py-3 text-sm text-textSecondary">{item.urutan}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{item.nama}</p>
                      {item.deskripsi && <p className="text-xs text-textSecondary">{item.deskripsi}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">{item.qty} {item.satuan}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatRupiah(item.hargaSatuan)}</td>
                    <td className="px-4 py-3 text-sm text-center">{item.diskonPersen}%</td>
                    <td className="px-4 py-3 text-sm font-semibold text-right">{formatRupiah(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="bg-white rounded-card border border-[#E8E8EE] p-5">
            <div className="max-w-xs ml-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-textSecondary">Subtotal</span>
                <span>{formatRupiah(doc.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-textSecondary">Diskon ({doc.diskonPersen}%)</span>
                <span>- {formatRupiah(doc.diskonNominal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-textSecondary">PPN ({doc.pajakPersen}%)</span>
                <span>{formatRupiah(doc.pajakNominal)}</span>
              </div>
              <div className="border-t border-[#1A3C6E] pt-3 flex justify-between font-bold text-primary text-base">
                <span>TOTAL</span>
                <span>{formatRupiah(doc.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side col */}
        <div className="space-y-4">
          {/* Catatan */}
          {doc.catatan && (
            <div className="bg-white rounded-card border border-[#E8E8EE] p-5">
              <p className="text-xs text-textSecondary uppercase tracking-wide font-semibold mb-2">Catatan</p>
              <p className="text-sm text-textPrimary whitespace-pre-wrap">{doc.catatan}</p>
            </div>
          )}

          {/* Syarat */}
          {doc.syaratKetentuan && (
            <div className="bg-white rounded-card border border-[#E8E8EE] p-5">
              <p className="text-xs text-textSecondary uppercase tracking-wide font-semibold mb-2">Syarat & Ketentuan</p>
              <p className="text-sm text-textPrimary whitespace-pre-wrap">{doc.syaratKetentuan}</p>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-card border border-[#E8E8EE] p-5 space-y-2">
            <p className="text-xs text-textSecondary uppercase tracking-wide font-semibold mb-3">Aksi</p>

            {/* Status transitions — invoice & sph */}
            {(doc.tipe === 'invoice' || doc.tipe === 'sph') && doc.status === 'draft' && (
              <UpdateStatusButton docId={doc.id} newStatus="terkirim" label="Tandai Terkirim" color="primary" />
            )}
            {doc.tipe === 'invoice' && doc.status === 'terkirim' && (
              <UpdateStatusButton docId={doc.id} newStatus="lunas" label="Tandai Lunas" color="success" />
            )}
            {doc.tipe === 'sph' && doc.status === 'terkirim' && (
              <>
                <UpdateStatusButton docId={doc.id} newStatus="diterima" label="Tandai Diterima" color="success" />
                <UpdateStatusButton docId={doc.id} newStatus="ditolak" label="Tandai Ditolak" color="danger" />
              </>
            )}

            {/* Status transitions — surat_hutang & kasbon */}
            {(doc.tipe === 'surat_hutang' || doc.tipe === 'kasbon') && doc.status === 'draft' && (
              <UpdateStatusButton docId={doc.id} newStatus="aktif" label="Aktifkan" color="primary" />
            )}
            {(doc.tipe === 'surat_hutang' || doc.tipe === 'kasbon') && doc.status === 'aktif' && (
              <UpdateStatusButton docId={doc.id} newStatus="lunas" label="Tandai Lunas" color="success" />
            )}

            {/* Edit — hanya saat draft */}
            {doc.status === 'draft' && (
              <Link
                href={`/dokumen/${doc.id}/edit`}
                className="w-full block text-center border border-[#E8E8EE] text-textPrimary
                  px-4 py-2 rounded-button text-sm font-semibold hover:bg-bgLight transition-colors"
              >
                Edit Dokumen
              </Link>
            )}

            {/* Kirim via Email */}
            <KirimEmailButton
              docId={doc.id}
              klienEmail={doc.klienEmail}
              nomor={doc.nomor}
            />
          </div>

          {/* Pembayaran */}
          {(doc.tipe === 'invoice' || doc.tipe === 'kasbon') && (
            <PembayaranSection dokumenId={doc.id} totalDokumen={doc.total} />
          )}
        </div>
      </div>
    </div>
  );
}

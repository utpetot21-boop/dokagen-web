import Link from 'next/link';

export default function DokumenNotFound() {
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

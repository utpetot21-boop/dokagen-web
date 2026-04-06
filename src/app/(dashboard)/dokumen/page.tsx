import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchRecentDokumen } from '@/lib/server-api';
import Header from '@/components/layout/Header';
import DokumenTableClient from '@/components/dokumen/DokumenTableClient';
import Link from 'next/link';

export default async function DokumenPage() {
  await getServerSession(authOptions); // guard — layout handles redirect

  const initial = await fetchRecentDokumen().catch(() => ({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }));

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Dokumen"
        subtitle="Kelola invoice, SPH, dan surat hutang"
        action={
          <Link
            href="/dokumen/baru"
            className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-button text-sm font-semibold hover:bg-[#163264] transition-all shadow-ios"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Buat Dokumen
          </Link>
        }
      />
      <div className="flex-1 p-6">
        <DokumenTableClient initialData={initial} />
      </div>
    </div>
  );
}

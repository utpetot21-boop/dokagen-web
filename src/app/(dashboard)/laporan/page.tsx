import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Header from '@/components/layout/Header';
import LaporanClient from '@/components/laporan/LaporanClient';

export default async function LaporanPage() {
  const session = await getServerSession(authOptions);
  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Laporan"
        subtitle="Ringkasan keuangan dan performa bisnis"
        action={
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/laporan/export-csv`}
            className="flex items-center gap-2 border border-[#E8E8EE] bg-white text-textPrimary
              px-4 py-2 rounded-button text-sm font-semibold hover:bg-bgLight transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </a>
        }
      />
      <div className="flex-1 p-6">
        <LaporanClient accessToken={session?.accessToken} />
      </div>
    </div>
  );
}

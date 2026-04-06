import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Header from '@/components/layout/Header';
import LaporanClient from '@/components/laporan/LaporanClient';
import ExportCsvButton from '@/components/laporan/ExportCsvButton';

export default async function LaporanPage() {
  const session = await getServerSession(authOptions);
  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Laporan"
        subtitle="Ringkasan keuangan dan performa bisnis"
        action={<ExportCsvButton />}
      />
      <div className="flex-1 p-5">
        <LaporanClient accessToken={session?.accessToken} />
      </div>
    </div>
  );
}

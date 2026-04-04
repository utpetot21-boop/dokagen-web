import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Header from '@/components/layout/Header';
import PengaturanClient from '@/components/pengaturan/PengaturanClient';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

async function fetchPerusahaan(token?: string) {
  if (!token) return null;
  const res = await fetch(`${BASE}/perusahaan/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export default async function PengaturanPage() {
  const session = await getServerSession(authOptions);
  const perusahaan = await fetchPerusahaan(session?.accessToken);

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Pengaturan"
        subtitle="Profil perusahaan, dokumen, dan rekening bank"
      />
      <div className="flex-1 p-6">
        <PengaturanClient
          initialData={perusahaan}
          accessToken={session?.accessToken}
        />
      </div>
    </div>
  );
}

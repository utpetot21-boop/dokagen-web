import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import FormDokumenClient from '@/components/dokumen/FormDokumenClient';

async function fetchDokumen(id: string, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/dokumen/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Gagal mengambil dokumen');
  const json = await res.json();
  return json.data;
}

export default async function EditDokumenPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) redirect('/login');

  const doc = await fetchDokumen(params.id, session.accessToken);
  if (!doc) notFound();

  if (doc.status !== 'draft') {
    redirect(`/dokumen/${params.id}`);
  }

  const tipeLabel = doc.tipe === 'invoice' ? 'Invoice'
    : doc.tipe === 'sph' ? 'SPH'
    : 'Surat Hutang';

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title={`Edit ${tipeLabel}`}
        subtitle={doc.nomor}
      />
      <div className="flex-1 p-6">
        <FormDokumenClient
          initialData={{
            id: doc.id,
            tipe: doc.tipe,
            klienId: doc.klienId,
            judul: doc.judul,
            tanggalDokumen: doc.tanggalDokumen,
            tanggalJatuhTempo: doc.tanggalJatuhTempo,
            diskonPersen: doc.diskonPersen,
            pajakPersen: doc.pajakPersen,
            catatan: doc.catatan,
            syaratKetentuan: doc.syaratKetentuan,
            nominalHutang: doc.nominalHutang,
            cicilanPerBulan: doc.cicilanPerBulan,
            items: doc.items ?? [],
          }}
        />
      </div>
    </div>
  );
}

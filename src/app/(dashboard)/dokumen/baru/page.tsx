import Header from '@/components/layout/Header';
import FormDokumenClient from '@/components/dokumen/FormDokumenClient';

export default function BuatDokumenPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Buat Dokumen"
        subtitle="Invoice, SPH, atau Surat Hutang"
      />
      <div className="flex-1 p-6">
        <FormDokumenClient />
      </div>
    </div>
  );
}

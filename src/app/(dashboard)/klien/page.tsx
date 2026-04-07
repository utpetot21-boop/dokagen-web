import Header from '@/components/layout/Header';
import KlienTableClient from '@/components/klien/KlienTableClient';

export default function KlienPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Klien"
        subtitle="Kelola data klien dan pelanggan"
      />
      <div className="flex-1 p-6">
        <KlienTableClient />
      </div>
    </div>
  );
}

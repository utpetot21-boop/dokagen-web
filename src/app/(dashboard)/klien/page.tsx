import Header from '@/components/layout/Header';
import KlienTableClient from '@/components/klien/KlienTableClient';

export default function KlienPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Klien"
        subtitle="Kelola data klien dan pelanggan"
        action={
          <button
            id="btn-tambah-klien"
            className="bg-accent text-white px-4 py-2 rounded-button text-sm font-semibold
              hover:bg-[#E09520] transition-colors flex items-center gap-2"
            onClick={undefined}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Klien
          </button>
        }
      />
      <div className="flex-1 p-6">
        <KlienTableClient />
      </div>
    </div>
  );
}

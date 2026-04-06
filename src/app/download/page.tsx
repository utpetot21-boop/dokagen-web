import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download DokaGen | Invoice & Dokumen UMKM',
  description:
    'Download aplikasi DokaGen untuk Android. Buat invoice, SPH, surat hutang, dan scan dokumen langsung dari smartphone.',
};

const APK_VERSION = '1.0.0';
const APK_SIZE = '63 MB';
// Ganti URL ini setelah APK di-upload ke Google Drive / storage
const APK_URL = 'https://drive.google.com/your-apk-link-here';

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1A3C6E] to-[#2D5FA6] flex flex-col items-center justify-center p-6">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        {/* Logo & nama */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-[#1A3C6E] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" className="w-11 h-11">
              <path
                d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2A2 2 0 019 4z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">DokaGen</h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            Invoice, SPH &amp; Surat Hutang dalam genggaman
          </p>
        </div>

        {/* Info versi */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Versi Terbaru
            </p>
            <p className="text-base font-bold text-gray-900 mt-0.5">
              v{APK_VERSION}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Ukuran
            </p>
            <p className="text-base font-bold text-gray-900 mt-0.5">{APK_SIZE}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Platform
            </p>
            <p className="text-base font-bold text-[#1A3C6E] mt-0.5">Android</p>
          </div>
        </div>

        {/* Tombol download */}
        <a
          href={APK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-[#1A3C6E] hover:bg-[#2D5FA6] active:bg-[#132d54] text-white text-center font-bold text-base py-4 rounded-2xl transition-colors shadow-md mb-4"
        >
          ⬇️ Download APK
        </a>

        {/* Cara install */}
        <div className="border border-gray-100 rounded-2xl p-4 mb-6">
          <p className="text-xs font-semibold text-gray-700 mb-3">
            Cara Install:
          </p>
          <ol className="space-y-2">
            {[
              'Download APK di atas',
              'Buka file manager → temukan file DokaGen.apk',
              'Jika muncul peringatan "Sumber Tidak Dikenal", pilih Tetap Install',
              'Ikuti proses instalasi hingga selesai',
              'Buka aplikasi DokaGen dan daftar akun',
            ].map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-600">
                <span className="flex-shrink-0 w-5 h-5 bg-[#1A3C6E] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Fitur singkat */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: '🧾', label: 'Invoice & SPH' },
            { icon: '📄', label: 'Surat Hutang' },
            { icon: '📷', label: 'Scan ke PDF' },
            { icon: '📤', label: 'Kirim ke WA' },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="bg-blue-50 rounded-xl p-3 flex items-center gap-2"
            >
              <span className="text-lg">{icon}</span>
              <span className="text-xs font-semibold text-[#1A3C6E]">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          Butuh bantuan?{' '}
          <a
            href="https://wa.me/62"
            className="text-[#25D366] font-semibold hover:underline"
          >
            Hubungi via WhatsApp
          </a>
        </p>
      </div>

      {/* QR code hint */}
      <p className="text-white/60 text-xs mt-6 text-center">
        Scan QR code atau bagikan link ini ke karyawan Anda
      </p>
    </main>
  );
}

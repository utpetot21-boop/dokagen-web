'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

interface Props {
  docId: string;
  klienEmail?: string;
  nomor: string;
}

export default function KirimEmailButton({ docId, klienEmail, nomor }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(klienEmail ?? '');
  const [pesan, setPesan] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSend = async () => {
    if (!session?.accessToken) return;
    if (!email.trim()) { setError('Email tidak boleh kosong'); return; }
    setSending(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${BASE}/dokumen/${docId}/kirim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ email: email.trim(), pesan: pesan.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.message ?? 'Gagal mengirim'); return; }
      setSuccess(`Dokumen ${nomor} berhasil dikirim ke ${email}`);
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Tombol trigger */}
      <button
        onClick={() => { setOpen(true); setSuccess(''); setError(''); }}
        className="w-full px-4 py-2 rounded-button text-sm font-semibold transition-colors
          border border-[#E8E8EE] text-textPrimary hover:bg-bgLight"
      >
        Kirim via Email
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card w-full max-w-md shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E8EE]">
              <h3 className="font-semibold text-textPrimary">Kirim via Email</h3>
              <button onClick={() => setOpen(false)}
                className="text-textSecondary hover:text-textPrimary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {success ? (
                <div className="bg-[#E1F5EE] text-[#085041] px-4 py-3 rounded-card text-sm">
                  {success}
                </div>
              ) : (
                <>
                  {error && (
                    <div className="bg-[#FCEBEB] text-[#791F1F] px-4 py-3 rounded-card text-sm">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wide mb-1">
                      Email Penerima *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-[#E8E8EE] rounded-input px-3 py-2 text-sm
                        focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      placeholder="klien@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wide mb-1">
                      Pesan (opsional)
                    </label>
                    <textarea
                      value={pesan}
                      onChange={(e) => setPesan(e.target.value)}
                      rows={3}
                      className="w-full border border-[#E8E8EE] rounded-input px-3 py-2 text-sm
                        focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
                      placeholder="Halo, terlampir dokumen..."
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-[#E8E8EE]">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-button text-sm font-semibold border border-[#E8E8EE]
                  text-textPrimary hover:bg-bgLight transition-colors"
              >
                {success ? 'Tutup' : 'Batal'}
              </button>
              {!success && (
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="px-4 py-2 rounded-button text-sm font-semibold bg-primary text-white
                    hover:bg-[#163264] transition-colors disabled:opacity-60"
                >
                  {sending ? 'Mengirim...' : 'Kirim PDF'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

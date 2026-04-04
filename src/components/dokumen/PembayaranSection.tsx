'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { formatRupiah } from '@/lib/formatters';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

interface Pembayaran {
  id: string;
  tanggal: string;
  jumlah: number;
  metode: string;
  noReferensi?: string;
  catatan?: string;
}

const METODE = ['transfer', 'tunai', 'qris', 'cek', 'giro'] as const;
const metodeLabel: Record<string, string> = {
  transfer: 'Transfer Bank', tunai: 'Tunai', qris: 'QRIS', cek: 'Cek', giro: 'Giro',
};

export default function PembayaranSection({
  dokumenId,
  totalDokumen,
}: {
  dokumenId: string;
  totalDokumen: number;
}) {
  const { data: session } = useSession();
  const [items, setItems] = useState<Pembayaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().substring(0, 10),
    jumlah: String(Math.round(totalDokumen)),
    metode: 'transfer',
    noReferensi: '',
    catatan: '',
  });

  const fetchPembayaran = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/dokumen/${dokumenId}/pembayaran`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      const json = await res.json();
      setItems(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [dokumenId, session?.accessToken]);

  useEffect(() => { fetchPembayaran(); }, [fetchPembayaran]);

  const totalBayar = items.reduce((s, p) => s + Number(p.jumlah), 0);
  const sisa = totalDokumen - totalBayar;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.accessToken) return;
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/dokumen/${dokumenId}/pembayaran`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          tanggal: form.tanggal,
          jumlah: parseFloat(form.jumlah),
          metode: form.metode,
          ...(form.noReferensi && { noReferensi: form.noReferensi }),
          ...(form.catatan && { catatan: form.catatan }),
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.message ?? 'Gagal menyimpan'); return; }
      setShowForm(false);
      setForm({ tanggal: new Date().toISOString().substring(0, 10), jumlah: String(Math.round(sisa > 0 ? sisa : totalDokumen)), metode: 'transfer', noReferensi: '', catatan: '' });
      fetchPembayaran();
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full border border-[#E8E8EE] rounded-input px-3 py-2 text-sm focus:outline-none focus:border-primary';
  const labelCls = 'block text-xs font-semibold text-textSecondary uppercase tracking-wide mb-1';

  return (
    <div className="bg-white rounded-card border border-[#E8E8EE] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-textSecondary uppercase tracking-wide font-semibold">
          Pembayaran
        </p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-xs font-semibold text-primary hover:underline"
        >
          {showForm ? 'Batal' : '+ Catat'}
        </button>
      </div>

      {/* Form tambah */}
      {showForm && (
        <form onSubmit={handleSave} className="space-y-3 mb-4 p-3 bg-bgLight rounded-xl">
          {error && (
            <p className="text-xs text-danger bg-[#FCEBEB] px-3 py-2 rounded">{error}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tanggal</label>
              <input type="date" value={form.tanggal}
                onChange={(e) => setForm((p) => ({ ...p, tanggal: e.target.value }))}
                className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Jumlah (Rp)</label>
              <input type="number" value={form.jumlah}
                onChange={(e) => setForm((p) => ({ ...p, jumlah: e.target.value }))}
                className={inputCls} required min={1} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Metode</label>
            <select value={form.metode}
              onChange={(e) => setForm((p) => ({ ...p, metode: e.target.value }))}
              className={inputCls}>
              {METODE.map((m) => (
                <option key={m} value={m}>{metodeLabel[m]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>No. Referensi (opsional)</label>
            <input type="text" value={form.noReferensi}
              onChange={(e) => setForm((p) => ({ ...p, noReferensi: e.target.value }))}
              placeholder="No. transaksi / bukti" className={inputCls} />
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-sm border border-[#E8E8EE] rounded-button font-medium hover:bg-bgLight">
              Batal
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-1.5 text-sm bg-primary text-white rounded-button font-semibold
                hover:bg-[#163264] disabled:opacity-60">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      )}

      {/* Ringkasan */}
      <div className="space-y-1.5 text-sm mb-3">
        <div className="flex justify-between">
          <span className="text-textSecondary">Total Tagihan</span>
          <span className="font-medium">{formatRupiah(totalDokumen)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-textSecondary">Terbayar</span>
          <span className="font-medium text-success">{formatRupiah(totalBayar)}</span>
        </div>
        {sisa > 0 && (
          <div className="flex justify-between border-t border-[#F4F4F8] pt-1.5">
            <span className="font-semibold text-textPrimary">Sisa</span>
            <span className="font-bold text-danger">{formatRupiah(sisa)}</span>
          </div>
        )}
        {sisa <= 0 && totalBayar > 0 && (
          <div className="flex items-center gap-1.5 text-success text-xs font-semibold pt-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Lunas
          </div>
        )}
      </div>

      {/* Riwayat */}
      {loading ? (
        <div className="flex justify-center py-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-textSecondary text-center py-3">Belum ada catatan pembayaran</p>
      ) : (
        <div className="space-y-2">
          {items.map((p) => (
            <div key={p.id}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-bgLight">
              <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-textPrimary">{formatRupiah(p.jumlah)}</p>
                <p className="text-xs text-textSecondary">
                  {metodeLabel[p.metode] ?? p.metode} · {new Date(p.tanggal).toLocaleDateString('id-ID')}
                </p>
                {p.noReferensi && (
                  <p className="text-xs text-textSecondary truncate">Ref: {p.noReferensi}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

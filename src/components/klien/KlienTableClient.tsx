'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { Klien, KlienFormInput } from '@/types/klien';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
const inputCls = 'w-full bg-bgLight border-0 rounded-input px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-textSecondary';
const labelCls = 'block text-xs font-semibold text-textSecondary uppercase tracking-wide mb-1.5';

export default function KlienTableClient() {
  const { data: session } = useSession();
  const [klien, setKlien] = useState<Klien[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Klien | null>(null);
  const [form, setForm] = useState<KlienFormInput>({ tipe: 'personal', nama: '', alamat: '', kota: '', noTelp: '', email: '' } as KlienFormInput);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchKlien = useCallback(async (q?: string) => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (q) params.set('search', q);
      const res = await fetch(`${BASE}/klien?${params}`, { headers: { Authorization: `Bearer ${session.accessToken}` } });
      const json = await res.json();
      setKlien(json.data?.data ?? []);
    } finally { setLoading(false); }
  }, [session?.accessToken]);

  useEffect(() => { fetchKlien(); }, [fetchKlien]);

  const openCreate = () => {
    setEditing(null);
    setForm({ tipe: 'personal', nama: '', alamat: '', kota: '', noTelp: '', email: '' } as KlienFormInput);
    setFormError(''); setShowModal(true);
  };

  const openEdit = (k: Klien) => {
    setEditing(k);
    setForm({ tipe: k.tipe, nama: k.nama, alamat: k.alamat, kota: k.kota, noTelp: k.noTelp, email: k.email });
    setFormError(''); setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;
    setSaving(true); setFormError('');
    try {
      const res = await fetch(editing ? `${BASE}/klien/${editing.id}` : `${BASE}/klien`, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { setFormError(json.message ?? 'Gagal menyimpan'); return; }
      setShowModal(false); fetchKlien(search);
    } catch { setFormError('Terjadi kesalahan jaringan'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!session?.accessToken || !confirm('Hapus klien ini?')) return;
    await fetch(`${BASE}/klien/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${session.accessToken}` } });
    fetchKlien(search);
  };

  return (
    <>
      <div className="bento-card flex flex-col">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-[#F2F2F7] flex gap-2 items-center">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Cari nama, email, atau telepon..." value={search}
              onChange={(e) => { setSearch(e.target.value); fetchKlien(e.target.value); }}
              className="w-full bg-bgLight border-0 rounded-input pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-button
              text-sm font-semibold hover:bg-[#163264] transition-all shadow-ios whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Klien
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : klien.length === 0 ? (
          <div className="p-16 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-bgLight rounded-[18px] flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="font-semibold text-textPrimary text-sm">Belum ada klien</p>
            <p className="text-xs text-textSecondary mt-1 mb-4">Tambahkan klien pertama Anda</p>
            <button onClick={openCreate}
              className="bg-primary text-white px-5 py-2 rounded-button text-xs font-semibold hover:bg-[#163264] transition-colors shadow-ios">
              Tambah Klien
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F2F2F7]">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-textSecondary uppercase tracking-wider">Nama</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-textSecondary uppercase tracking-wider hidden sm:table-cell">Tipe</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-textSecondary uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-textSecondary uppercase tracking-wider hidden lg:table-cell">Telepon</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-textSecondary uppercase tracking-wider hidden lg:table-cell">Kota</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {klien.map((k) => (
                  <tr key={k.id} className="border-b border-[#F2F2F7] hover:bg-bgLight/60 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/klien/${k.id}`} className="text-sm font-semibold text-primary hover:underline">{k.nama}</Link>
                      {k.contactPerson && <p className="text-xs text-textSecondary mt-0.5">{k.contactPerson}</p>}
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-pill ${k.tipe === 'perusahaan' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                        {k.tipe === 'perusahaan' ? 'Perusahaan' : 'Perorangan'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-textSecondary hidden md:table-cell">{k.email ?? '—'}</td>
                    <td className="px-5 py-3 text-sm text-textSecondary hidden lg:table-cell">{k.noTelp ?? '—'}</td>
                    <td className="px-5 py-3 text-sm text-textSecondary hidden lg:table-cell">{k.kota ?? '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-3 justify-end">
                        <button onClick={() => openEdit(k)} className="text-xs text-primary font-semibold hover:underline">Edit</button>
                        <button onClick={() => handleDelete(k.id)} className="text-xs text-danger font-semibold hover:underline">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-ios-lg animate-slide-up">
            <div className="px-6 py-4 border-b border-[#F2F2F7] flex justify-between items-center">
              <h2 className="font-bold text-textPrimary tracking-tight">{editing ? 'Edit Klien' : 'Tambah Klien'}</h2>
              <button onClick={() => setShowModal(false)}
                className="w-7 h-7 bg-bgLight rounded-full flex items-center justify-center text-textSecondary hover:text-textPrimary transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 text-danger px-3 py-2.5 rounded-[10px] text-sm">{formError}</div>
              )}
              <div>
                <label className={labelCls}>Tipe Klien</label>
                <select value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value as 'personal' | 'perusahaan' })} className={inputCls}>
                  <option value="personal">Perorangan</option>
                  <option value="perusahaan">Perusahaan</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Nama *</label>
                <input type="text" required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className={inputCls} placeholder="Nama lengkap atau perusahaan" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputCls} placeholder="email@contoh.com" />
                </div>
                <div>
                  <label className={labelCls}>Telepon</label>
                  <input type="text" value={form.noTelp ?? ''} onChange={(e) => setForm({ ...form, noTelp: e.target.value })}
                    className={inputCls} placeholder="08xx" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Alamat</label>
                <input type="text" value={form.alamat ?? ''} onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  className={inputCls} placeholder="Jl. ..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Kota</label>
                  <input type="text" value={form.kota ?? ''} onChange={(e) => setForm({ ...form, kota: e.target.value })}
                    className={inputCls} placeholder="Jakarta" />
                </div>
                <div>
                  <label className={labelCls}>Provinsi</label>
                  <input type="text" value={form.provinsi ?? ''} onChange={(e) => setForm({ ...form, provinsi: e.target.value })}
                    className={inputCls} placeholder="DKI Jakarta" />
                </div>
              </div>
              <div className="flex gap-2.5 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-bgLight rounded-button text-sm font-semibold text-textPrimary hover:bg-border transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-primary text-white rounded-button text-sm font-semibold hover:bg-[#163264] transition-colors shadow-ios disabled:opacity-60">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

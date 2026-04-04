'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { Klien, KlienFormInput } from '@/types/klien';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

const inputCls =
  'w-full border border-[#E8E8EE] rounded-input px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20';
const labelCls =
  'block text-xs font-semibold text-textSecondary uppercase tracking-wide mb-1';

export default function KlienTableClient() {
  const { data: session } = useSession();
  const [klien, setKlien] = useState<Klien[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Klien | null>(null);
  const [form, setForm] = useState<KlienFormInput>({
    tipe: 'personal',
    nama: '',
    alamat: '',
    kota: '',
    noTelp: '',
    email: '',
  } as KlienFormInput);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchKlien = useCallback(
    async (q?: string) => {
      if (!session?.accessToken) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: '50' });
        if (q) params.set('search', q);
        const res = await fetch(`${BASE}/klien?${params}`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        const json = await res.json();
        setKlien(json.data?.data ?? []);
      } finally {
        setLoading(false);
      }
    },
    [session?.accessToken],
  );

  useEffect(() => { fetchKlien(); }, [fetchKlien]);

  const openCreate = () => {
    setEditing(null);
    setForm({ tipe: 'personal', nama: '', alamat: '', kota: '', noTelp: '', email: '' } as KlienFormInput);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (k: Klien) => {
    setEditing(k);
    setForm({ tipe: k.tipe, nama: k.nama, alamat: k.alamat, kota: k.kota, noTelp: k.noTelp, email: k.email });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;
    setSaving(true);
    setFormError('');
    try {
      const url = editing ? `${BASE}/klien/${editing.id}` : `${BASE}/klien`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { setFormError(json.message ?? 'Gagal menyimpan'); return; }
      setShowModal(false);
      fetchKlien(search);
    } catch {
      setFormError('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!session?.accessToken) return;
    if (!confirm('Hapus klien ini?')) return;
    await fetch(`${BASE}/klien/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    fetchKlien(search);
  };

  return (
    <div className="bg-white rounded-card border border-[#E8E8EE]">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-[#F4F4F8] flex gap-3 items-center">
        <input
          type="text"
          placeholder="Cari nama, email, atau telepon..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); fetchKlien(e.target.value); }}
          className="flex-1 border border-[#E8E8EE] rounded-input px-3 py-2 text-sm
            focus:outline-none focus:border-primary"
        />
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-button
            text-sm font-semibold hover:bg-[#E09520] transition-colors whitespace-nowrap"
        >
          + Tambah Klien
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : klien.length === 0 ? (
        <div className="p-16 flex flex-col items-center">
          <p className="font-medium text-textPrimary">Belum ada klien</p>
          <button onClick={openCreate} className="mt-4 bg-primary text-white px-5 py-2 rounded-button text-sm font-semibold">
            Tambah Klien Pertama
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bgLight border-b border-[#E8E8EE]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Tipe</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Telepon</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Kota</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {klien.map((k) => (
                <tr key={k.id} className="border-b border-[#F4F4F8] hover:bg-bgLight/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/klien/${k.id}`} className="text-sm font-semibold text-primary hover:underline">{k.nama}</Link>
                    {k.contactPerson && (
                      <p className="text-xs text-textSecondary">{k.contactPerson}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-bgLight px-2 py-1 rounded-badge font-medium text-textSecondary">
                      {k.tipe === 'perusahaan' ? 'Perusahaan' : 'Perorangan'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-textSecondary">{k.email ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-textSecondary">{k.noTelp ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-textSecondary">{k.kota ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(k)}
                        className="text-xs text-primary font-semibold hover:underline">Edit</button>
                      <button onClick={() => handleDelete(k.id)}
                        className="text-xs text-danger font-semibold hover:underline">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-6 py-4 border-b border-[#E8E8EE] flex justify-between items-center">
              <h2 className="font-semibold text-textPrimary">
                {editing ? 'Edit Klien' : 'Tambah Klien'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-textSecondary hover:text-textPrimary text-xl">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="bg-[#FCEBEB] text-[#791F1F] px-3 py-2 rounded text-sm">{formError}</div>
              )}
              <div>
                <label className={labelCls}>Tipe Klien</label>
                <select value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value as 'personal' | 'perusahaan' })}
                  className={inputCls}>
                  <option value="personal">Perorangan</option>
                  <option value="perusahaan">Perusahaan</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Nama *</label>
                <input type="text" required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className={inputCls} placeholder="Nama lengkap atau perusahaan" />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#E8E8EE] rounded-button text-sm font-semibold
                    text-textPrimary hover:bg-bgLight transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-primary text-white rounded-button text-sm font-semibold
                    hover:bg-[#163264] transition-colors disabled:opacity-60">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

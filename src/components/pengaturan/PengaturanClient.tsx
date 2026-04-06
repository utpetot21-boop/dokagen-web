'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

interface Perusahaan {
  id: string;
  nama: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
  kodePos?: string;
  npwp?: string;
  noTelp?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  ttdUrl?: string;
  stempelUrl?: string;
  temaInvoice?: string;
  // Prefix nomor dokumen
  prefixInvoice?: string;
  prefixSph?: string;
  prefixSuratHutang?: string;
  prefixKasbon?: string;
  // Kode unik perusahaan untuk nomor dokumen (INV-0001/KODE/IV/2026)
  kodeDokumen?: string;
  // Counter urutan per tipe
  counterInvoice?: number;
  counterSph?: number;
  counterSuratHutang?: number;
  counterKasbon?: number;
  pajakDefaultPersen?: number;
  // Penanda tangan dokumen
  namaDirektur?: string;
  jabatanDirektur?: string;
  // Bank
  namaBank?: string;
  noRekening?: string;
  atasNama?: string;
  cabangBank?: string;
}

const inputCls = 'w-full border border-[#E8E8EE] rounded-input px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20';
const labelCls = 'block text-xs font-semibold text-textSecondary uppercase tracking-wide mb-1';

interface UserItem {
  id: string;
  email: string;
  nama?: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

type TabKey = 'profil' | 'dokumen' | 'bank' | 'tema' | 'identitas' | 'pengguna';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'profil', label: 'Profil Perusahaan' },
  { key: 'identitas', label: 'Logo & TTD' },
  { key: 'dokumen', label: 'Pengaturan Dokumen' },
  { key: 'bank', label: 'Rekening Bank' },
  { key: 'tema', label: 'Tema Invoice' },
  { key: 'pengguna', label: 'Pengguna' },
];

export default function PengaturanClient({
  initialData,
  accessToken,
}: {
  initialData: Perusahaan | null;
  accessToken?: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const token = accessToken ?? session?.accessToken;
  const [activeTab, setActiveTab] = useState<TabKey>('profil');
  const [form, setForm] = useState<Partial<Perusahaan>>(initialData ?? {});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<string | null>(null);

  const logoRef = useRef<HTMLInputElement>(null);
  const ttdRef = useRef<HTMLInputElement>(null);
  const stempelRef = useRef<HTMLInputElement>(null);

  // ── User Management state ──────────────────────────────────────────────────
  const [users, setUsers] = useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [userForm, setUserForm] = useState({ email: '', nama: '', password: '', role: 'staff' });
  const [userSaving, setUserSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setUsersLoading(true);
    try {
      const res = await fetch(`${BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setUsers(json.data ?? []);
    } finally {
      setUsersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'pengguna') fetchUsers();
  }, [activeTab, fetchUsers]);

  const set = (field: keyof Perusahaan, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleUpload = async (tipe: 'logo' | 'ttd' | 'stempel', file: File) => {
    if (!token) return;
    setUploading(tipe);
    setError('');
    try {
      const fd = new FormData();
      fd.append(tipe, file);
      const res = await fetch(`${BASE}/perusahaan/${tipe}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) { setError(json.message ?? 'Gagal upload'); return; }
      const urlKey = tipe === 'logo' ? 'logoUrl' : tipe === 'ttd' ? 'ttdUrl' : 'stempelUrl';
      setForm((prev) => ({ ...prev, [urlKey]: json.data[urlKey] }));
      setSuccess(`${tipe === 'logo' ? 'Logo' : tipe === 'ttd' ? 'Tanda tangan' : 'Stempel'} berhasil diunggah`);
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      // Tiap tab hanya kirim field miliknya agar tidak saling interferensi validasi
      const fieldsByTab: Record<string, (keyof Perusahaan)[]> = {
        profil:    ['nama','email','noTelp','alamat','kota','provinsi','kodePos','npwp','website'],
        dokumen:   ['kodeDokumen','prefixInvoice','prefixSph','prefixSuratHutang','prefixKasbon',
                    'counterInvoice','counterSph','counterSuratHutang','counterKasbon',
                    'pajakDefaultPersen'],
        bank:      ['namaBank','noRekening','atasNama','cabangBank'],
        tema:      ['temaInvoice','namaDirektur','jabatanDirektur'],
        identitas: [],
        pengguna:  [],
      };
      const tabFields = fieldsByTab[activeTab] ?? [];
      const body = Object.fromEntries(
        tabFields
          .filter((k) => form[k] !== null && form[k] !== undefined)
          .map((k) => [k, form[k]])
      );
      const res = await fetch(`${BASE}/perusahaan/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.message ?? 'Gagal menyimpan'); return; }
      setSuccess('Pengaturan berhasil disimpan');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setUserSaving(true);
    setUserError('');
    setUserSuccess('');
    try {
      if (editingUser) {
        const body: Record<string, unknown> = { nama: userForm.nama, role: userForm.role };
        if (userForm.password) body.password = userForm.password;
        const res = await fetch(`${BASE}/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) { setUserError(json.message ?? 'Gagal memperbarui'); return; }
        setUserSuccess('User berhasil diperbarui');
      } else {
        const res = await fetch(`${BASE}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(userForm),
        });
        const json = await res.json();
        if (!res.ok) { setUserError(json.message ?? 'Gagal membuat user'); return; }
        setUserSuccess('User berhasil dibuat');
      }
      setShowAddUser(false);
      setEditingUser(null);
      setUserForm({ email: '', nama: '', password: '', role: 'staff' });
      fetchUsers();
    } catch {
      setUserError('Terjadi kesalahan jaringan');
    } finally {
      setUserSaving(false);
    }
  };

  const handleToggleActive = async (user: UserItem) => {
    if (!token) return;
    setUserError('');
    try {
      const res = await fetch(`${BASE}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const json = await res.json();
      if (!res.ok) { setUserError(json.message ?? 'Gagal mengubah status'); return; }
      setUserSuccess(`User ${!user.isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchUsers();
    } catch {
      setUserError('Terjadi kesalahan jaringan');
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Tabs */}
      <div className="flex gap-1 bg-bgLight rounded-xl p-1 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-xl transition-colors ${
              activeTab === t.key
                ? 'bg-white text-primary shadow-sm'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Alert */}
      {success && (
        <div className="mb-4 bg-[#E1F5EE] text-[#085041] px-4 py-3 rounded-card text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 bg-[#FCEBEB] text-[#791F1F] px-4 py-3 rounded-card text-sm">{error}</div>
      )}

      <form onSubmit={handleSave}>
        {/* ── Profil Perusahaan ─────────────────────────────────────────────── */}
        {activeTab === 'profil' && (
          <div className="bg-white rounded-card border border-[#E8E8EE] p-6 space-y-4">
            <h2 className="font-semibold text-textPrimary">Profil Perusahaan</h2>
            <div>
              <label className={labelCls}>Nama Perusahaan *</label>
              <input type="text" value={form.nama ?? ''} onChange={(e) => set('nama', e.target.value)}
                required className={inputCls} placeholder="PT. Nama Perusahaan" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)}
                  className={inputCls} placeholder="info@perusahaan.com" />
              </div>
              <div>
                <label className={labelCls}>Telepon</label>
                <input type="text" value={form.noTelp ?? ''} onChange={(e) => set('noTelp', e.target.value)}
                  className={inputCls} placeholder="021-xxxx" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Alamat</label>
              <textarea value={form.alamat ?? ''} onChange={(e) => set('alamat', e.target.value)}
                rows={2} className={inputCls} placeholder="Jl. ..." />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Kota</label>
                <input type="text" value={form.kota ?? ''} onChange={(e) => set('kota', e.target.value)}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Provinsi</label>
                <input type="text" value={form.provinsi ?? ''} onChange={(e) => set('provinsi', e.target.value)}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Kode Pos</label>
                <input type="text" value={form.kodePos ?? ''} onChange={(e) => set('kodePos', e.target.value)}
                  className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>NPWP</label>
                <input type="text" value={form.npwp ?? ''} onChange={(e) => set('npwp', e.target.value)}
                  className={inputCls} placeholder="00.000.000.0-000.000" />
              </div>
              <div>
                <label className={labelCls}>Website</label>
                <input type="url" value={form.website ?? ''} onChange={(e) => set('website', e.target.value)}
                  className={inputCls} placeholder="https://..." />
              </div>
            </div>
          </div>
        )}

        {/* ── Pengaturan Dokumen ────────────────────────────────────────────── */}
        {activeTab === 'dokumen' && (
          <div className="bg-white rounded-card border border-[#E8E8EE] p-6 space-y-5">
            <h2 className="font-semibold text-textPrimary">Pengaturan Dokumen</h2>

            {/* Kode Perusahaan */}
            <div>
              <label className={labelCls}>Kode Perusahaan (Nomor Dokumen)</label>
              <input
                type="text"
                value={form.kodeDokumen ?? ''}
                onChange={(e) => set('kodeDokumen', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                className={inputCls}
                maxLength={15}
                placeholder="KODE (maks 15 karakter)"
              />
              <p className="text-xs text-textSecondary mt-1">
                Muncul di nomor dokumen: <strong>INV-0001/{form.kodeDokumen || 'KODE'}/IV/2026</strong>
                {!form.kodeDokumen && ' — kosong: otomatis dari nama perusahaan'}
              </p>
            </div>

            {/* Prefix & Counter */}
            <div className="bg-bgLight rounded-xl p-4 space-y-3">
              <p className="text-xs text-textSecondary font-semibold uppercase tracking-wide">Prefix &amp; Counter Nomor Dokumen</p>
              <div className="grid grid-cols-4 gap-3">
                {([
                  { label: 'Invoice',      prefixKey: 'prefixInvoice',      defaultPrefix: 'INV', counterKey: 'counterInvoice' },
                  { label: 'SPH',          prefixKey: 'prefixSph',          defaultPrefix: 'SPH', counterKey: 'counterSph' },
                  { label: 'Surat Hutang', prefixKey: 'prefixSuratHutang',  defaultPrefix: 'SH',  counterKey: 'counterSuratHutang' },
                  { label: 'Kasbon',       prefixKey: 'prefixKasbon',       defaultPrefix: 'SDP', counterKey: 'counterKasbon' },
                ] as const).map(({ label, prefixKey, defaultPrefix, counterKey }) => (
                  <div key={prefixKey}>
                    <label className={labelCls}>{label}</label>
                    <input
                      type="text"
                      value={(form[prefixKey as keyof Perusahaan] as string) ?? defaultPrefix}
                      onChange={(e) => set(prefixKey as keyof Perusahaan, e.target.value.toUpperCase())}
                      className={`${inputCls} mb-1`}
                      maxLength={10}
                      placeholder={defaultPrefix}
                    />
                    <input
                      type="number"
                      value={(form[counterKey as keyof Perusahaan] as number) ?? 1}
                      onChange={(e) => set(counterKey as keyof Perusahaan, parseInt(e.target.value) || 1)}
                      className={inputCls}
                      min={1}
                      placeholder="Counter"
                      title={`Counter ${label}`}
                    />
                    <p className="text-xs text-textSecondary mt-1">
                      Berikutnya: {(form[prefixKey as keyof Perusahaan] as string ?? defaultPrefix)}-{String((form[counterKey as keyof Perusahaan] as number ?? 1)).padStart(4, '0')}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-textSecondary">⚠️ Turunkan counter hanya jika yakin — nomor dokumen tidak boleh duplikat.</p>
            </div>

            {/* Penanda tangan */}
            <div>
              <p className="text-xs text-textSecondary font-semibold uppercase tracking-wide mb-3">Penanda Tangan Dokumen</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nama Direktur / Pimpinan</label>
                  <input
                    type="text"
                    value={form.namaDirektur ?? ''}
                    onChange={(e) => set('namaDirektur', e.target.value)}
                    className={inputCls}
                    placeholder="Nama lengkap"
                  />
                </div>
                <div>
                  <label className={labelCls}>Jabatan</label>
                  <input
                    type="text"
                    value={form.jabatanDirektur ?? ''}
                    onChange={(e) => set('jabatanDirektur', e.target.value)}
                    className={inputCls}
                    placeholder="Direktur / Manager / ..."
                  />
                </div>
              </div>
            </div>

            {/* PPN default */}
            <div>
              <label className={labelCls}>PPN Default (%)</label>
              <input
                type="number"
                value={form.pajakDefaultPersen ?? 11}
                onChange={(e) => set('pajakDefaultPersen', parseFloat(e.target.value) || 0)}
                className={inputCls}
                min={0} max={100} step={0.5}
              />
              <p className="text-xs text-textSecondary mt-1">Digunakan sebagai nilai default saat membuat dokumen baru</p>
            </div>
          </div>
        )}

        {/* ── Rekening Bank ─────────────────────────────────────────────────── */}
        {activeTab === 'bank' && (
          <div className="bg-white rounded-card border border-[#E8E8EE] p-6 space-y-4">
            <h2 className="font-semibold text-textPrimary">Rekening Bank</h2>
            <p className="text-sm text-textSecondary">
              Informasi rekening ini akan ditampilkan di bagian bawah setiap invoice.
            </p>
            <div>
              <label className={labelCls}>Nama Bank</label>
              <input type="text" value={form.namaBank ?? ''} onChange={(e) => set('namaBank', e.target.value)}
                className={inputCls} placeholder="BCA / BNI / Mandiri / ..." />
            </div>
            <div>
              <label className={labelCls}>Nomor Rekening</label>
              <input type="text" value={form.noRekening ?? ''} onChange={(e) => set('noRekening', e.target.value)}
                className={inputCls} placeholder="1234567890" />
            </div>
            <div>
              <label className={labelCls}>Atas Nama</label>
              <input type="text" value={form.atasNama ?? ''} onChange={(e) => set('atasNama', e.target.value)}
                className={inputCls} placeholder="Nama pemilik rekening" />
            </div>
            <div>
              <label className={labelCls}>Cabang Bank (Opsional)</label>
              <input type="text" value={form.cabangBank ?? ''} onChange={(e) => set('cabangBank', e.target.value)}
                className={inputCls} placeholder="Cabang Jakarta Pusat / ..." />
            </div>
            {form.namaBank && form.noRekening && (
              <div className="bg-[#EEF3FB] rounded-xl p-4">
                <p className="text-xs text-textSecondary font-semibold uppercase tracking-wide mb-2">Preview</p>
                <p className="text-sm font-semibold text-primary">{form.namaBank}</p>
                <p className="text-lg font-bold text-textPrimary">{form.noRekening}</p>
                <p className="text-sm text-textSecondary">{form.atasNama}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Identitas Visual ─────────────────────────────────────────────── */}
        {activeTab === 'identitas' && (
          <div className="bg-white rounded-card border border-[#E8E8EE] p-6 space-y-5">
            <h2 className="font-semibold text-textPrimary">Logo & Tanda Tangan</h2>
            <p className="text-sm text-textSecondary -mt-2">
              File gambar (JPG/PNG, maks. 5MB). Muncul otomatis di semua dokumen PDF.
            </p>

            {/* Hidden file inputs */}
            <input ref={logoRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload('logo', e.target.files[0])} />
            <input ref={ttdRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload('ttd', e.target.files[0])} />
            <input ref={stempelRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload('stempel', e.target.files[0])} />

            {[
              { key: 'logo' as const, label: 'Logo Perusahaan', desc: 'Muncul di header dokumen', urlKey: 'logoUrl', ref: logoRef },
              { key: 'ttd' as const, label: 'Tanda Tangan', desc: 'Muncul di bagian pengesahan', urlKey: 'ttdUrl', ref: ttdRef },
              { key: 'stempel' as const, label: 'Stempel / Cap', desc: 'Di samping tanda tangan', urlKey: 'stempelUrl', ref: stempelRef },
            ].map(({ key, label, desc, urlKey, ref }) => {
              const url = form[urlKey as keyof Perusahaan] as string | undefined;
              const isUploading = uploading === key;
              return (
                <div key={key} className="flex items-center gap-4 p-4 rounded-xl border border-[#E8E8EE] hover:border-primary/40 transition-colors">
                  {/* Preview */}
                  <div className="w-16 h-16 rounded-xl border border-[#E8E8EE] bg-bgLight flex items-center justify-center overflow-hidden flex-shrink-0">
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt={label} className="w-full h-full object-contain p-1" />
                    ) : (
                      <svg className="w-7 h-7 text-textSecondary opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-textPrimary">{label}</p>
                    <p className="text-xs text-textSecondary">{desc}</p>
                    <p className="text-xs mt-1 text-primary">
                      {url ? 'Sudah diunggah — klik untuk ganti' : 'Belum diunggah'}
                    </p>
                  </div>
                  {/* Button */}
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => ref.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-button border border-[#E8E8EE]
                      text-xs font-semibold text-textPrimary hover:bg-bgLight transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    )}
                    {isUploading ? 'Uploading...' : url ? 'Ganti' : 'Upload'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Tema Invoice ─────────────────────────────────────────────────── */}
        {activeTab === 'tema' && (
          <div className="bg-white rounded-card border border-[#E8E8EE] p-6 space-y-4">
            <h2 className="font-semibold text-textPrimary">Tema Invoice</h2>
            <p className="text-sm text-textSecondary mb-4">
              Pilih tampilan visual untuk semua dokumen yang digenerate.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {(['minimal', 'professional', 'modern'] as const).map((tema) => (
                <button
                  key={tema}
                  type="button"
                  onClick={() => set('temaInvoice', tema)}
                  className={`p-4 rounded-card border-2 text-left transition-colors ${
                    (form.temaInvoice ?? 'professional') === tema
                      ? 'border-primary bg-[#EEF3FB]'
                      : 'border-[#E8E8EE] hover:border-primary/40'
                  }`}
                >
                  <div className={`w-full h-20 rounded-lg mb-3 flex items-center justify-center ${
                    tema === 'minimal' ? 'bg-[#F4F4F8]' :
                    tema === 'professional' ? 'bg-[#1A3C6E]' : 'bg-gradient-to-br from-[#1A3C6E] to-[#378ADD]'
                  }`}>
                    <svg className={`w-8 h-8 ${tema === 'minimal' ? 'text-textSecondary' : 'text-white'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className={`font-semibold text-sm capitalize ${
                    (form.temaInvoice ?? 'professional') === tema ? 'text-primary' : 'text-textPrimary'
                  }`}>{tema}</p>
                  <p className="text-xs text-textSecondary mt-0.5">
                    {tema === 'minimal' ? 'Bersih & sederhana' :
                     tema === 'professional' ? 'Header navy, formal' : 'Gradien modern'}
                  </p>
                </button>
              ))}
            </div>
            <p className="text-xs text-textSecondary">
              * Template PDF saat ini menggunakan tema <strong>professional</strong>. Tema lain akan segera tersedia.
            </p>
          </div>
        )}

        {/* ── Pengguna ─────────────────────────────────────────────────────── */}
        {activeTab === 'pengguna' && (
          <div className="space-y-4">
            {/* Alert pengguna */}
            {userSuccess && (
              <div className="bg-[#E1F5EE] text-[#085041] px-4 py-3 rounded-card text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {userSuccess}
              </div>
            )}
            {userError && (
              <div className="bg-[#FCEBEB] text-[#791F1F] px-4 py-3 rounded-card text-sm">{userError}</div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-textPrimary">Manajemen Pengguna</h2>
                <p className="text-xs text-textSecondary mt-0.5">Kelola akun yang bisa login ke DokaGen</p>
              </div>
              {!showAddUser && !editingUser && (
                <button
                  type="button"
                  onClick={() => { setShowAddUser(true); setUserForm({ email: '', nama: '', password: '', role: 'staff' }); setUserError(''); setUserSuccess(''); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-button text-sm font-semibold hover:bg-[#163264] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Pengguna
                </button>
              )}
            </div>

            {/* Form tambah / edit */}
            {(showAddUser || editingUser) && (
              <div className="bg-white rounded-card border border-primary/30 p-5 space-y-4">
                <h3 className="font-semibold text-sm text-textPrimary">
                  {editingUser ? `Edit: ${editingUser.email}` : 'Tambah Pengguna Baru'}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Nama</label>
                    <input type="text" value={userForm.nama}
                      onChange={(e) => setUserForm((p) => ({ ...p, nama: e.target.value }))}
                      className={inputCls} placeholder="Nama lengkap" required />
                  </div>
                  <div>
                    <label className={labelCls}>Role</label>
                    <select value={userForm.role}
                      onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))}
                      className={inputCls}>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                {!editingUser && (
                  <div>
                    <label className={labelCls}>Email</label>
                    <input type="email" value={userForm.email}
                      onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))}
                      className={inputCls} placeholder="email@domain.com" required />
                  </div>
                )}
                <div>
                  <label className={labelCls}>{editingUser ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}</label>
                  <input type="password" value={userForm.password}
                    onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))}
                    className={inputCls} placeholder="Min. 8 karakter"
                    {...(!editingUser ? { required: true, minLength: 8 } : {})} />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={handleSaveUser} disabled={userSaving}
                    className="px-4 py-2 bg-primary text-white rounded-button text-sm font-semibold hover:bg-[#163264] transition-colors disabled:opacity-60">
                    {userSaving ? 'Menyimpan...' : editingUser ? 'Simpan Perubahan' : 'Buat Pengguna'}
                  </button>
                  <button type="button"
                    onClick={() => { setShowAddUser(false); setEditingUser(null); setUserError(''); }}
                    className="px-4 py-2 border border-[#E8E8EE] text-textSecondary rounded-button text-sm hover:bg-bgLight transition-colors">
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Daftar user */}
            <div className="bg-white rounded-card border border-[#E8E8EE] overflow-hidden">
              {usersLoading ? (
                <div className="p-8 text-center text-textSecondary text-sm">Memuat...</div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center text-textSecondary text-sm">Belum ada pengguna</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-bgLight border-b border-[#E8E8EE]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Pengguna</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wide">Login Terakhir</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E8EE]">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-bgLight/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-textPrimary">{u.nama || '—'}</p>
                          <p className="text-xs text-textSecondary">{u.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            u.role === 'owner' ? 'bg-[#EEF3FB] text-primary' :
                            u.role === 'admin' ? 'bg-[#FFF7E6] text-[#B45309]' :
                            'bg-[#F4F4F8] text-textSecondary'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            u.isActive ? 'bg-[#E1F5EE] text-[#085041]' : 'bg-[#FCEBEB] text-[#791F1F]'
                          }`}>
                            {u.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-textSecondary">
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Belum pernah'}
                        </td>
                        <td className="px-4 py-3">
                          {u.role !== 'owner' && (
                            <div className="flex items-center gap-2 justify-end">
                              <button type="button"
                                onClick={() => {
                                  setEditingUser(u);
                                  setShowAddUser(false);
                                  setUserForm({ email: u.email, nama: u.nama ?? '', password: '', role: u.role });
                                  setUserError('');
                                  setUserSuccess('');
                                }}
                                className="p-1.5 rounded-lg text-textSecondary hover:bg-[#EEF3FB] hover:text-primary transition-colors"
                                title="Edit">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button type="button"
                                onClick={() => handleToggleActive(u)}
                                className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'text-textSecondary hover:bg-[#FCEBEB] hover:text-[#E24B4A]' : 'text-textSecondary hover:bg-[#E1F5EE] hover:text-[#1D9E75]'}`}
                                title={u.isActive ? 'Nonaktifkan' : 'Aktifkan'}>
                                {u.isActive ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Save button — disembunyikan di tab Pengguna */}
        {activeTab !== 'pengguna' && (
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-white rounded-button text-sm font-semibold
                hover:bg-[#163264] transition-colors disabled:opacity-60"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

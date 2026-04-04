'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

const inputCls = `w-full px-4 py-3 rounded-input border border-[#E8E8EE] text-sm
  focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20
  bg-white text-textPrimary`;
const labelCls = 'block text-sm font-medium text-textSecondary mb-1.5';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    namaPerusahaan: '',
    email: '',
    password: '',
    konfirmasi: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.konfirmasi) {
      setError('Password dan konfirmasi tidak sama');
      return;
    }
    if (form.password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          namaPerusahaan: form.namaPerusahaan,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? 'Gagal mendaftar');
        return;
      }

      // Auto-login setelah register
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) {
        router.push('/login');
      } else {
        router.push('/pengaturan');
      }
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bgLight flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-textPrimary">Buat Akun DokaGen</h1>
          <p className="text-sm text-textSecondary mt-1">Gratis selamanya untuk fitur dasar</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-card border border-[#E8E8EE] p-8">
          {error && (
            <div className="mb-4 p-3 bg-[#FCEBEB] rounded-input flex items-start gap-2">
              <svg className="w-4 h-4 text-[#E24B4A] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-[#791F1F]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Nama Perusahaan / Usaha *</label>
              <input
                type="text"
                value={form.namaPerusahaan}
                onChange={set('namaPerusahaan')}
                placeholder="contoh: CV Berkah Makmur"
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="contoh@email.com"
                required
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Password *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 8 karakter"
                  required
                  minLength={8}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Konfirmasi *</label>
                <input
                  type="password"
                  value={form.konfirmasi}
                  onChange={set('konfirmasi')}
                  placeholder="Ulangi password"
                  required
                  className={inputCls}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-3 rounded-button font-semibold text-sm
                hover:bg-[#163264] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Membuat akun...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-sm text-textSecondary mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Masuk
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-textSecondary mt-6">
          DokaGen &copy; {new Date().getFullYear()} — Document Generator untuk UMKM
        </p>
      </div>
    </div>
  );
}

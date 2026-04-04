'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError('Email atau password salah');
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-bgLight flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-textPrimary">DokaGen</h1>
          <p className="text-sm text-textSecondary mt-1">Masuk ke akun Anda</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-card border border-[#E8E8EE] p-8">
          {error && (
            <div className="mb-4 p-3 bg-[#FCEBEB] rounded-input">
              <p className="text-sm text-[#791F1F]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contoh@email.com"
                required
                className="w-full px-4 py-3 rounded-input border border-[#E8E8EE] text-sm
                  focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                  bg-white text-textPrimary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textSecondary mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-input border border-[#E8E8EE] text-sm
                  focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                  bg-white text-textPrimary"
              />
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-sm text-primary hover:underline">
                Lupa password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-3 rounded-button font-semibold text-sm
                hover:bg-[#163264] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-textSecondary mt-6">
          Belum punya akun?{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Daftar gratis
          </Link>
        </p>
        <p className="text-center text-xs text-textSecondary mt-3">
          DokaGen &copy; {new Date().getFullYear()} — Document Generator untuk UMKM
        </p>
      </div>
    </div>
  );
}

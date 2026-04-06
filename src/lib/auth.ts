import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import api from './api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

async function refreshAccessToken(refreshToken: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error('Refresh gagal');
    return {
      accessToken: data.data.accessToken as string,
      refreshToken: (data.data.refreshToken ?? refreshToken) as string,
      accessTokenExpiry: Date.now() + 110 * 60 * 1000, // 110 menit (buffer 10 menit sebelum 120m)
      error: undefined,
    };
  } catch {
    return { error: 'RefreshAccessTokenError' as const };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'DokaGen',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await api.post('/auth/login', {
            email: credentials.email,
            password: credentials.password,
          });
          const { user, accessToken, refreshToken, perusahaanId } = res.data.data;
          return { ...user, accessToken, refreshToken, perusahaanId };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Login pertama kali
      if (user) {
        return {
          ...token,
          accessToken: (user as any).accessToken,
          refreshToken: (user as any).refreshToken,
          perusahaanId: (user as any).perusahaanId,
          role: (user as any).role,
          accessTokenExpiry: Date.now() + 110 * 60 * 1000,
        };
      }

      // Token masih valid
      if (Date.now() < (token.accessTokenExpiry as number ?? 0)) {
        return token;
      }

      // Token expired — coba refresh
      const refreshed = await refreshAccessToken(token.refreshToken as string);
      if (refreshed.error) {
        return { ...token, error: 'RefreshAccessTokenError' };
      }
      return { ...token, ...refreshed };
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.perusahaanId = token.perusahaanId as string;
      session.error = token.error as string | undefined;
      (session.user as any).role = token.role;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // session 30 hari
  secret: process.env.NEXTAUTH_SECRET,
};

// Extend next-auth types
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    perusahaanId?: string;
    error?: string;
  }
}

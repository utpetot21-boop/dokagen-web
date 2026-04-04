/**
 * Server-side API helper — gunakan di Server Components dengan session token
 */
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

async function serverFetch<T>(path: string): Promise<T> {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`API ${path} returned ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

export interface LaporanRingkasan {
  pendapatan: {
    total: number;
    bulanIni: number;
    bulanLalu: number;
    growthPersen: number;
  };
  dokumen: {
    total: number;
    bulanIni: number;
    menungguPembayaran: number;
    jatuhTempo: number;
  };
  klien: { total: number };
}

export interface DokumenRow {
  id: string;
  nomor: string;
  tipe: string;
  status: string;
  klienNama?: string;
  tanggalDokumen: string;
  tanggalJatuhTempo?: string;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export async function fetchRingkasan(): Promise<LaporanRingkasan> {
  return serverFetch<LaporanRingkasan>('/laporan/ringkasan');
}

export async function fetchRecentDokumen(): Promise<PaginatedResponse<DokumenRow>> {
  return serverFetch<PaginatedResponse<DokumenRow>>('/dokumen?limit=8&page=1');
}

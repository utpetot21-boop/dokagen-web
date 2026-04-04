export type TipeKlien = 'perusahaan' | 'personal';

export interface Klien {
  id: string;
  perusahaanId: string;
  tipe: TipeKlien;
  nama: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
  kodePos?: string;
  npwp?: string;
  noTelp?: string;
  email?: string;
  contactPerson?: string;
  catatan?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KlienFormInput {
  tipe: TipeKlien;
  nama: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
  kodePos?: string;
  npwp?: string;
  noTelp?: string;
  email?: string;
  contactPerson?: string;
  catatan?: string;
}

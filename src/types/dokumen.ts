export type TipeDokumen = 'invoice' | 'sph' | 'surat_hutang' | 'kasbon';

export type StatusDokumen =
  | 'draft'
  | 'terkirim'
  | 'lunas'
  | 'dibatalkan'
  | 'diterima'
  | 'ditolak'
  | 'kadaluarsa'
  | 'aktif'
  | 'jatuh_tempo';

export type MetodePembayaran = 'transfer' | 'tunai' | 'cek' | 'giro' | 'qris';

export interface DokumenItem {
  id?: string;
  urutan: number;
  nama: string;
  deskripsi?: string;
  satuan: string;
  qty: number;
  hargaSatuan: number;
  diskonPersen: number;
  subtotal: number;
}

export interface Dokumen {
  id: string;
  perusahaanId: string;
  klienId?: string;
  tipe: TipeDokumen;
  nomor: string;
  status: StatusDokumen;
  judul?: string;
  klienNama?: string;
  klienAlamat?: string;
  klienNpwp?: string;
  klienEmail?: string;
  klienNoTelp?: string;
  tanggalDokumen: string;
  tanggalJatuhTempo?: string;
  tanggalTerkirim?: string;
  tanggalLunas?: string;
  subtotal: number;
  diskonPersen: number;
  diskonNominal: number;
  pajakPersen: number;
  pajakNominal: number;
  total: number;
  nominalHutang?: number;
  cicilanPerBulan?: number;
  pdfUrl?: string;
  catatan?: string;
  syaratKetentuan?: string;
  tema: 'minimal' | 'professional' | 'modern';
  items: DokumenItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Pembayaran {
  id: string;
  dokumenId: string;
  tanggal: string;
  jumlah: number;
  metode?: MetodePembayaran;
  noReferensi?: string;
  buktiUrl?: string;
  catatan?: string;
  createdAt: string;
}

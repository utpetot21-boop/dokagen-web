/**
 * Format angka ke format Rupiah Indonesia
 * Contoh: 1500000 → "Rp 1.500.000"
 */
export function formatRupiah(amount: number, withPrefix = true): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return withPrefix ? `Rp ${formatted}` : formatted;
}

/**
 * Format tanggal ke format Indonesia
 * Contoh: "2026-04-02" → "02 April 2026"
 */
export function formatTanggal(
  date: string | Date,
  format: 'panjang' | 'pendek' = 'panjang',
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (format === 'pendek') {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/**
 * Format tanggal ke DD/MM/YYYY
 */
export function formatTanggalPendek(date: string | Date): string {
  return formatTanggal(date, 'pendek');
}

/**
 * Hitung sisa hari dari sekarang ke tanggal jatuh tempo
 * Negatif = sudah lewat
 */
export function sisaHari(tanggalJatuhTempo: string | Date): number {
  const sekarang = new Date();
  const jatuhTempo = typeof tanggalJatuhTempo === 'string'
    ? new Date(tanggalJatuhTempo)
    : tanggalJatuhTempo;
  sekarang.setHours(0, 0, 0, 0);
  jatuhTempo.setHours(0, 0, 0, 0);
  return Math.round((jatuhTempo.getTime() - sekarang.getTime()) / (1000 * 60 * 60 * 24));
}

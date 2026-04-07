'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatRupiah } from '@/lib/formatters';

type TipeDokumen = 'invoice' | 'sph' | 'surat_hutang';

interface KlienOption {
  id: string;
  nama: string;
  alamat?: string;
  email?: string;
  noTelp?: string;
}

interface ItemForm {
  nama: string;
  deskripsi: string;
  satuan: string;
  qty: string;
  hargaSatuan: string;
  diskonPersen: string;
}

const emptyItem = (): ItemForm => ({
  nama: '',
  deskripsi: '',
  satuan: 'pcs',
  qty: '1',
  hargaSatuan: '',
  diskonPersen: '0',
});

function calcSubtotal(item: ItemForm): number {
  const qty = parseFloat(item.qty) || 0;
  const harga = parseFloat(item.hargaSatuan) || 0;
  const diskon = parseFloat(item.diskonPersen) || 0;
  return qty * harga * (1 - diskon / 100);
}

interface InitialData {
  id: string;
  tipe: TipeDokumen;
  klienId?: string;
  judul?: string;
  tanggalDokumen: string;
  tanggalJatuhTempo?: string;
  diskonPersen: number;
  pajakPersen: number;
  catatan?: string;
  syaratKetentuan?: string;
  nominalHutang?: number;
  cicilanPerBulan?: number;
  items: Array<{
    nama: string; deskripsi?: string; satuan: string;
    qty: number; hargaSatuan: number; diskonPersen: number;
  }>;
}

export default function FormDokumenClient({ initialData }: { initialData?: InitialData }) {
  const { data: session } = useSession();
  const router = useRouter();
  const isEdit = !!initialData;

  const [tipe, setTipe] = useState<TipeDokumen>(initialData?.tipe ?? 'invoice');
  const [klienId, setKlienId] = useState(initialData?.klienId ?? '');
  const [klienList, setKlienList] = useState<KlienOption[]>([]);
  const [tanggal, setTanggal] = useState(
    initialData?.tanggalDokumen?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
  );
  const [jatuhTempo, setJatuhTempo] = useState(() => {
    if (initialData?.tanggalJatuhTempo) return initialData.tanggalJatuhTempo.slice(0, 10);
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [judul, setJudul] = useState(initialData?.judul ?? '');
  const [items, setItems] = useState<ItemForm[]>(
    initialData?.items?.length
      ? initialData.items.map((i) => ({
          nama: i.nama,
          deskripsi: i.deskripsi ?? '',
          satuan: i.satuan,
          qty: String(i.qty),
          hargaSatuan: String(i.hargaSatuan),
          diskonPersen: String(i.diskonPersen),
        }))
      : [emptyItem()],
  );
  const [diskonPersen, setDiskonPersen] = useState(String(initialData?.diskonPersen ?? 0));
  const [pajakPersen, setPajakPersen] = useState(String(initialData?.pajakPersen ?? 11));
  const [catatan, setCatatan] = useState(initialData?.catatan ?? '');
  const [syarat, setSyarat] = useState(initialData?.syaratKetentuan ?? '');
  const [nominalHutang, setNominalHutang] = useState(String(initialData?.nominalHutang ?? ''));
  const [cicilanPerBulan, setCicilanPerBulan] = useState(String(initialData?.cicilanPerBulan ?? ''));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.accessToken) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/klien?limit=100`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((r) => r.json())
      .then((j) => setKlienList(j.data?.data ?? []))
      .catch(() => {});
  }, [session?.accessToken]);

  const subtotal = items.reduce((s, i) => s + calcSubtotal(i), 0);
  const diskonNominal = subtotal * (parseFloat(diskonPersen) || 0) / 100;
  const pajakNominal = (subtotal - diskonNominal) * (parseFloat(pajakPersen) || 0) / 100;
  const total = subtotal - diskonNominal + pajakNominal;

  const addItem = () => setItems([...items, emptyItem()]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof ItemForm, value: string) =>
    setItems(items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;
    if (!klienId) { setError('Pilih klien terlebih dahulu'); return; }

    setSubmitting(true);
    setError('');

    try {
      const body: Record<string, unknown> = {
        tipe,
        klienId,
        tanggalDokumen: tanggal,
        tanggalJatuhTempo: jatuhTempo || undefined,
        judul: judul || undefined,
        diskonPersen: parseFloat(diskonPersen) || 0,
        pajakPersen: parseFloat(pajakPersen) || 11,
        catatan: catatan || undefined,
        syaratKetentuan: syarat || undefined,
        items: tipe === 'surat_hutang' ? [] : items.map((item, idx) => ({
          urutan: idx + 1,
          nama: item.nama,
          deskripsi: item.deskripsi || undefined,
          satuan: item.satuan || 'pcs',
          qty: parseFloat(item.qty) || 1,
          hargaSatuan: parseFloat(item.hargaSatuan) || 0,
          diskonPersen: parseFloat(item.diskonPersen) || 0,
        })),
      };

      if (tipe === 'surat_hutang') {
        body.nominalHutang = parseFloat(nominalHutang) || 0;
        body.cicilanPerBulan = parseFloat(cicilanPerBulan) || 0;
      }

      const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
      const url = isEdit ? `${BASE}/dokumen/${initialData!.id}` : `${BASE}/dokumen`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? (isEdit ? 'Gagal memperbarui dokumen' : 'Gagal membuat dokumen'));
        return;
      }

      router.push(`/dokumen/${isEdit ? initialData!.id : json.data.id}`);
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full border border-[#E8E8EE] rounded-input px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20';
  const labelCls = 'block text-xs font-semibold text-textSecondary uppercase tracking-wide mb-1';

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {error && (
        <div className="bg-[#FCEBEB] text-[#791F1F] px-4 py-3 rounded-card text-sm mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-6 items-start">
        {/* ── Kolom Kiri (form utama) ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Tipe */}
          <div className="bg-white rounded-card border border-[#E8E8EE] p-5">
            <h2 className="font-semibold text-textPrimary mb-3">Tipe Dokumen</h2>
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: 'invoice', label: 'Invoice', desc: 'Tagihan pembayaran' },
                { value: 'sph', label: 'SPH', desc: 'Surat Penawaran Harga' },
                { value: 'surat_hutang', label: 'Surat Hutang', desc: 'Pengakuan hutang' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => !isEdit && setTipe(opt.value)}
                  disabled={isEdit}
                  className={`p-4 rounded-card border-2 text-left transition-colors ${
                    tipe === opt.value
                      ? 'border-primary bg-[#EEF3FB]'
                      : 'border-[#E8E8EE] hover:border-primary/40'
                  } ${isEdit ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  <p className={`font-semibold text-sm ${tipe === opt.value ? 'text-primary' : 'text-textPrimary'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-textSecondary mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Info Dokumen */}
          <div className="bg-white rounded-card border border-[#E8E8EE] p-5">
            <h2 className="font-semibold text-textPrimary mb-3">Info Dokumen</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className={tipe === 'sph' ? '' : 'col-span-2 md:col-span-1'}>
                <label className={labelCls}>Klien *</label>
                <select value={klienId} onChange={(e) => setKlienId(e.target.value)} required className={inputCls}>
                  <option value="">-- Pilih Klien --</option>
                  {klienList.map((k) => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>
              {tipe === 'sph' && (
                <div>
                  <label className={labelCls}>Judul Penawaran *</label>
                  <input type="text" value={judul} onChange={(e) => setJudul(e.target.value)}
                    placeholder="Penawaran Jasa..." className={inputCls} required={tipe === 'sph'} />
                </div>
              )}
              <div>
                <label className={labelCls}>Tanggal</label>
                <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Jatuh Tempo</label>
                <input type="date" value={jatuhTempo} onChange={(e) => setJatuhTempo(e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Surat Hutang fields */}
          {tipe === 'surat_hutang' && (
            <div className="bg-white rounded-card border border-[#E8E8EE] p-5">
              <h2 className="font-semibold text-textPrimary mb-3">Nominal Hutang</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Total Hutang (Rp) *</label>
                  <input type="number" value={nominalHutang} onChange={(e) => setNominalHutang(e.target.value)}
                    placeholder="5000000" className={inputCls} required={tipe === 'surat_hutang'} min="0" />
                </div>
                <div>
                  <label className={labelCls}>Cicilan per Bulan (Rp)</label>
                  <input type="number" value={cicilanPerBulan} onChange={(e) => setCicilanPerBulan(e.target.value)}
                    placeholder="500000" className={inputCls} min="0" />
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          {tipe !== 'surat_hutang' && (
            <div className="bg-white rounded-card border border-[#E8E8EE] p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-textPrimary">Item</h2>
                <button type="button" onClick={addItem}
                  className="text-sm text-primary font-semibold hover:underline">
                  + Tambah Item
                </button>
              </div>
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="border border-[#E8E8EE] rounded-card p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-semibold text-textSecondary uppercase">Item {idx + 1}</span>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)}
                          className="text-xs text-danger hover:underline">Hapus</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className={labelCls}>Nama Item *</label>
                        <input type="text" value={item.nama} onChange={(e) => updateItem(idx, 'nama', e.target.value)}
                          required className={inputCls} placeholder="Nama produk/jasa" />
                      </div>
                      <div className="col-span-2">
                        <label className={labelCls}>Deskripsi</label>
                        <input type="text" value={item.deskripsi} onChange={(e) => updateItem(idx, 'deskripsi', e.target.value)}
                          className={inputCls} placeholder="Opsional" />
                      </div>
                      <div>
                        <label className={labelCls}>Qty *</label>
                        <input type="number" value={item.qty} onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                          required className={inputCls} min="0" step="0.01" />
                      </div>
                      <div>
                        <label className={labelCls}>Satuan</label>
                        <input type="text" value={item.satuan} onChange={(e) => updateItem(idx, 'satuan', e.target.value)}
                          className={inputCls} placeholder="pcs" />
                      </div>
                      <div>
                        <label className={labelCls}>Harga Satuan (Rp) *</label>
                        <input type="number" value={item.hargaSatuan} onChange={(e) => updateItem(idx, 'hargaSatuan', e.target.value)}
                          required className={inputCls} min="0" placeholder="0" />
                      </div>
                      <div>
                        <label className={labelCls}>Diskon (%)</label>
                        <input type="number" value={item.diskonPersen} onChange={(e) => updateItem(idx, 'diskonPersen', e.target.value)}
                          className={inputCls} min="0" max="100" />
                      </div>
                    </div>
                    {calcSubtotal(item) > 0 && (
                      <div className="mt-3 text-right text-sm font-semibold text-primary">
                        Subtotal: {formatRupiah(calcSubtotal(item))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Catatan & Syarat */}
          <div className="bg-white rounded-card border border-[#E8E8EE] p-5">
            <h2 className="font-semibold text-textPrimary mb-3">Catatan & Syarat</h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Catatan</label>
                <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)}
                  rows={3} className={inputCls} placeholder="Catatan tambahan (opsional)" />
              </div>
              <div>
                <label className={labelCls}>Syarat & Ketentuan</label>
                <textarea value={syarat} onChange={(e) => setSyarat(e.target.value)}
                  rows={4} className={inputCls} placeholder="Pembayaran dilakukan dalam 30 hari..." />
              </div>
            </div>
          </div>

        </div>

        {/* ── Kolom Kanan (sticky summary) ── */}
        <div className="w-72 shrink-0 sticky top-6 space-y-4">

          {/* Ringkasan Total */}
          {tipe !== 'surat_hutang' && (
            <div className="bg-white rounded-card border border-[#E8E8EE] p-5">
              <h2 className="font-semibold text-textPrimary mb-4">Ringkasan</h2>
              <div className="space-y-3 mb-4">
                <div>
                  <label className={labelCls}>Diskon (%)</label>
                  <input type="number" value={diskonPersen} onChange={(e) => setDiskonPersen(e.target.value)}
                    className={inputCls} min="0" max="100" />
                </div>
                <div>
                  <label className={labelCls}>PPN (%)</label>
                  <input type="number" value={pajakPersen} onChange={(e) => setPajakPersen(e.target.value)}
                    className={inputCls} min="0" />
                </div>
              </div>
              <div className="border-t border-[#E8E8EE] pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-textSecondary">Subtotal</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textSecondary">Diskon ({diskonPersen}%)</span>
                  <span className="text-danger">- {formatRupiah(diskonNominal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textSecondary">PPN ({pajakPersen}%)</span>
                  <span>{formatRupiah(pajakNominal)}</span>
                </div>
                <div className="border-t-2 border-primary pt-2 flex justify-between font-bold text-primary text-base">
                  <span>TOTAL</span>
                  <span>{formatRupiah(total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Surat hutang summary */}
          {tipe === 'surat_hutang' && nominalHutang && (
            <div className="bg-white rounded-card border border-[#E8E8EE] p-5">
              <h2 className="font-semibold text-textPrimary mb-3">Ringkasan</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-textSecondary">Total Hutang</span>
                  <span className="font-bold text-primary">{formatRupiah(parseFloat(nominalHutang) || 0)}</span>
                </div>
                {cicilanPerBulan && (
                  <div className="flex justify-between">
                    <span className="text-textSecondary">Cicilan/Bulan</span>
                    <span className="font-semibold">{formatRupiah(parseFloat(cicilanPerBulan) || 0)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col gap-2">
            <button type="submit" disabled={submitting}
              className="w-full px-6 py-2.5 bg-primary text-white rounded-button text-sm font-semibold
                hover:bg-[#163264] transition-colors disabled:opacity-60">
              {submitting ? 'Menyimpan...' : isEdit ? 'Perbarui Dokumen' : 'Simpan Dokumen'}
            </button>
            <button type="button" onClick={() => router.back()}
              className="w-full px-5 py-2.5 border border-[#E8E8EE] rounded-button text-sm font-semibold
                text-textPrimary hover:bg-bgLight transition-colors">
              Batal
            </button>
          </div>

        </div>
      </div>
    </form>
  );
}

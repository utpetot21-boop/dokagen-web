type StatusKey =
  | 'lunas' | 'draft' | 'jatuh_tempo' | 'terkirim'
  | 'aktif' | 'diterima' | 'ditolak' | 'dibatalkan' | 'kadaluarsa';

const statusConfig: Record<StatusKey, { bg: string; text: string; dot: string; label: string }> = {
  lunas:      { bg: 'bg-[#E1F5EE]', text: 'text-[#085041]', dot: 'bg-[#1D9E75]', label: 'Lunas' },
  draft:      { bg: 'bg-[#FAEEDA]', text: 'text-[#633806]', dot: 'bg-[#F5A623]', label: 'Draft' },
  jatuh_tempo:{ bg: 'bg-[#FCEBEB]', text: 'text-[#791F1F]', dot: 'bg-[#E24B4A]', label: 'Jatuh Tempo' },
  terkirim:   { bg: 'bg-[#E6F1FB]', text: 'text-[#0C447C]', dot: 'bg-[#378ADD]', label: 'Terkirim' },
  aktif:      { bg: 'bg-[#E6F1FB]', text: 'text-[#0C447C]', dot: 'bg-[#378ADD]', label: 'Aktif' },
  diterima:   { bg: 'bg-[#E1F5EE]', text: 'text-[#085041]', dot: 'bg-[#1D9E75]', label: 'Diterima' },
  ditolak:    { bg: 'bg-[#FCEBEB]', text: 'text-[#791F1F]', dot: 'bg-[#E24B4A]', label: 'Ditolak' },
  dibatalkan: { bg: 'bg-[#FCEBEB]', text: 'text-[#791F1F]', dot: 'bg-[#E24B4A]', label: 'Dibatalkan' },
  kadaluarsa: { bg: 'bg-[#FAEEDA]', text: 'text-[#633806]', dot: 'bg-[#F5A623]', label: 'Kadaluarsa' },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as StatusKey] ?? statusConfig.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-badge text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

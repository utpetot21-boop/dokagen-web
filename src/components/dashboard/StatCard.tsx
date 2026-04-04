import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  icon: ReactNode;
}

const colorMap = {
  primary: { bg: 'bg-[#EEF3FB]', text: 'text-primary', dot: 'bg-primary' },
  success: { bg: 'bg-[#E1F5EE]', text: 'text-[#085041]', dot: 'bg-success' },
  warning: { bg: 'bg-[#FAEEDA]', text: 'text-[#633806]', dot: 'bg-warning' },
  danger:  { bg: 'bg-[#FCEBEB]', text: 'text-[#791F1F]', dot: 'bg-danger' },
  info:    { bg: 'bg-[#E6F1FB]', text: 'text-[#0C447C]', dot: 'bg-info' },
};

export default function StatCard({ title, value, subtitle, color = 'primary', icon }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-card border border-[#E8E8EE] p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-textSecondary font-medium">{title}</p>
          <p className="text-2xl font-bold text-textPrimary mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-textSecondary mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
          <span className={c.text}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

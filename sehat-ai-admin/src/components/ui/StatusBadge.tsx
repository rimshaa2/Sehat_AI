import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: 'pending' | 'verified' | 'rejected';
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    verified: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span className={clsx(
      'px-3 py-1 rounded-full text-xs font-medium border uppercase tracking-wider',
      styles[status]
    )}>
      {status}
    </span>
  );
};
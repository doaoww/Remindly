import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  children, variant = 'primary', size = 'md',
  loading, icon, className, disabled, ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 select-none disabled:opacity-40 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-lg hover:shadow-[0_0_20px_var(--accent-glow)] active:scale-[0.98]',
    secondary: 'bg-[var(--bg-elevated)] hover:bg-[var(--border-hover)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-hover)]',
    ghost:     'hover:bg-[var(--accent-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    danger:    'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
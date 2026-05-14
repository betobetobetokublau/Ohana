import { cn } from '@/lib/utils/cn';

interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error';
}

const variantClasses = {
  default: 'bg-surface-2 text-muted',
  accent: 'bg-accent-soft text-accent-deep',
  success: 'bg-[#D8E5CD] text-[#3D5C30]',
  warning: 'bg-[#F0D9A6] text-[#806020]',
  error: 'bg-[#EBC5BF] text-[#7A2820]',
};

export function Pill({ variant = 'default', className, children, ...props }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-mono text-[10px] font-medium tracking-[0.04em] uppercase px-2 py-0.5 rounded-sm',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function Dot({ color, className }: { color: string; className?: string }) {
  return (
    <span
      style={{ backgroundColor: color }}
      className={cn('inline-block w-2 h-2 rounded-full', className)}
    />
  );
}

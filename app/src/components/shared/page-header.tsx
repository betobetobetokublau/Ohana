import { cn } from '@/lib/utils/cn';

interface PageHeaderProps {
  eyebrow?: string;
  eyebrowAccent?: boolean;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  eyebrowAccent = true,
  title,
  titleAccent,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          {eyebrow && (
            <div className={cn('eyebrow mb-2', eyebrowAccent && 'text-accent')}>
              {eyebrow}
            </div>
          )}
          <h1 className="display text-3xl md:text-4xl">
            {title}
            {titleAccent && (
              <>
                {' '}
                <em>{titleAccent}</em>
              </>
            )}
          </h1>
          {subtitle && (
            <p className="italic-serif text-[15px] mt-2 max-w-2xl">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}

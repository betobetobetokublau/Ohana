import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-md border border-line bg-surface p-4', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardIconRow = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-start gap-3.5', className)}
      {...props}
    />
  )
);
CardIconRow.displayName = 'CardIconRow';

interface CardIconProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: string; // CSS color or tailwind utility
  bgColor?: string;
}

const CardIcon = forwardRef<HTMLDivElement, CardIconProps>(
  ({ className, color, bgColor, children, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{ backgroundColor: bgColor, color, ...style }}
      className={cn(
        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl font-serif text-white leading-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
CardIcon.displayName = 'CardIcon';

export { Card, CardIconRow, CardIcon };

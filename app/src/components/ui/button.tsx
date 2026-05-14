'use client';

import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-sans font-semibold whitespace-nowrap rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-ink text-bg border border-ink hover:bg-ink/90',
        accent: 'bg-accent text-white border border-accent hover:bg-accent-deep hover:border-accent-deep',
        ghost: 'bg-transparent text-ink border border-line-2 hover:bg-surface',
        link: 'bg-transparent text-accent underline underline-offset-4 hover:text-accent-deep px-0 py-0',
      },
      size: {
        sm: 'text-[11px] px-2.5 py-1.5',
        md: 'text-[13px] px-4 py-2.5',
        lg: 'text-[14px] px-5 py-3.5',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { buttonVariants };

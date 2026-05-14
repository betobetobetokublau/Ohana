'use client';

import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export const Checkbox = forwardRef<
  React.ElementRef<typeof RadixCheckbox.Root>,
  React.ComponentPropsWithoutRef<typeof RadixCheckbox.Root>
>(({ className, ...props }, ref) => (
  <RadixCheckbox.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-line-2 bg-bg cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 disabled:opacity-50 data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=checked]:text-white',
      className
    )}
    {...props}
  >
    <RadixCheckbox.Indicator className="flex items-center justify-center text-current">
      <Check className="h-3 w-3" strokeWidth={3} />
    </RadixCheckbox.Indicator>
  </RadixCheckbox.Root>
));
Checkbox.displayName = 'Checkbox';

export function CheckboxRow({
  label,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixCheckbox.Root> & { label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-muted hover:text-ink select-none py-1.5">
      <Checkbox {...props} />
      <span>{label}</span>
    </label>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { bottomNav } from '@/lib/utils/nav';
import { cn } from '@/lib/utils/cn';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-line">
      <div className="flex justify-around pt-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] px-2">
        {bottomNav.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-0.5 min-w-[56px]',
                isActive ? 'text-accent' : 'text-muted'
              )}
            >
              <span className="text-[18px] leading-none">{item.glyph}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

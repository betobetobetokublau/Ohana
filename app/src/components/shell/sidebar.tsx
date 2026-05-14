'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { sidebarNav } from '@/lib/utils/nav';
import { cn } from '@/lib/utils/cn';

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'bg-surface border-r border-line transition-[width] duration-[220ms] ease-out overflow-hidden',
        collapsed ? 'w-0' : 'w-[200px]'
      )}
    >
      <div className="w-[200px] p-4 flex flex-col gap-6 h-full overflow-y-auto scrollbar-thin">
        {sidebarNav.map(group => (
          <div key={group.label}>
            <div className="font-mono text-[9px] font-semibold text-muted uppercase tracking-[0.12em] px-2 mb-1.5">
              {group.label}
            </div>
            <div className="flex flex-col gap-px">
              {group.items.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-2 py-2 rounded-sm text-[13px] font-medium transition-colors',
                      isActive ? 'bg-ink text-bg' : 'text-ink hover:bg-surface-2'
                    )}
                  >
                    <span className="w-3.5 text-center text-[13px] opacity-70">{item.glyph}</span>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          'ml-auto font-mono text-[10px] px-1.5 rounded',
                          isActive ? 'bg-bg text-accent' : 'bg-accent text-white'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <form action="/auth/signout" method="post" className="mt-auto pt-4 border-t border-line">
          <button
            type="submit"
            className="w-full text-left text-[12px] text-muted hover:text-ink py-1.5 px-2"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </nav>
  );
}

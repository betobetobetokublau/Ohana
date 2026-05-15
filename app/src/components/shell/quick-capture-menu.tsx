'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { MODULE_COLOR } from '@/lib/utils/modules';

/**
 * Las mismas opciones que el módulo Capturar de móvil, pero como dropdown
 * desde el botón + del topbar de desktop/iPad.
 */
const OPTIONS = [
  { href: '/mood',                     glyph: '◔', bg: 'hsl(var(--accent))',     title: 'Mood',              desc: 'Cómo te sientes ahora' },
  { href: '/mimos/nuevo',              glyph: '❋', bg: MODULE_COLOR.mimos,        title: 'Mimo',              desc: 'Un detalle de tu pareja' },
  { href: '/discusiones/nueva',        glyph: '⌇', bg: MODULE_COLOR.discusiones,  title: 'Discusión',         desc: 'Algo importante que pasó' },
  { href: '/temas/nuevo',              glyph: '◇', bg: MODULE_COLOR.ink,          title: 'Tema',              desc: 'Algo que platicar' },
  { href: '/citas/ideas/nueva',        glyph: '♡', bg: MODULE_COLOR.citas,        title: 'Idea de cita',      desc: 'A la biblioteca' },
  { href: '/viajes/wishlist/nuevo',    glyph: '→', bg: MODULE_COLOR.viajes,       title: 'Lugar para viajar', desc: 'Wishlist' },
];

export function QuickCaptureMenu() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'rounded-sm p-1.5 hover:bg-white/12 transition-colors',
          open && 'bg-white/12'
        )}
        aria-label="Capturar rápido"
        aria-expanded={open}
      >
        <Plus className="w-4 h-4" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 bg-bg border border-line rounded-md shadow-xl z-50 overflow-hidden animate-in-up"
          role="menu"
        >
          <div className="px-4 py-3 border-b border-line">
            <div className="eyebrow text-accent">Capturar</div>
            <div className="font-serif italic text-[14px] text-muted mt-0.5">¿Qué quieres anotar?</div>
          </div>
          <div className="py-1">
            {OPTIONS.map(opt => (
              <Link
                key={opt.href}
                href={opt.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface transition-colors"
                role="menuitem"
              >
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg font-serif text-white leading-none"
                  style={{ backgroundColor: opt.bg }}
                >
                  {opt.glyph}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-ink">{opt.title}</div>
                  <div className="meta">{opt.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

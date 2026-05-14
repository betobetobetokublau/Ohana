import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata = { title: 'Ohana · Capturar' };

const CAPTURE_OPTIONS = [
  { href: '/mood',         glyph: '◔', bg: 'hsl(var(--accent))',        title: 'Mood',              desc: 'Cómo te sientes ahora · sub-15s' },
  { href: '/mimos/nuevo',  glyph: '❋', bg: 'hsl(var(--mod-mimos))',     title: 'Mimos',             desc: 'Un detalle de tu pareja · privado' },
  { href: '/discusiones/nueva', glyph: '⌇', bg: 'hsl(var(--mod-discus))', title: 'Discusión',         desc: 'Algo importante que pasó' },
  { href: '/temas/nuevo',  glyph: '◇', bg: 'hsl(var(--ink))',           title: 'Tema',              desc: 'Algo que tenemos que platicar' },
  { href: '/citas/ideas/nueva', glyph: '♡', bg: 'hsl(var(--mod-citas))', title: 'Idea de cita',      desc: 'Para la biblioteca' },
  { href: '/viajes/wishlist/nuevo', glyph: '→', bg: 'hsl(var(--mod-viajes))', title: 'Lugar para viajar', desc: 'Wishlist' },
];

export default function CapturarPage() {
  return (
    <div className="px-5 py-8 md:px-10 max-w-2xl mx-auto">
      <div className="eyebrow text-accent mb-2">Capturar</div>
      <h1 className="display text-3xl">
        ¿Qué quieres <em>anotar</em>?
      </h1>
      <p className="italic-serif text-[15px] mt-2 mb-7">
        Lo importante se anota antes de que se olvide.
      </p>

      <div className="space-y-3">
        {CAPTURE_OPTIONS.map(opt => (
          <Link
            key={opt.href}
            href={opt.href}
            className="flex items-center gap-3.5 bg-surface border border-line rounded-md p-4 hover:bg-surface-2 transition-colors"
          >
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl font-serif text-white leading-none"
              style={{ backgroundColor: opt.bg }}
            >
              {opt.glyph}
            </div>
            <div className="flex-1">
              <div className="eyebrow">{opt.title}</div>
              <div className="text-[14px] mt-0.5 font-medium">{opt.desc}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted" />
          </Link>
        ))}
      </div>
    </div>
  );
}

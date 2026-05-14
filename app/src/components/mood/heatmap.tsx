'use client';

import { useState } from 'react';
import { moodByKey, dominantMood } from '@/lib/utils/mood';
import type { MoodEmocion } from '@/lib/types';
import { format, parseISO, startOfWeek, addDays, addWeeks, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';

interface MoodPoint {
  id: string;
  user_id: string;
  emocion: MoodEmocion;
  nota: string | null;
  created_at: string;
}

type Filter = 'mine' | 'partner' | 'both';

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function MoodHeatmap({
  moods,
  myId,
  partnerId,
}: {
  moods: MoodPoint[];
  myId: string;
  partnerId: string | null;
}) {
  const [filter, setFilter] = useState<Filter>('mine');

  // 8 semanas, empezando 8 lunes atrás
  const lastMonday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weeks = Array.from({ length: 8 }, (_, i) => addWeeks(lastMonday, -7 + i));

  const filtered = moods.filter(m => {
    if (filter === 'mine') return m.user_id === myId;
    if (filter === 'partner') return m.user_id === partnerId;
    return true;
  });

  function moodsForDay(date: Date): MoodPoint[] {
    return filtered.filter(m => isSameDay(parseISO(m.created_at), date));
  }

  return (
    <div className="bg-surface border border-line rounded-md p-4 md:p-5">
      {/* Filter tabs */}
      <div className="flex gap-1 mb-4">
        <FilterBtn label="Míos" active={filter === 'mine'} onClick={() => setFilter('mine')} />
        {partnerId && (
          <FilterBtn label="De mi pareja" active={filter === 'partner'} onClick={() => setFilter('partner')} />
        )}
        {partnerId && (
          <FilterBtn label="Ambos" active={filter === 'both'} onClick={() => setFilter('both')} />
        )}
      </div>

      <div className="grid grid-cols-[auto_repeat(8,1fr)] gap-1">
        <div />
        {weeks.map((w, i) => (
          <div key={i} className="meta text-center text-[9px]">
            {format(w, 'd MMM', { locale: es })}
          </div>
        ))}

        {DAYS.map((dayLabel, dow) => (
          <>
            <div key={`label-${dow}`} className="meta text-right pr-1 text-[10px] flex items-center justify-end">
              {dayLabel}
            </div>
            {weeks.map((weekStart, wi) => {
              const day = addDays(weekStart, dow);
              const dayMoods = moodsForDay(day);
              const dom = dominantMood(dayMoods);
              return (
                <HeatmapCell
                  key={`${dow}-${wi}`}
                  date={day}
                  count={dayMoods.length}
                  dominant={dom}
                  allMoods={dayMoods}
                />
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-[12px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-sm border transition-colors',
        active ? 'bg-ink text-bg border-ink' : 'bg-transparent text-muted border-line hover:text-ink'
      )}
    >
      {label}
    </button>
  );
}

function HeatmapCell({
  date,
  count,
  dominant,
  allMoods,
}: {
  date: Date;
  count: number;
  dominant: MoodPoint | null;
  allMoods: MoodPoint[];
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={cn(
        'relative aspect-square rounded-sm flex items-center justify-center text-base border border-line',
        count > 0 ? 'bg-bg cursor-pointer' : 'bg-surface-2'
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {dominant && moodByKey[dominant.emocion]?.emoji}
      {hover && allMoods.length > 0 && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 bg-ink text-bg text-[11px] rounded-md px-2.5 py-1.5 whitespace-nowrap pointer-events-none">
          {format(date, 'EEE d MMM', { locale: es })} · {count} captura{count > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

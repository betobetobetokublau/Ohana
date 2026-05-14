'use client';

import { moodByKey } from '@/lib/utils/mood';
import { useState } from 'react';
import type { MoodEmocion } from '@/lib/types';
import { format, parseISO, startOfDay, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface MoodPoint {
  id: string;
  user_id: string;
  emocion: MoodEmocion;
  nota: string | null;
  created_at: string;
}

export function MoodSparkline({
  moods,
  myId,
  partnerId,
}: {
  moods: MoodPoint[];
  myId: string;
  partnerId: string | null;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  // 7 días, empezando hace 6 días, terminando hoy
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, -6 + i));

  const myMoods = moods.filter(m => m.user_id === myId);
  const partnerMoods = moods.filter(m => m.user_id === partnerId);

  const expandedMood = expanded ? moods.find(m => m.id === expanded) : null;

  return (
    <div className="bg-surface border border-line rounded-md p-4">
      <Row label="Tú" days={days} moods={myMoods} onClick={setExpanded} expanded={expanded} />
      {partnerId && (
        <Row label="Pareja" days={days} moods={partnerMoods} onClick={setExpanded} expanded={expanded} />
      )}
      <div className="flex justify-between mt-1 px-1">
        {days.map(d => (
          <span key={d.toISOString()} className="meta text-[9px] flex-1 text-center">
            {format(d, 'EEE', { locale: es }).slice(0, 1).toUpperCase()}
          </span>
        ))}
      </div>
      {expandedMood && (
        <div className="mt-3 pt-3 border-t border-line text-[13px]">
          <div className="meta mb-1">
            {format(parseISO(expandedMood.created_at), "EEE d MMM · HH:mm", { locale: es })}
            {' · '}
            {moodByKey[expandedMood.emocion]?.label}
          </div>
          {expandedMood.nota && (
            <p className="italic-serif text-[14px] text-ink">{expandedMood.nota}</p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  days,
  moods,
  onClick,
  expanded,
}: {
  label: string;
  days: Date[];
  moods: MoodPoint[];
  onClick: (id: string | null) => void;
  expanded: string | null;
}) {
  return (
    <div className="flex items-center gap-3 mb-2 last:mb-0">
      <div className="meta w-12">{label}</div>
      <div className="flex flex-1 justify-between">
        {days.map(d => {
          const moodOfDay = moods.find(m => isSameDay(parseISO(m.created_at), d));
          return (
            <button
              key={d.toISOString()}
              onClick={() => onClick(moodOfDay ? (expanded === moodOfDay.id ? null : moodOfDay.id) : null)}
              className="w-9 h-9 flex items-center justify-center text-xl rounded-sm hover:bg-surface-2 disabled:cursor-default"
              disabled={!moodOfDay}
              aria-label={moodOfDay ? moodByKey[moodOfDay.emocion]?.label : 'sin registro'}
            >
              {moodOfDay ? moodByKey[moodOfDay.emocion]?.emoji : (
                <span className="w-2 h-2 rounded-full bg-line-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

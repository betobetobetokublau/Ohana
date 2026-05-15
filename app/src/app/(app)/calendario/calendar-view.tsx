'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format, addMonths, subMonths, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { fmtRel } from '@/lib/utils/dates';
import { Button, Checkbox, Dot } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import type { CalendarEvent } from './types';

const DOW_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function CalendarView({
  monthStart,
  events,
  sidePanelEvents,
}: {
  monthStart: Date;
  events: CalendarEvent[];
  sidePanelEvents: CalendarEvent[];
}) {
  const [grouped, setGrouped] = useState(false);

  const monthLabel = format(monthStart, 'MMMM yyyy', { locale: es });
  const monthParam = format(monthStart, 'yyyy-MM');
  const prevMonthParam = format(subMonths(monthStart, 1), 'yyyy-MM');
  const nextMonthParam = format(addMonths(monthStart, 1), 'yyyy-MM');

  // Días a mostrar en la grid: incluye relleno del primer / último día
  const days = useMemo(() => {
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 1 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
    });
  }, [monthStart]);

  // Eventos por día (yyyy-MM-dd → CalendarEvent[])
  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      (map[ev.date] ??= []).push(ev);
    }
    return map;
  }, [events]);

  return (
    <div className="px-5 py-8 md:px-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
        <div>
          <div className="eyebrow text-accent">Calendario</div>
          <h1 className="display text-3xl md:text-4xl capitalize">
            {monthLabel.split(' ')[0]} <em>{monthLabel.split(' ')[1]}</em>
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/calendario?month=${prevMonthParam}`}>
            <Button variant="ghost" size="sm">← Anterior</Button>
          </Link>
          <Link href="/calendario">
            <Button variant="ghost" size="sm">Hoy</Button>
          </Link>
          <Link href={`/calendario?month=${nextMonthParam}`}>
            <Button variant="ghost" size="sm">Siguiente →</Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Grid del mes */}
        <div className="bg-surface border border-line rounded-md overflow-hidden">
          <div className="grid grid-cols-7 border-b border-line">
            {DOW_LABELS.map((d, i) => (
              <div
                key={i}
                className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted px-2 py-2 text-center"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 grid-rows-6 auto-rows-fr">
            {days.map(day => {
              const key = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDay[key] ?? [];
              const inMonth = isSameMonth(day, monthStart);
              const today = isToday(day);
              return (
                <div
                  key={key}
                  className={cn(
                    'min-h-[80px] p-1.5 border-r border-b border-line last:border-r-0',
                    !inMonth && 'bg-bg/40',
                    today && 'bg-accent-soft/30'
                  )}
                >
                  <div
                    className={cn(
                      'font-mono text-[11px] font-medium mb-1',
                      !inMonth && 'text-muted-2',
                      today && 'text-accent font-semibold'
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(ev => (
                      <div
                        key={ev.id}
                        className="text-[10px] leading-tight font-medium truncate pl-1.5 border-l-2"
                        style={{ borderColor: ev.color }}
                      >
                        {ev.label}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-muted pl-1.5">+{dayEvents.length - 3} más</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <aside>
          <div className="mb-2">
            <div className="eyebrow">Próximos 14 días</div>
            <p className="italic-serif text-[13px] mt-0.5">una ventana, no un historial</p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-[13px] text-muted hover:text-ink mt-3 mb-4 select-none">
            <Checkbox
              checked={grouped}
              onCheckedChange={v => setGrouped(v === true)}
            />
            <span>Agrupar por categoría</span>
          </label>

          {grouped ? (
            <GroupedPanel events={sidePanelEvents} />
          ) : (
            <FlatPanel events={sidePanelEvents} />
          )}
        </aside>
      </div>
    </div>
  );
}

function FlatPanel({ events }: { events: CalendarEvent[] }) {
  if (events.length === 0) {
    return <p className="italic-serif text-[14px]">Sin eventos próximos.</p>;
  }
  return (
    <div className="space-y-1">
      {events.map(ev => (
        <div key={ev.id} className="grid grid-cols-[auto_1fr_auto] gap-2 py-2 items-baseline border-b border-line last:border-b-0">
          <Dot color={ev.color} />
          <div>
            <div className="font-medium text-[13px] leading-tight">{ev.label}</div>
            <div className="font-mono text-[9px] text-muted uppercase tracking-wider mt-0.5">
              {ev.type}
            </div>
          </div>
          <div className="font-mono text-[11px] text-muted whitespace-nowrap">
            {fmtRel(ev.date)}
          </div>
        </div>
      ))}
    </div>
  );
}

function GroupedPanel({ events }: { events: CalendarEvent[] }) {
  const grouped = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      (map[ev.type] ??= []).push(ev);
    }
    return map;
  }, [events]);

  if (Object.keys(grouped).length === 0) {
    return <p className="italic-serif text-[14px]">Sin eventos próximos.</p>;
  }

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([type, list]) => (
        <div key={type}>
          <div className="eyebrow mb-2 flex items-center gap-2">
            <Dot color={list[0]?.color ?? 'hsl(var(--ink))'} />
            {type}
          </div>
          <div className="space-y-1">
            {list.map(ev => (
              <div key={ev.id} className="flex justify-between gap-2 py-1.5 text-[13px]">
                <span className="font-medium">{ev.label}</span>
                <span className="meta whitespace-nowrap">{fmtRel(ev.date)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format, addMonths, subMonths, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { fmtRel } from '@/lib/utils/dates';
import { Button, Checkbox } from '@/components/ui';
import { Avatar } from '@/components/shared/avatar';
import { DayDetailModal } from './day-detail-modal';
import { SidePanelRow } from './side-panel-row';
import { cn } from '@/lib/utils/cn';
import type { CalendarEvent } from './types';
import type { AvatarData } from '@/lib/utils/avatar';

const DOW_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

type UserOption = {
  id: string;
  name: string;
  avatar: { emoji: string; color: string };
};

type FilterMode = 'todos' | string; // 'todos' o user_id

export function CalendarView({
  monthStart,
  events,
  sidePanelEvents,
  users,
}: {
  monthStart: Date;
  events: CalendarEvent[];
  sidePanelEvents: CalendarEvent[];
  users: UserOption[];
}) {
  const [grouped, setGrouped] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>('todos');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const monthLabel = format(monthStart, 'MMMM yyyy', { locale: es });
  const prevMonthParam = format(subMonths(monthStart, 1), 'yyyy-MM');
  const nextMonthParam = format(addMonths(monthStart, 1), 'yyyy-MM');

  // Filtra eventos por usuario asignado
  const filtered = useMemo(() => {
    if (filterMode === 'todos') return events;
    return events.filter(e => e.assignedTo === filterMode);
  }, [events, filterMode]);

  const filteredSidePanel = useMemo(() => {
    if (filterMode === 'todos') return sidePanelEvents;
    return sidePanelEvents.filter(e => e.assignedTo === filterMode);
  }, [sidePanelEvents, filterMode]);

  const days = useMemo(() => {
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 1 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
    });
  }, [monthStart]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of filtered) {
      (map[ev.date] ??= []).push(ev);
    }
    return map;
  }, [filtered]);

  const selectedDayEvents = selectedDay ? (eventsByDay[selectedDay] ?? []) : [];

  return (
    <div className="px-5 py-8 md:px-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-4 flex-wrap gap-4">
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

      {/* Filter switch · Todos / User A / User B */}
      <div className="flex gap-1 mb-6 p-1 bg-surface border border-line rounded-md w-fit">
        <FilterTab active={filterMode === 'todos'} onClick={() => setFilterMode('todos')}>
          <span className="text-[12px]">Todos</span>
        </FilterTab>
        {users.map(u => (
          <FilterTab
            key={u.id}
            active={filterMode === u.id}
            onClick={() => setFilterMode(u.id)}
          >
            <Avatar data={u.avatar} size="xs" />
            <span className="text-[12px]">{u.name.split(' ')[0]}</span>
          </FilterTab>
        ))}
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
                <button
                  key={key}
                  onClick={() => setSelectedDay(key)}
                  disabled={dayEvents.length === 0 && !inMonth}
                  className={cn(
                    'min-h-[80px] p-1.5 border-r border-b border-line last:border-r-0 text-left transition-colors',
                    !inMonth && 'bg-bg/40',
                    today && 'bg-accent-soft/30',
                    dayEvents.length > 0 && 'hover:bg-surface-2 cursor-pointer'
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
                        className={cn(
                          'text-[10px] leading-tight font-medium truncate pl-1.5 border-l-2',
                          ev.completed && 'line-through opacity-60'
                        )}
                        style={{ borderColor: ev.color }}
                      >
                        {ev.label}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-muted pl-1.5">+{dayEvents.length - 3} más</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Side panel · 14 días */}
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
            <GroupedPanel events={filteredSidePanel} />
          ) : (
            <FlatPanel events={filteredSidePanel} />
          )}
        </aside>
      </div>

      {/* Day detail modal */}
      {selectedDay && (
        <DayDetailModal
          date={parseISO(selectedDay)}
          events={selectedDayEvents}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-sm font-semibold uppercase tracking-wider transition-colors',
        active ? 'bg-ink text-bg' : 'text-muted hover:text-ink'
      )}
    >
      {children}
    </button>
  );
}

function FlatPanel({ events }: { events: CalendarEvent[] }) {
  if (events.length === 0) {
    return <p className="italic-serif text-[14px]">Sin eventos próximos.</p>;
  }
  return (
    <div className="space-y-1">
      {events.map(ev => (
        <SidePanelRow key={ev.id} event={ev} />
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
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: list[0]?.color }}
            />
            {type}
          </div>
          <div className="space-y-1">
            {list.map(ev => (
              <SidePanelRow key={ev.id} event={ev} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

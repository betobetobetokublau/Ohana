'use client';

import { Menu, Search, Mail } from 'lucide-react';
import { Avatar } from '@/components/shared/avatar';
import { QuickCaptureMenu } from './quick-capture-menu';
import type { AvatarData } from '@/lib/utils/avatar';

interface TopbarProps {
  brand: string;
  coupleName: string;
  unreadCount: number;
  avatar: Partial<AvatarData>;
  onToggleSidebar: () => void;
}

export function Topbar({ brand, coupleName, unreadCount, avatar, onToggleSidebar }: TopbarProps) {
  return (
    <header className="flex items-center gap-3.5 px-4 h-12 bg-ink text-bg">
      <button
        className="rounded-sm p-1.5 hover:bg-white/10 transition-colors"
        onClick={onToggleSidebar}
        aria-label="Mostrar / ocultar navegación"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="font-serif text-[18px] tracking-tight">{brand}</div>
      <div className="font-mono text-[10px] text-bg/65 uppercase tracking-wider pl-3.5 border-l border-white/20 hidden sm:block">
        {coupleName}
      </div>
      <div className="ml-auto flex items-center gap-1">
        <button className="rounded-sm p-1.5 hover:bg-white/10" aria-label="Buscar">
          <Search className="w-4 h-4" />
        </button>
        <QuickCaptureMenu />
        <button className="rounded-sm p-1.5 hover:bg-white/10 relative" aria-label="Notificaciones">
          <Mail className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
          )}
        </button>
        <div className="ml-1">
          <Avatar data={avatar} size="sm" />
        </div>
      </div>
    </header>
  );
}

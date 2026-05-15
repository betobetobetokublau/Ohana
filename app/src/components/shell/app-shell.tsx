'use client';

import { useState, useEffect } from 'react';
import { Topbar } from './topbar';
import { Sidebar } from './sidebar';
import { BottomNav } from './bottom-nav';
import type { AvatarData } from '@/lib/utils/avatar';

interface AppShellProps {
  children: React.ReactNode;
  coupleName: string;
  avatar: Partial<AvatarData>;
  unreadCount: number;
}

export function AppShell({ children, coupleName, avatar, unreadCount }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Persistir estado sidebar en localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ohana:sidebar:collapsed');
    if (saved === '1') setCollapsed(true);
  }, []);

  function toggleSidebar() {
    setCollapsed(c => {
      const next = !c;
      localStorage.setItem('ohana:sidebar:collapsed', next ? '1' : '0');
      return next;
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* Top bar visible en md+ */}
      <div className="hidden md:block">
        <Topbar
          brand="Ohana"
          coupleName={coupleName}
          unreadCount={unreadCount}
          avatar={avatar}
          onToggleSidebar={toggleSidebar}
        />
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar visible en md+ */}
        <div className="hidden md:block">
          <Sidebar collapsed={collapsed} />
        </div>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
      </div>

      {/* Bottom nav visible <md */}
      <BottomNav />
    </div>
  );
}

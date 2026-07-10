'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground transition-colors duration-300">
        <div className="relative flex h-16 w-16 items-center justify-center">
          {/* Glowing loader */}
          <div className="absolute inset-0 rounded-full border-4 border-primary-border" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#ff5e5b] animate-spin" />
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Pi</div>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 animate-pulse">
          Verifying Session...
        </p>
      </div>
    );
  }

  // Prevent flash of unauthenticated content before router push completes
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Work Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header Top Bar */}
        <Header setSidebarOpen={setSidebarOpen} />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-8 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}

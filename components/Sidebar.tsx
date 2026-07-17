'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
  LayoutDashboard,
  Award,
  Layers,
  ShoppingBag,
  Wrench,
  MapPin,
  Ticket,
  FileText,
  Inbox,
  LogOut,
  X,
  Cpu,
  MessageSquare,
  Briefcase,
  Users
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await api.get('/job-applications/pending-count');
        setPendingCount(res.data?.data?.total || 0);
      } catch (error) {
        console.error('Failed to fetch pending job applications count:', error);
      }
    };

    fetchPendingCount();

    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [pathname]);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Categories', href: '/dashboard/categories', icon: Layers },
    { label: 'Products', href: '/dashboard/products', icon: ShoppingBag },
    { label: 'Spare Parts', href: '/dashboard/spare-parts', icon: Cpu },
    { label: 'Services', href: '/dashboard/services', icon: Wrench },
    { label: 'Branches', href: '/dashboard/branches', icon: MapPin },
    { label: 'Service Requests', href: '/dashboard/service-requests', icon: Ticket },
    { label: 'Blogs CMS', href: '/dashboard/blogs', icon: FileText },
    { label: 'Careers CMS', href: '/dashboard/careers', icon: Briefcase },
    { label: 'Job Applications', href: '/dashboard/job-applications', icon: Users },
    { label: 'Contact Inbox', href: '/dashboard/contact-inbox', icon: Inbox },
    { label: 'Feedbacks', href: '/dashboard/feedback', icon: MessageSquare },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/5 bg-primary-deep/80 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand/Logo Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-white/5 relative">
          <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#ff5e5b]/20 to-transparent" />
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/40 p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-105">
              <div className="absolute inset-0 rounded-xl border border-[#ff5e5b]/20 animate-pulse" />
              <img
                src="/image/pc_logo.png"
                alt="PC INFOTECH Logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-wider text-foreground uppercase bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent group-hover:text-[#ff5e5b] transition-colors">PC Infotech</h1>
              <p className="text-[9px] text-[#ff5e5b]/80 font-bold tracking-widest uppercase glow-text">Admin Console</p>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Handle exact dashboard matches vs child page sub-routes
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff5e5b]/12 to-transparent text-[#ff5e5b] border-l-4 border-[#ff5e5b] shadow-[inset_4px_0_15px_rgba(255,94,91,0.06)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    size={18}
                    className={`transition-all duration-300 group-hover:scale-115 group-hover:rotate-6 ${
                      isActive ? 'text-[#ff5e5b] drop-shadow-[0_0_8px_rgba(255,94,91,0.5)]' : 'text-slate-400 group-hover:text-[#ff5e5b]'
                    }`}
                  />
                  <span className="transition-transform duration-300 group-hover:translate-x-1.5 inline-block">
                    {item.label}
                  </span>
                </div>
                {item.label === 'Job Applications' && pendingCount > 0 && (
                  <span className="relative flex h-2.5 w-2.5 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5e5b] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff5e5b]"></span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="border-t border-white/5 p-4 relative">
          <div className="absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#ff5e5b]/10 to-transparent" />
          <button
            onClick={logout}
            className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-bold text-slate-450 hover:bg-red-500/10 hover:text-red-400 hover:shadow-[0_4px_15px_rgba(239,68,68,0.05)] transition-all duration-300 group"
          >
            <LogOut size={18} className="text-slate-400 group-hover:text-red-400 transition-colors" />
            Logout Session
          </button>
        </div>
      </aside>
    </>
  );
};

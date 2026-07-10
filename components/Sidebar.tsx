'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
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
  Cpu
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Brands', href: '/dashboard/brands', icon: Award },
    { label: 'Categories', href: '/dashboard/categories', icon: Layers },
    { label: 'Products', href: '/dashboard/products', icon: ShoppingBag },
    { label: 'Spare Parts', href: '/dashboard/spare-parts', icon: Cpu },
    { label: 'Services', href: '/dashboard/services', icon: Wrench },
    { label: 'Branches', href: '/dashboard/branches', icon: MapPin },
    { label: 'Service Requests', href: '/dashboard/service-requests', icon: Ticket },
    { label: 'Blogs CMS', href: '/dashboard/blogs', icon: FileText },
    { label: 'Contact Inbox', href: '/dashboard/contact-inbox', icon: Inbox },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-primary-border bg-primary-slate transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand/Logo Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-primary-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-primary-border bg-primary-deep p-1 shadow">
              <img
                src="/image/pc_logo.png"
                alt="PC INFOTECH Logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wider text-foreground uppercase">PC Infotech</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-widest uppercase">Admin Panel</p>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-primary-card hover:text-foreground lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6 scrollbar-thin">
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
                className={`group flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff5e5b]/10 to-transparent text-[#ff5e5b] border-l-2 border-[#ff5e5b]'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-primary-card hover:text-foreground border-l-2 border-transparent'
                }`}
              >
                <Icon
                  size={19}
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-[#ff5e5b]' : 'text-slate-550 dark:text-slate-400 group-hover:text-[#ff5e5b]'
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="border-t border-primary-border p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-950/20 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={19} className="text-slate-500 dark:text-slate-400 group-hover:text-red-400" />
            Logout Session
          </button>
        </div>
      </aside>
    </>
  );
};

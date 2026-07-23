'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, User, ShieldCheck, Sun, Moon } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Helper to map pathname to a human-readable title
  const getPageTitle = () => {
    if (!pathname) return 'Overview';
    const segments = pathname.split('/');
    const last = segments[segments.length - 1];

    if (pathname === '/dashboard') return 'Dashboard Overview';
    if (pathname.includes('/products/create')) return 'Add New Product';
    if (pathname.includes('/products/edit')) return 'Edit Product Details';
    if (pathname.includes('/services/create')) return 'Add New Service';
    if (pathname.includes('/services/edit')) return 'Edit Service Catalog';
    if (pathname.includes('/blogs/create')) return 'Add New Blog Post';
    if (pathname.includes('/blogs/edit')) return 'Edit Blog Post';

    switch (last) {
      case 'brands':
        return 'Brands Management';
      case 'categories':
        return 'Product Categories';
      case 'products':
        return 'Products Inventory';
      case 'services':
        return 'Services Catalog';
      case 'branches':
        return 'Branch Locations';
      case 'blogs':
        return 'Blogs CMS';
      case 'contact-inbox':
        return 'Contact inquiries Inbox';
      case 'change-password':
        return 'Update Administrator Security';
      case 'profile':
        return 'Administrator Profile';
      default:
        return 'PC Infotech Admin';
    }
  };

  return (
    <header className="flex h-20 w-full items-center justify-between border-b border-primary-border bg-primary-slate/90 px-6 backdrop-blur-md sticky top-0 z-30 transition-colors duration-300">
      {/* Page Title & Mobile Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-primary-card hover:text-foreground lg:hidden"
        >
          <Menu size={22} />
        </button>
        <h2 className="text-xl font-semibold tracking-wide text-foreground">
          {getPageTitle()}
        </h2>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="group flex h-9 w-9 items-center justify-center rounded-lg bg-primary-card hover:bg-primary-border border border-primary-border transition-all duration-200 hover:scale-105 cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun size={16} className="text-amber-400 group-hover:text-amber-300 transition-colors" />
          ) : (
            <Moon size={16} className="text-slate-600 group-hover:text-slate-900 transition-colors" />
          )}
        </button>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-primary-border" />

        {/* Admin Badging & Profile Group */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-foreground leading-tight">
              {user?.name || 'Administrator'}
            </span>
            <span className="text-[10px] text-[#ff5e5b] font-bold uppercase tracking-wider flex items-center justify-end gap-1 mt-0.5">
              <ShieldCheck size={11} className="text-[#ff5e5b]" />
              {user?.role === 'admin' ? 'Super Admin' : 'System Staff'}
            </span>
          </div>

          {/* Profile Details Link */}
          <Link
            href="/dashboard/profile"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-card hover:bg-primary-border border border-primary-border text-[#ff5e5b] hover:text-[#ff3b38] transition-all duration-200 hover:scale-105"
            aria-label="Admin Profile"
          >
            <User size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
};

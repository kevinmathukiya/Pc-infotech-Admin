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
      case 'service-requests':
        return 'Service Requests (Tickets)';
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
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-card border border-primary-border text-slate-500 dark:text-slate-400 hover:bg-primary-border hover:text-foreground transition-all duration-200"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Admin Badging */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-sm font-semibold text-foreground">
            {user?.name || 'Administrator'}
          </span>
          <span className="text-xs text-[#ff5e5b] font-medium flex items-center justify-end gap-1">
            <ShieldCheck size={12} />
            {user?.role === 'admin' ? 'Super Admin' : 'System Staff'}
          </span>
        </div>

        {/* Profile Details Link */}
        <Link
          href="/dashboard/profile"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-card border border-primary-border text-[#ff5e5b] hover:bg-primary-border transition-colors"
        >
          <User size={18} />
        </Link>
      </div>
    </header>
  );
};

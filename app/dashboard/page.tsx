'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import {
  ShoppingBag,
  MapPin,
  Inbox,
  ArrowRight,
  Clock,
  Plus,
  RefreshCw,
  Sparkles,
  Zap,
  ChevronRight,
  Wrench,
  Package,
  Shield,
  Layers
} from 'lucide-react';
import Link from 'next/link';

interface InquiryItem {
  _id: string;
  name: string;
  email: string;
  subject: string;
  isRead: boolean;
  createdAt?: string;
}

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalServices: 0,
    activeBranches: 0,
    unreadInquiries: 0,
    totalInquiries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Recent activity list
  const [recentInquiries, setRecentInquiries] = useState<InquiryItem[]>([]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchDashboardData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [productsRes, servicesRes, branchesRes, contactsRes] = await Promise.all([
        api.get('products?limit=1'),
        api.get('services?limit=1'),
        api.get('branches'),
        api.get('contact?limit=50'),
      ]);

      const totalProducts = productsRes.data?.data?.total || 0;
      const totalServices = servicesRes.data?.data?.total || 0;
      
      const branchesList = branchesRes.data?.data?.branches || [];
      const activeBranches = branchesList.filter((b: any) => b.status === 'active').length;

      const contactsList: InquiryItem[] = contactsRes.data?.data?.contacts || [];
      const unreadInquiries = contactsList.filter((c) => !c.isRead).length;

      setStats({
        totalProducts,
        totalServices,
        activeBranches,
        unreadInquiries,
        totalInquiries: contactsList.length,
      });

      // Top 5 recent inquiries
      setRecentInquiries(contactsList.slice(0, 5));

      if (isManualRefresh) toast.success('Dashboard metrics refreshed!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#ff5e5b]/20" />
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-primary-border border-t-[#ff5e5b]" />
        </div>
        <p className="mt-4 text-xs font-bold text-slate-300 uppercase tracking-widest animate-pulse">
          Loading Overview...
        </p>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      subtitle: 'Inventory Catalog',
      icon: ShoppingBag,
      iconColor: 'text-sky-400',
      borderColor: 'border-sky-500/30',
      bgGlow: 'hover:border-sky-500/50',
      link: '/dashboard/products',
      label: 'Manage Products',
    },
    {
      title: 'Services Catalog',
      value: stats.totalServices,
      subtitle: 'Active Offerings',
      icon: Wrench,
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/30',
      bgGlow: 'hover:border-purple-500/50',
      link: '/dashboard/services',
      label: 'Manage Services',
    },
    {
      title: 'Active Branches',
      value: stats.activeBranches,
      subtitle: 'Operational Hubs',
      icon: MapPin,
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgGlow: 'hover:border-emerald-500/50',
      link: '/dashboard/branches',
      label: 'Manage Outlets',
    },
    {
      title: 'Unread Inquiries',
      value: stats.unreadInquiries,
      subtitle: `${stats.totalInquiries} Total Messages`,
      icon: Inbox,
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgGlow: 'hover:border-amber-500/50',
      link: '/dashboard/contact-inbox',
      label: 'Customer Inbox',
    },
  ];

  const quickActions = [
    { title: 'Add New Product', desc: 'Create product in inventory', link: '/dashboard/products/create', icon: Package, color: 'text-sky-400' },
    { title: 'Add New Service', desc: 'Configure service catalog', link: '/dashboard/services/create', icon: Wrench, color: 'text-emerald-400' },
    { title: 'Manage Outlets', desc: 'View regional branch hubs', link: '/dashboard/branches', icon: MapPin, color: 'text-[#ff5e5b]' },
    { title: 'Contact Inbox', desc: 'Read customer messages', link: '/dashboard/contact-inbox', icon: Inbox, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up duration-300 pb-8">
      
      {/* Header Banner */}
      <div className="glass-card-premium rounded-2xl p-6 border border-primary-border flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#ff5e5b]/5 blur-2xl pointer-events-none" />
        
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            System Live
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            {getGreeting()}, Admin <Sparkles size={20} className="text-amber-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl font-medium">
            Overview of PC INFOTECH products inventory, services catalog, branch outlets, and contact inbox.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-card border border-primary-border text-slate-300 hover:text-foreground transition-all cursor-pointer group"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={`transition-transform duration-500 ${refreshing ? 'animate-spin text-[#ff5e5b]' : 'group-hover:rotate-180'}`} />
          </button>
          
          <Link
            href="/dashboard/products/create"
            className="btn-premium-brand h-10 px-4 text-xs font-bold flex items-center gap-2 shadow-md"
          >
            <Plus size={15} /> Add Product
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.link}
              className={`glass-card-premium rounded-2xl p-5 border ${card.borderColor} ${card.bgGlow} transition-all duration-300 group hover:-translate-y-1 block`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{card.title}</span>
                  <h3 className="text-3xl font-black text-foreground mt-2 tracking-tight group-hover:scale-105 origin-left transition-transform">
                    {card.value}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium mt-1 block">{card.subtitle}</span>
                </div>

                <div className={`p-3 rounded-xl bg-primary-card border border-primary-border ${card.iconColor} group-hover:scale-110 transition-transform`}>
                  <Icon size={20} />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-primary-border/50 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-[#ff5e5b] transition-colors">
                <span>{card.label}</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Shortcuts */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Zap size={15} className="text-[#ff5e5b]" /> Quick Management Shortcuts
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                href={action.link}
                className="glass-card-premium rounded-xl p-4 border border-primary-border hover:border-[#ff5e5b]/40 transition-all group flex items-center gap-3"
              >
                <div className={`p-2.5 rounded-lg bg-primary-card border border-primary-border ${action.color} group-hover:scale-110 transition-transform`}>
                  <Icon size={18} />
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-bold text-foreground group-hover:text-[#ff5e5b] transition-colors truncate">{action.title}</h4>
                  <p className="text-[11px] text-slate-400 font-medium truncate">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Feeds */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Quick Product Management Shortcut Card */}
        <div className="glass-card-premium rounded-2xl p-6 border border-primary-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-primary-border pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-sky-400" />
                <h3 className="text-sm font-bold text-foreground">Products Inventory Overview</h3>
              </div>
              <Link href="/dashboard/products" className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1">
                View All <ChevronRight size={12} />
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-primary-card/60 border border-primary-border/60 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between items-center text-foreground font-bold">
                <span>Total Catalog Items:</span>
                <span className="text-sky-400 text-sm">{stats.totalProducts}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Add, update prices, upload product image galleries, and configure specifications.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-primary-border text-right">
            <Link href="/dashboard/products/create" className="text-xs font-bold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1">
              + Add New Product <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Recent Contact Inquiries */}
        <div className="glass-card-premium rounded-2xl p-6 border border-primary-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-primary-border pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <Inbox size={18} className="text-amber-400" />
                <h3 className="text-sm font-bold text-foreground">Recent Contact Messages</h3>
              </div>
              <Link href="/dashboard/contact-inbox" className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">
                View All <ChevronRight size={12} />
              </Link>
            </div>

            {recentInquiries.length > 0 ? (
              <div className="space-y-3">
                {recentInquiries.map((inquiry) => (
                  <div
                    key={inquiry._id}
                    className="p-3 rounded-xl bg-primary-card/60 hover:bg-primary-card border border-primary-border/60 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="truncate">
                      <p className="text-xs font-bold text-foreground truncate">{inquiry.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium truncate">{inquiry.subject || inquiry.email}</p>
                    </div>
                    {inquiry.isRead ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-300 border border-slate-500/20 text-[10px] font-medium">
                        Read
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                        New
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                No recent contact messages found.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-primary-border text-right">
            <Link href="/dashboard/contact-inbox" className="text-xs font-bold text-slate-400 hover:text-foreground inline-flex items-center gap-1">
              Open inbox ({stats.totalInquiries}) <ArrowRight size={12} />
            </Link>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-3.5 rounded-xl bg-primary-card/40 border border-primary-border flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-medium">
        <span className="flex items-center gap-1.5">
          <Shield size={13} className="text-emerald-400" /> PC INFOTECH System Operational
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={13} /> Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>

    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import {
  ShoppingBag,
  MapPin,
  Ticket,
  Inbox,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeBranches: 0,
    pendingTickets: 0,
    unreadInquiries: 0,
  });
  const [loading, setLoading] = useState(true);

  // Chart data states
  const [ticketData, setTicketData] = useState<any[]>([]);
  const [branchData, setBranchData] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch in parallel
      const [productsRes, branchesRes, ticketsRes, contactsRes] = await Promise.all([
        api.get('/api/v1/products?limit=1'),
        api.get('/api/v1/branches'),
        api.get('/api/v1/service-requests'),
        api.get('/api/v1/contact'),
      ]);

      const totalProducts = productsRes.data?.data?.total || 0;
      
      const branchesList = branchesRes.data?.data?.branches || [];
      const activeBranches = branchesList.filter((b: any) => b.status === 'active').length;

      const ticketsList = ticketsRes.data?.data?.requests || [];
      const pendingTickets = ticketsList.filter((t: any) => t.status === 'pending').length;

      const contactsList = contactsRes.data?.data?.contacts || [];
      const unreadInquiries = contactsList.filter((c: any) => !c.isRead).length;

      setStats({
        totalProducts,
        activeBranches,
        pendingTickets,
        unreadInquiries,
      });

      // Format ticket statuses for Pie chart
      const ticketCounts = ticketsList.reduce(
        (acc: any, curr: any) => {
          acc[curr.status] = (acc[curr.status] || 0) + 1;
          return acc;
        },
        { pending: 0, in_progress: 0, completed: 0, cancelled: 0 }
      );

      setTicketData([
        { name: 'Pending', value: ticketCounts.pending, color: '#ff5e5b' },
        { name: 'In Progress', value: ticketCounts.in_progress, color: '#38bdf8' },
        { name: 'Completed', value: ticketCounts.completed, color: '#10b981' },
        { name: 'Cancelled', value: ticketCounts.cancelled, color: '#64748b' },
      ]);

      // Format branches by region for Bar chart
      const branchRegions = branchesList.reduce((acc: any, curr: any) => {
        const reg = curr.region || 'UNKNOWN';
        acc[reg] = (acc[reg] || 0) + 1;
        return acc;
      }, {});

      const formattedBranchData = Object.keys(branchRegions).map((reg) => ({
        region: reg,
        count: branchRegions[reg],
      }));
      setBranchData(formattedBranchData);

    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-border border-t-[#ff5e5b]" />
        <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider animate-pulse">
          Retrieving analytics...
        </p>
      </div>
    );
  }

  // Summary Metrics Layout cards
  const cardData = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: ShoppingBag,
      color: 'border-l-sky-400 text-sky-400',
      bgGlow: 'from-sky-400/5 to-transparent',
      link: '/dashboard/products',
      label: 'Manage products',
    },
    {
      title: 'Active Branches',
      value: stats.activeBranches,
      icon: MapPin,
      color: 'border-l-emerald-400 text-emerald-400',
      bgGlow: 'from-emerald-400/5 to-transparent',
      link: '/dashboard/branches',
      label: 'Manage branches',
    },
    {
      title: 'Pending Tickets',
      value: stats.pendingTickets,
      icon: Ticket,
      color: 'border-l-[#ff5e5b] text-[#ff5e5b]',
      bgGlow: 'from-[#ff5e5b]/5 to-transparent',
      link: '/dashboard/service-requests',
      label: 'View tickets',
    },
    {
      title: 'Unread inquiries',
      value: stats.unreadInquiries,
      icon: Inbox,
      color: 'border-l-amber-400 text-amber-400',
      bgGlow: 'from-amber-400/5 to-transparent',
      link: '/dashboard/contact-inbox',
      label: 'Read messages',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-primary-slate/40 backdrop-blur-md p-6 lg:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#ff5e5b]/8 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-10 left-1/4 h-32 w-32 rounded-full bg-sky-500/5 blur-2xl" />
        {/* Glow top border line */}
        <div className="absolute top-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-[#ff5e5b]/30 to-transparent" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-3 animate-pulse">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              System Status: Active
            </div>
            <h1 className="text-2xl font-black text-foreground lg:text-3xl tracking-tight bg-gradient-to-r from-white to-slate-355 bg-clip-text text-transparent">System Console</h1>
            <p className="mt-2 text-sm text-slate-400 max-w-xl font-medium leading-relaxed">
              Overview of PC INFOTECH store status, active customer repairs, inventory stock, and contact inbox submissions.
            </p>
          </div>
          <div className="hidden md:block shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/40 border border-white/5 shadow-inner">
              <Activity className="text-[#ff5e5b]" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cardData.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`glass-card-premium border-t-0 border-r-0 border-b-0 border-l-[4px] ${card.color} rounded-xl p-5 flex flex-col justify-between animate-fade-in-up group hover:-translate-y-1 transition-all duration-300`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.title}</p>
                  <p className="text-3xl font-black text-foreground mt-2.5 tracking-tight group-hover:scale-105 origin-left transition-transform duration-300">{card.value}</p>
                </div>
                <div className="rounded-xl bg-black/35 p-3 border border-white/5 group-hover:border-[#ff5e5b]/20 group-hover:text-[#ff5e5b] transition-all duration-300">
                  <Icon size={18} className="transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
              <div className="border-t border-white/5 mt-5 pt-3 flex items-center justify-between text-xs text-slate-400 font-semibold group-hover:text-[#ff5e5b] transition-colors">
                <Link href={card.link} className="flex items-center gap-1.5 tracking-wide">
                  {card.label}
                  <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Repair Tickets Status Pie Chart */}
        <div className="glass-card-premium rounded-2xl p-6 lg:col-span-1 flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(255,94,91,0.04)] border border-white/5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          {/* Glowing top line indicator */}
          <div className="absolute top-0 left-0 h-[1.5px] w-20 bg-gradient-to-r from-transparent via-[#ff5e5b]/45 to-transparent" />
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-[#ff5e5b]" size={18} />
            <h3 className="text-base font-bold text-foreground">Repair Tickets Status</h3>
          </div>
          <div className="flex-1 min-h-[260px] flex items-center justify-center">
            {ticketData.some((t) => t.value > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <defs>
                    <linearGradient id="pieCoral" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff5e5b" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#ff3b38" stopOpacity={0.65} />
                    </linearGradient>
                    <linearGradient id="pieSky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity={0.65} />
                    </linearGradient>
                    <linearGradient id="pieEmerald" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#047857" stopOpacity={0.65} />
                    </linearGradient>
                    <linearGradient id="pieSlate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#475569" stopOpacity={0.65} />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={ticketData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {ticketData.map((entry, index) => {
                      const fills = ['url(#pieCoral)', 'url(#pieSky)', 'url(#pieEmerald)', 'url(#pieSlate)'];
                      return <Cell key={`cell-${index}`} fill={fills[index]} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.85)',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-sans)',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={10}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', color: 'var(--foreground)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff5e5b]/10 border border-[#ff5e5b]/20 mb-3 animate-pulse">
                  <Ticket size={20} className="text-[#ff5e5b]" />
                </div>
                <p className="text-sm font-semibold text-foreground">All Clear</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">No active service tickets or repairs pending in the system.</p>
              </div>
            )}
          </div>
        </div>

        {/* Branches by Region Bar Chart */}
        <div className="glass-card-premium rounded-2xl p-6 lg:col-span-2 flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(56,189,248,0.04)] border border-white/5 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          {/* Glowing top line indicator */}
          <div className="absolute top-0 left-0 h-[1.5px] w-20 bg-gradient-to-r from-transparent via-sky-400/45 to-transparent" />
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-sky-400" size={18} />
            <h3 className="text-base font-bold text-foreground">Branches by Region</h3>
          </div>
          <div className="flex-1 min-h-[260px]">
            {branchData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={branchData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barCoral" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff5e5b" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#ff3b38" stopOpacity={0.4} />
                    </linearGradient>
                    <linearGradient id="barSky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--primary-border)" opacity={0.3} />
                  <XAxis dataKey="region" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.85)',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-sans)',
                    }}
                  />
                  <Bar dataKey="count" fill="url(#barCoral)" radius={[6, 6, 0, 0]}>
                    {branchData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? 'url(#barCoral)' : 'url(#barSky)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">No branches registered in system.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

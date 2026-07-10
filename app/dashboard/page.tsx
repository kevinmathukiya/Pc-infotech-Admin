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
        api.get('/products?limit=1'),
        api.get('/branches'),
        api.get('/service-requests'),
        api.get('/contact'),
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
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary-border bg-primary-slate p-6 lg:p-8">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#ff5e5b]/5 blur-3xl" />
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">System Console</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl">
          Overview of PC INFOTECH store status, active customer repairs, inventory stock, and contact inbox submissions.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cardData.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`glass-card border-l-4 ${card.color} bg-gradient-to-br ${card.bgGlow} rounded-xl p-5 flex flex-col justify-between`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{card.title}</p>
                  <p className="text-3xl font-extrabold text-foreground mt-2">{card.value}</p>
                </div>
                <div className="rounded-lg bg-primary-deep p-2.5 border border-primary-border">
                  <Icon size={20} />
                </div>
              </div>
              <div className="border-t border-primary-border mt-4 pt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium hover:text-[#ff5e5b] transition-colors">
                <Link href={card.link} className="flex items-center gap-1.5">
                  {card.label}
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Repair Tickets Status Pie Chart */}
        <div className="glass-panel border border-primary-border rounded-xl p-6 lg:col-span-1 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-[#ff5e5b]" size={18} />
            <h3 className="text-base font-bold text-foreground">Repair Tickets Status</h3>
          </div>
          <div className="flex-1 min-h-[260px] flex items-center justify-center">
            {ticketData.some((t) => t.value > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={ticketData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {ticketData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--dropdown-bg)',
                      borderColor: 'var(--primary-border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
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
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">No tickets recorded in system.</p>
            )}
          </div>
        </div>

        {/* Branches by Region Bar Chart */}
        <div className="glass-panel border border-primary-border rounded-xl p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-sky-400" size={18} />
            <h3 className="text-base font-bold text-foreground">Branches by Region</h3>
          </div>
          <div className="flex-1 min-h-[260px]">
            {branchData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={branchData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--primary-border)" />
                  <XAxis dataKey="region" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--dropdown-bg)',
                      borderColor: 'var(--primary-border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                    }}
                  />
                  <Bar dataKey="count" fill="#ff5e5b" radius={[4, 4, 0, 0]}>
                    {branchData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? '#ff5e5b' : '#38bdf8'}
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

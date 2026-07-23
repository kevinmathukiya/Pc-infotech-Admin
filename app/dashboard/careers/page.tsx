'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { Select } from '../../../components/ui';
import { Plus, Search, Edit, Trash2, Briefcase, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface Career {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experienceLevel: string;
  status: 'active' | 'inactive';
  image?: { url: string; publicId: string };
  createdAt?: string;
}

export default function CareersCatalogPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Queries
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 8;

  const fetchCareers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: '-createdAt',
      });

      if (search) query.append('search', search);
      if (statusFilter) query.append('status', statusFilter);

      const res = await api.get(`/careers/admin/all?${query.toString()}`);
      setCareers(res.data?.data?.careers || []);
      setTotal(res.data?.data?.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve careers from system.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCareers();
  };

  const toggleStatus = async (careerId: string, currentStatus: 'active' | 'inactive') => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.patch(`/careers/${careerId}/status`, { status: newStatus });
      toast.success(`Job status changed to ${newStatus}`);
      fetchCareers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to toggle status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job posting? This cannot be undone.')) return;
    try {
      await api.delete(`/careers/${id}`);
      toast.success('Job listing deleted successfully');
      fetchCareers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete job listing.');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="text-[#ff5e5b]" size={24} />
            Careers CMS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage open job positions, descriptions, requirements, and locations for applicant applications.
          </p>
        </div>
        <Link
          href="/dashboard/careers/create"
          className="btn-primary flex items-center justify-center gap-1.5 self-start glow-accent"
        >
          <Plus size={16} />
          Create Job Posting
        </Link>
      </div>

      {/* Query Filters */}
      <div className="glass-panel border border-primary-border rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by job title, department, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
          <button type="submit" className="btn-secondary px-5 flex items-center gap-1">
            <Search size={14} />
            Find
          </button>
        </form>

        <div className="w-full md:w-52">
          <Select
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Active Listings', value: 'active' },
              { label: 'Inactive Listings', value: 'inactive' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Career Table list */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-border border-t-[#ff5e5b]" />
        </div>
      ) : careers.length > 0 ? (
        <div className="glass-panel border border-primary-border rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary-border bg-primary-slate text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">Image</th>
                  <th className="py-4 px-6">Job Title</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Job Type</th>
                  <th className="py-4 px-6">Experience</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-border text-sm text-foreground">
                {careers.map((career) => (
                  <tr key={career._id} className="hover:bg-primary-card transition-colors">
                    <td className="py-4 px-6">
                      <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary-slate border border-primary-border overflow-hidden flex items-center justify-center p-0.5">
                        {career.image?.url ? (
                          <img
                            src={career.image.url}
                            alt={career.title}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <Briefcase size={16} className="text-slate-500 dark:text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold">{career.title}</td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{career.department}</td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{career.location}</td>
                    <td className="py-4 px-6 font-medium">
                      <span className="inline-flex items-center rounded-md bg-sky-500/10 px-2 py-1 text-xs font-medium text-sky-400 border border-sky-500/20">
                        {career.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{career.experienceLevel}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase ${
                        career.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {career.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => toggleStatus(career._id, career.status)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-[#ff5e5b] rounded hover:bg-primary-card transition-colors"
                          title={career.status === 'active' ? 'Hide Job Role' : 'Activate Job Role'}
                        >
                          {career.status === 'active' ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <Link
                          href={`/dashboard/careers/edit/${career._id}`}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-sky-400 rounded hover:bg-primary-card transition-colors"
                          title="Edit Job Role"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(career._id)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors"
                          title="Delete Job Role"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border border-primary-border rounded-xl bg-primary-card/30">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No careers listings found. Click "Create Job Posting" to start listing roles.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="btn-secondary px-4 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="flex items-center text-xs text-slate-450 font-semibold px-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="btn-secondary px-4 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

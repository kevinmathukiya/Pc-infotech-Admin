'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { Select } from '../../../components/ui';
import { Search, Eye, Trash2, Users, Calendar } from 'lucide-react';
import Link from 'next/link';
import StatusDropdown from '../../../components/ui/StatusDropdown';
import jobApplicationService from '../../../lib/api/jobApplicationService';

interface JobApplication {
  _id: string;
  name: string;
  email: string;
  phone: string;
  career: {
    _id: string;
    title: string;
    department: string;
  } | null;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: string;
}

export default function JobApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Queries
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 8;

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: '-createdAt',
      });

      if (search) query.append('search', search);
      if (statusFilter) query.append('status', statusFilter);

      const res = await api.get(`/job-applications?${query.toString()}`);
      setApplications(res.data?.data?.applications || []);
      setTotal(res.data?.data?.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve candidate job applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await jobApplicationService.updateApplicationStatus(id, status as any);
      toast.success('Status updated');
      fetchApplications();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update status');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job application? This action cannot be undone.')) return;
    try {
      await api.delete(`/job-applications/${id}`);
      toast.success('Job application deleted successfully');
      fetchApplications();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete application.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'reviewed':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="text-[#ff5e5b]" size={24} />
            Job Applications
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review candidate details, download resume PDF files, and update application statuses.
          </p>
        </div>
      </div>

      {/* Query Filters */}
      <div className="glass-panel border border-primary-border rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by candidate name, email, phone..."
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
              { label: 'Pending Review', value: 'pending' },
              { label: 'Reviewed Profile', value: 'reviewed' },
              { label: 'Accepted Candidates', value: 'accepted' },
              { label: 'Rejected Candidates', value: 'rejected' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table list */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-border border-t-[#ff5e5b]" />
        </div>
      ) : applications.length > 0 ? (
        <div className="glass-panel border border-primary-border rounded-xl overflow-visible shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse rounded-xl">
              <thead>
                <tr className="border-b border-primary-border bg-primary-slate text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">Candidate</th>
                  <th className="py-4 px-6">Position Applied</th>
                  <th className="py-4 px-6">Phone Number</th>
                  <th className="py-4 px-6">Submission Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-border text-sm text-foreground">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-primary-card transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold">{app.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{app.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      {app.career ? (
                        <div>
                          <div className="font-medium text-foreground">{app.career.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{app.career.department}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Deleted Job Posting</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{app.phone}</td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <StatusDropdown
                        value={app.status as any}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link
                          href={`/dashboard/job-applications/${app._id}`}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-sky-400 rounded hover:bg-primary-card transition-colors"
                          title="View Application Details"
                        >
                          <Eye size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(app._id)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors"
                          title="Delete Submission"
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
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No candidate job applications found.</p>
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

'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { Select } from '../../../components/ui';
import {
  MessageSquare,
  Check,
  X,
  Trash2,
  Star,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react';

interface Feedback {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  customerName: string;
  email?: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function FeedbacksManagementPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter queries
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 8;

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: '-createdAt',
      });

      if (statusFilter) query.append('status', statusFilter);

      const res = await api.get(`/feedbacks/admin?${query.toString()}`);
      if (res.data?.success) {
        setFeedbacks(res.data.data.feedbacks || []);
        setTotal(res.data.data.total || 0);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load feedbacks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [page, statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const res = await api.patch(`/feedbacks/${id}/status`, { status: newStatus });
      if (res.data?.success) {
        toast.success(`Feedback successfully ${newStatus}!`);
        fetchFeedbacks();
      } else {
        toast.error(res.data?.message || 'Failed to update status.');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Something went wrong.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    try {
      const res = await api.delete(`/feedbacks/${id}`);
      if (res.data?.success) {
        toast.success('Feedback deleted successfully!');
        fetchFeedbacks();
      } else {
        toast.error(res.data?.message || 'Failed to delete feedback.');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Something went wrong.');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="text-[#ff5e5b]" size={24} />
            Customer Feedbacks
          </h1>
          <p className="text-xs text-slate-450 mt-1">
            Moderate reviews and star ratings submitted by clients. Approve items to publish them on the main website.
          </p>
        </div>
        <button
          onClick={fetchFeedbacks}
          className="btn-secondary flex items-center justify-center gap-1.5 self-start text-xs font-semibold"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Query Filters */}
      <div className="glass-panel border border-slate-200 rounded-xl p-5">
        <div className="max-w-xs">
          <Select
            label="Filter Status"
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Pending Approval', value: 'pending' },
              { label: 'Approved', value: 'approved' },
              { label: 'Rejected', value: 'rejected' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Feedbacks Listing */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#ff5e5b]" />
        </div>
      ) : feedbacks.length > 0 ? (
        <div className="glass-panel border border-primary-border rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary-border bg-primary-slate text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Comment</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Submitted Date</th>
                  <th className="py-4 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-border text-sm text-foreground">
                {feedbacks.map((f) => (
                  <tr key={f._id} className="hover:bg-primary-card transition-colors">
                    {/* User Details */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{f.customerName}</div>
                      {f.email && <div className="text-[11px] text-slate-500 mt-0.5">{f.email}</div>}
                      {f.user && (
                        <div className="text-[10px] text-sky-500 font-bold mt-0.5 uppercase tracking-wide">
                          Verified Account
                        </div>
                      )}
                    </td>

                    {/* Star Rating */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={
                              star <= f.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-250 dark:text-slate-700'
                            }
                          />
                        ))}
                      </div>
                    </td>

                    {/* Comment Body */}
                    <td className="py-4 px-6 max-w-sm">
                      <p className="text-xs text-slate-600 leading-relaxed truncate-2-lines" title={f.comment}>
                        "{f.comment}"
                      </p>
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                          f.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : f.status === 'rejected'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(f.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        {f.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(f._id, 'approved')}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg border border-emerald-500/20 transition-all"
                            title="Approve Review"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {f.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(f._id, 'rejected')}
                            className="p-1.5 bg-amber-500/10 hover:bg-amber-550 text-amber-400 hover:text-white rounded-lg border border-amber-500/20 transition-all"
                            title="Reject Review"
                          >
                            <X size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(f._id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg border border-red-500/20 transition-all"
                          title="Delete Review"
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
        <div className="text-center py-16 border border-slate-200 rounded-xl bg-white">
          <p className="text-sm text-slate-500 font-medium">No reviews/feedbacks found matching criteria.</p>
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
          <span className="flex items-center text-xs text-slate-500 font-semibold px-2">
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

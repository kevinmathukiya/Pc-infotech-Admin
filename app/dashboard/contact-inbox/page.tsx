'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { Modal } from '../../../components/ui';
import { Inbox, Search, Mail, Phone, Calendar, Trash2, CheckCircle2, ChevronRight } from 'lucide-react';

interface Inquiry {
  _id: string;
  name: string;
  mobile: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
}

export default function ContactInboxPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Queries
  const [search, setSearch] = useState('');
  const [readFilter, setReadFilter] = useState(''); // 'read' | 'unread' | ''
  const [page, setPage] = useState(1);
  const limit = 8;

  // Reading Modal Control
  const [activeMessage, setActiveMessage] = useState<Inquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: '-createdAt',
      });
      if (search) query.append('search', search);
      
      // Handle read filter
      if (readFilter === 'read') query.append('isRead', 'true');
      if (readFilter === 'unread') query.append('isRead', 'false');

      const res = await api.get(`contact?${query.toString()}`);
      setInquiries(res.data?.data?.contacts || []);
      setTotal(res.data?.data?.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load inquiries inbox.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [page, readFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInquiries();
  };

  const openMessageModal = async (inquiry: Inquiry) => {
    setActiveMessage(inquiry);
    setIsModalOpen(true);

    // If message is unread, mark it as read on the backend automatically!
    if (!inquiry.isRead) {
      try {
        await api.patch(`contact/${inquiry._id}/read`);
        // Update local list state to mark it read immediately without full refresh
        setInquiries((prev) =>
          prev.map((item) => (item._id === inquiry._id ? { ...item, isRead: true } : item))
        );
      } catch (error) {
        console.error('Failed to mark message as read', error);
      }
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering open modal on parent div click!
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.delete(`contact/${id}`);
      toast.success('Inquiry deleted successfully');
      fetchInquiries();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete inquiry.');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Inbox className="text-[#ff5e5b]" size={24} />
          Contact inquiries Inbox
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review customer inquiries, query submissions, support requests, and contact submissions.
        </p>
      </div>

      {/* Query Filters */}
      <div className="glass-panel border border-primary-border rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by customer name, email, subject message..."
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
        
        {/* Toggle read/unread buttons */}
        <div className="flex gap-1.5 bg-primary-slate border border-primary-border p-1.5 rounded-lg">
          <button
            onClick={() => { setReadFilter(''); setPage(1); }}
            className={`px-4 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
              readFilter === '' ? 'bg-[#ff5e5b] text-white' : 'text-slate-500 dark:text-slate-400 hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setReadFilter('unread'); setPage(1); }}
            className={`px-4 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
              readFilter === 'unread' ? 'bg-[#ff5e5b] text-white' : 'text-slate-500 dark:text-slate-400 hover:text-foreground'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => { setReadFilter('read'); setPage(1); }}
            className={`px-4 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
              readFilter === 'read' ? 'bg-[#ff5e5b] text-white' : 'text-slate-500 dark:text-slate-400 hover:text-foreground'
            }`}
          >
            Read
          </button>
        </div>
      </div>

      {/* Inbox table list */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-border border-t-[#ff5e5b]" />
        </div>
      ) : inquiries.length > 0 ? (
        <div className="glass-panel border border-primary-border rounded-xl overflow-hidden shadow-xl">
          <div className="flex flex-col divide-y divide-primary-border">
            {inquiries.map((inq) => (
              <div
                key={inq._id}
                onClick={() => openMessageModal(inq)}
                className={`p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer hover:bg-primary-card transition-colors ${
                  !inq.isRead ? 'border-l-2 border-l-[#ff5e5b] bg-[#ff5e5b]/[0.03]' : 'border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`text-sm ${!inq.isRead ? 'text-foreground font-black' : 'text-slate-600 dark:text-slate-400 font-semibold'}`}>
                      {inq.name}
                    </span>
                    {!inq.isRead && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ff5e5b] shadow-[0_0_8px_#ff5e5b]" />
                    )}
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase flex items-center gap-1">
                      <Mail size={10} />
                      {inq.email}
                    </span>
                  </div>

                  <h3 className={`text-xs font-bold mt-2 truncate ${!inq.isRead ? 'text-foreground' : 'text-slate-500 dark:text-slate-400'}`}>
                    Subject: {inq.subject}
                  </h3>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1 leading-relaxed">
                    {inq.message}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <span className="flex items-center gap-1.5 whitespace-nowrap">
                    <Calendar size={13} />
                    {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => handleDelete(inq._id, e)}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors"
                      title="Delete Message"
                    >
                      <Trash2 size={15} />
                    </button>
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border border-primary-border rounded-xl bg-primary-card/30">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No inquiries in your inbox.</p>
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
          <span className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-semibold px-2">
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

      {/* Message View Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Message Details"
        size="md"
      >
        {activeMessage && (
          <div className="space-y-4 pt-1">
            {/* Sender cards details */}
            <div className="bg-primary-slate border border-primary-border p-4 rounded-xl space-y-2 text-xs">
              <p className="text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-400 block uppercase tracking-wider text-[10px] mb-0.5">Customer:</span>
                <span className="text-sm font-bold text-foreground">{activeMessage.name}</span>
              </p>
              
              <div className="grid gap-2 grid-cols-2 mt-2 pt-2 border-t border-primary-border">
                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Mail size={12} className="text-sky-400" />
                  {activeMessage.email}
                </p>
                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Phone size={12} className="text-emerald-400" />
                  {activeMessage.mobile}
                </p>
              </div>
            </div>

            {/* Subject */}
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-semibold block uppercase tracking-wider text-[9px] mb-1">Subject Header:</span>
              <h3 className="text-sm font-bold text-foreground">{activeMessage.subject}</h3>
            </div>

            {/* Message */}
            <div className="p-4 bg-primary-card border border-primary-border rounded-xl">
              <span className="text-[#ff5e5b] font-bold block uppercase tracking-wider text-[9px] mb-2">Message Body:</span>
              <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">{activeMessage.message}</p>
            </div>

            {/* Actions footer */}
            <div className="flex justify-end gap-3 border-t border-primary-border pt-4 mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-primary text-xs h-10 px-6 glow-accent"
              >
                Close Message
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

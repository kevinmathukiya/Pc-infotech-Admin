'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { Modal, Select } from '../../../components/ui';
import { Ticket, Search, Edit, Trash2, Calendar, Phone, Shield, User, FileText, CheckCircle, Clock, AlertTriangle, AlertOctagon, Activity } from 'lucide-react';

interface ServiceRequest {
  _id: string;
  customerName: string;
  mobileNumber: string;
  email: string;
  productName: string;
  brand: string;
  modelNumber: string;
  serialNumber: string;
  problemDescription: string;
  preferredVisitDate: string;
  address: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  engineerRemarks: string;
  createdAt?: string;
}

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Queries
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 8;

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState<ServiceRequest | null>(null);

  // Edit states
  const [status, setStatus] = useState<any>('pending');
  const [engineerRemarks, setEngineerRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: '-createdAt',
      });
      if (search) query.append('search', search);
      if (statusFilter) query.append('status', statusFilter);

      const res = await api.get(`/service-requests?${query.toString()}`);
      setRequests(res.data?.data?.requests || []);
      setTotal(res.data?.data?.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load service requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  const openEditModal = (request: ServiceRequest) => {
    setActiveRequest(request);
    setStatus(request.status);
    setEngineerRemarks(request.engineerRemarks || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;

    setIsSubmitting(true);
    try {
      await api.patch(`/service-requests/${activeRequest._id}`, {
        status,
        engineerRemarks,
      });
      toast.success('Service ticket updated successfully!');
      setIsModalOpen(false);
      fetchRequests();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this service request?')) return;
    try {
      await api.delete(`/service-requests/${id}`);
      toast.success('Service request deleted successfully');
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete request.');
    }
  };

  const getStatusBadge = (ticketStatus: string) => {
    switch (ticketStatus) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            <Clock size={10} />
            Pending
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            <Activity size={10} className="animate-pulse" />
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle size={10} />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            <AlertOctagon size={10} />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Ticket className="text-[#ff5e5b]" size={24} />
          Repair Tickets Center
        </h1>
        <p className="text-xs text-slate-450 mt-1">
          Review, manage, and assign progress states to clients requesting hardware repairs or technician visits.
        </p>
      </div>

      {/* Query Filters */}
      <div className="glass-panel border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by customer name, brand, product description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          </div>
          <button type="submit" className="btn-secondary px-5 flex items-center gap-1">
            <Search size={14} />
            Find
          </button>
        </form>
        
        <div className="w-full md:w-52">
          <Select
            options={[
              { label: 'All Tickets', value: '' },
              { label: 'Pending Only', value: 'pending' },
              { label: 'In Progress Only', value: 'in_progress' },
              { label: 'Completed Only', value: 'completed' },
              { label: 'Cancelled Only', value: 'cancelled' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Grid displays */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#ff5e5b]" />
        </div>
      ) : requests.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {requests.map((req) => (
            <div
              key={req._id}
              className="glass-card border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-[#ff5e5b]" />
                    <h3 className="text-sm font-bold text-slate-700">{req.customerName}</h3>
                  </div>
                  {getStatusBadge(req.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                  <div>
                    <span className="text-slate-550 block font-semibold">PRODUCT & BRAND</span>
                    <span className="text-slate-600 font-medium">{req.brand} - {req.productName}</span>
                  </div>
                  <div>
                    <span className="text-slate-550 block font-semibold">MODEL / SERIAL</span>
                    <span className="text-slate-350">{req.modelNumber} / <span className="font-semibold text-slate-600">{req.serialNumber}</span></span>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-white/40 border border-slate-850 text-xs">
                  <span className="text-[#ff5e5b] font-bold block mb-1">Issue Description:</span>
                  <p className="text-slate-350 leading-relaxed line-clamp-3">{req.problemDescription}</p>
                </div>

                {req.engineerRemarks && (
                  <div className="mt-3 p-3 rounded-lg bg-[#ff5e5b]/5 border border-[#ff5e5b]/10 text-xs">
                    <span className="text-sky-400 font-bold block mb-1">Engineer Remarks:</span>
                    <p className="text-slate-350 leading-relaxed">{req.engineerRemarks}</p>
                  </div>
                )}

                {/* Meta details */}
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-850 pt-4 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-sky-400" />
                    <span>{req.mobileNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-amber-400" />
                    <span>Visit: {new Date(req.preferredVisitDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions footer */}
              <div className="flex items-center justify-between border-t border-slate-850 mt-4 pt-3.5">
                <span className="text-[10px] font-semibold text-slate-550 uppercase">
                  Created: {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                </span>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(req)}
                    className="btn-secondary h-8 px-3 text-[11px] font-bold flex items-center gap-1.5"
                  >
                    <Edit size={12} />
                    Update remarks
                  </button>
                  <button
                    onClick={() => handleDelete(req._id)}
                    className="p-1.5 text-slate-450 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors"
                    title="Remove Ticket"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-slate-200 rounded-xl bg-slate-50/30">
          <p className="text-sm text-slate-500 font-medium">No service request tickets found.</p>
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
          <span className="flex items-center text-xs text-slate-400 font-semibold px-2">
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

      {/* Edit Remarks Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Repair Ticket"
        size="md"
      >
        {activeRequest && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="bg-white/40 p-4 border border-slate-850 rounded-xl space-y-1.5 text-xs">
              <p className="text-slate-400">
                <span className="font-bold text-slate-350">Customer:</span> {activeRequest.customerName}
              </p>
              <p className="text-slate-400">
                <span className="font-bold text-slate-350">Product Name:</span> {activeRequest.brand} - {activeRequest.productName}
              </p>
              <p className="text-slate-450 italic mt-2 border-t border-slate-850 pt-2">
                "{activeRequest.problemDescription}"
              </p>
            </div>

            <Select
              label="Repair Status"
              options={[
                { label: 'Pending', value: 'pending' },
                { label: 'In Progress', value: 'in_progress' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isSubmitting}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Engineer Remarks
              </label>
              <textarea
                placeholder="Write resolution details, replacement parts, or quotes..."
                value={engineerRemarks}
                onChange={(e) => setEngineerRemarks(e.target.value)}
                className="input-field min-h-[90px]"
                disabled={isSubmitting}
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary text-xs h-10"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary text-xs h-10 glow-accent"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { Select } from '../../../components/ui';
import { Plus, Search, Edit, Trash2, Wrench, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';

interface Service {
  _id: string;
  name: string;
  slug: string;
  serviceCategory: string;
  status: 'active' | 'inactive';
  image: { url: string; publicId: string };
  createdAt?: string;
}

export default function ServicesCatalogPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Queries
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 8;

  const fetchServices = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: '-createdAt',
      });

      if (search) query.append('search', search);
      if (statusFilter) query.append('status', statusFilter);

      const res = await api.get(`services?${query.toString()}`);
      setServices(res.data?.data?.services || []);
      setTotal(res.data?.data?.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve services catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchServices();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`services/${id}`);
      toast.success('Service deleted successfully');
      fetchServices();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete service.');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wrench className="text-[#ff5e5b]" size={24} />
            Services Catalog
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Publish client repair scopes (e.g. Laptop repair, Server AMC) displaying specs and FAQs.
          </p>
        </div>
        <Link
          href="/dashboard/services/create"
          className="btn-primary flex items-center justify-center gap-1.5 self-start glow-accent"
        >
          <Plus size={16} />
          Publish Service
        </Link>
      </div>

      {/* Query Filters */}
      <div className="glass-panel border border-primary-border rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search services name, category description..."
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
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Services Grid list */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-border border-t-[#ff5e5b]" />
        </div>
      ) : services.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service._id}
              className="glass-card border border-primary-border rounded-xl overflow-hidden flex flex-col justify-between"
            >
              {/* Cover image */}
              <div className="relative h-40 w-full bg-primary-slate overflow-hidden border-b border-primary-border flex items-center justify-center">
                {service.image?.url ? (
                  <img
                    src={service.image.url}
                    alt={service.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Wrench size={32} className="text-slate-500 dark:text-slate-400" />
                )}
                {/* Category label */}
                <div className="absolute top-2 left-2">
                  <span className="inline-flex rounded-lg bg-sky-500/90 px-2 py-0.5 text-[10px] font-semibold text-white tracking-wide uppercase">
                    {service.serviceCategory}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <Link href={`/dashboard/services/view/${service.slug}`} className="hover:text-sky-450 transition-colors">
                    <h3 className="text-sm font-bold text-foreground line-clamp-1 hover:text-sky-400 transition-colors">{service.name}</h3>
                  </Link>
                  <span className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    service.status === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {service.status}
                  </span>
                </div>

                <div className="border-t border-primary-border mt-4 pt-3.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {service.createdAt ? new Date(service.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                  
                  <div className="flex gap-1">
                    <Link
                      href={`/dashboard/services/view/${service.slug}`}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-400 rounded hover:bg-primary-card transition-colors"
                      title="View Details"
                    >
                      <Eye size={13} />
                    </Link>
                    <Link
                      href={`/dashboard/services/edit/${service.slug}`}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-sky-400 rounded hover:bg-primary-card transition-colors"
                      title="Edit Service"
                    >
                      <Edit size={13} />
                    </Link>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-primary-border rounded-xl bg-primary-card/30">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No services found. Click "Publish Service" to populate.</p>
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
    </div>
  );
}

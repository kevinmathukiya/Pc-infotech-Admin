'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { Modal, Input, Select } from '../../../components/ui';
import { FileUploadDropzone } from '../../../components/ui/FileUploadDropzone';
import { Plus, Search, Edit, Trash2, Award, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';

interface Brand {
  _id: string;
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'inactive';
  logo: { url: string; publicId: string };
  banner: { url: string; publicId: string };
  createdAt?: string;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Queries
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 6;

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: '-createdAt',
      });
      if (search) query.append('search', search);
      if (statusFilter) query.append('status', statusFilter);

      const res = await api.get(`/brands?${query.toString()}`);
      setBrands(res.data?.data?.brands || []);
      setTotal(res.data?.data?.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve brands catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBrands();
  };

  const openCreateModal = () => {
    setEditBrand(null);
    setName('');
    setDescription('');
    setStatus('active');
    setLogoFile(null);
    setBannerFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditBrand(brand);
    setName(brand.name);
    setDescription(brand.description);
    setStatus(brand.status);
    setLogoFile(null);
    setBannerFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      toast.error('Please enter name and description.');
      return;
    }

    if (!editBrand && (!logoFile || !bannerFile)) {
      toast.error('Both logo and banner images are required for new brands.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('status', status);
      
      if (logoFile) formData.append('logo', logoFile);
      if (bannerFile) formData.append('banner', bannerFile);

      if (editBrand) {
        await api.put(`/brands/${editBrand._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Brand updated successfully!');
      } else {
        await api.post('/brands', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Brand registered successfully!');
      }

      setIsModalOpen(false);
      fetchBrands();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Transaction failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to soft delete this brand?')) return;
    try {
      await api.delete(`/brands/${id}`);
      toast.success('Brand deleted successfully');
      fetchBrands();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete brand.');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Award className="text-[#ff5e5b]" size={24} />
            Brands Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
            Configure partner brands displayed across product catalogs and website sections.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center justify-center gap-1.5 self-start glow-accent"
        >
          <Plus size={16} />
          Add Brand
        </button>
      </div>

      {/* Query Filters */}
      <div className="glass-panel border border-primary-border rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by brand name, description..."
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
        
        <div className="w-full md:w-48">
          <Select
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Active Only', value: 'active' },
              { label: 'Inactive Only', value: 'inactive' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-border border-t-[#ff5e5b]" />
        </div>
      ) : brands.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <div
              key={brand._id}
              className="glass-card border border-primary-border rounded-xl overflow-hidden flex flex-col justify-between"
            >
              {/* Banner Area */}
              <div className="relative h-28 w-full bg-primary-deep overflow-hidden border-b border-primary-border">
                {brand.banner?.url ? (
                  <img
                    src={brand.banner.url}
                    alt={`${brand.name} Banner`}
                    className="h-full w-full object-cover opacity-60"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center" />
                )}
                {/* Logo Area Overlay */}
                <div className="absolute bottom-2 left-4 h-12 w-12 rounded-lg border border-primary-border bg-primary-slate p-1 shadow-lg flex items-center justify-center">
                  <img
                    src={brand.logo?.url}
                    alt={`${brand.name} Logo`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>

              {/* Info Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-foreground">{brand.name}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
                      brand.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {brand.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {brand.description}
                  </p>
                </div>

                <div className="border-t border-primary-border mt-4 pt-3 flex items-center justify-between text-xs text-slate-550 dark:text-slate-450">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                  
                  {/* Actions buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(brand)}
                      className="p-1.5 text-slate-550 dark:text-slate-400 hover:text-sky-400 rounded hover:bg-primary-card transition-colors"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(brand._id)}
                      className="p-1.5 text-slate-550 dark:text-slate-400 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-primary-border rounded-xl bg-primary-card/30">
          <p className="text-sm text-slate-550 font-medium">No brands found. Click "Add Brand" to register.</p>
        </div>
      )}

      {/* Pagination controls */}
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

      {/* Create / Edit Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editBrand ? 'Modify Brand Details' : 'Register Brand'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Left Column - Core Fields */}
            <div className="space-y-4">
              <Input
                label="Brand Name"
                placeholder="e.g. DELL, ASUS"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                required
              />
              
              <Select
                label="Visibility Status"
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ]}
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                disabled={isSubmitting}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-550 dark:text-slate-400">
                  Description
                </label>
                <textarea
                  placeholder="Provide a detailed brand outline..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field min-h-[110px] resize-none"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Right Column - Media dropzones */}
            <div className="space-y-4">
              {/* Logo Upload Dropzone */}
              <FileUploadDropzone
                label="Logo Image File"
                onChange={(file) => setLogoFile(file as File | null)}
                existingPreviews={editBrand?.logo?.url}
              />

              {/* Banner Upload Dropzone */}
              <FileUploadDropzone
                label="Banner Image File"
                onChange={(file) => setBannerFile(file as File | null)}
                existingPreviews={editBrand?.banner?.url}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 border-t border-primary-border pt-4 mt-6">
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
              {isSubmitting ? 'Processing...' : editBrand ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { Modal, Input, Select } from '../../../components/ui';
import { Plus, Search, Edit, Trash2, Layers, Calendar, FolderOpen, Award, Activity, AlignLeft } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'active' | 'inactive';
  brand: { _id: string; name: string } | string;
  createdAt?: string;
}

interface Brand {
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const brands = ['HP', 'Canon'];
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter query states
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 8;

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);



  const fetchCategories = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: '-createdAt',
      });
      if (search) query.append('search', search);
      if (brandFilter) query.append('brand', brandFilter);

      const res = await api.get(`categories?${query.toString()}`);
      setCategories(res.data?.data?.categories || []);
      setTotal(res.data?.data?.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve categories list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, brandFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCategories();
  };

  const openCreateModal = () => {
    setEditCategory(null);
    setName('');
    setDescription('');
    setStatus('active');
    setSelectedBrand(brands[0] || 'HP');
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditCategory(category);
    setName(category.name);
    setDescription(category.description || '');
    setStatus(category.status);
    
    const brandId = typeof category.brand === 'object' ? category.brand?._id : category.brand;
    setSelectedBrand(brandId || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedBrand) {
      toast.error('Please enter name and associate a brand.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        description,
        status,
        brand: selectedBrand,
      };

      if (editCategory) {
        await api.put(`categories/${editCategory._id}`, payload);
        toast.success('Category updated successfully!');
      } else {
        await api.post('categories', payload);
        toast.success('Category created successfully!');
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Transaction failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`categories/${id}`);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete category.');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Layers className="text-[#ff5e5b]" size={24} />
            Product Categories
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
            Group store inventory items into searchable and filterable classifications associated with specific Brands.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-premium-brand flex items-center justify-center gap-1.5 self-start text-xs font-bold"
        >
          <Plus size={16} />
          Create Category
        </button>
      </div>

      {/* Query Filters */}
      <div className="glass-card-premium rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch border border-white/5">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search category name, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 h-10 w-full"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
          <button type="submit" className="btn-secondary h-10 px-5 flex items-center gap-1.5 shrink-0">
            <Search size={14} />
            Find
          </button>
        </form>
        
        <div className="w-full md:w-52 h-10 select-wrapper">
          <Select
            options={[
              { label: 'All Brands', value: '' },
              ...brands.map((b) => ({ label: b, value: b })),
            ]}
            value={brandFilter}
            onChange={(e) => {
              setBrandFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table Data */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-border border-t-[#ff5e5b]" />
        </div>
      ) : categories.length > 0 ? (
        <div className="glass-panel border border-primary-border rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary-border bg-primary-slate text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">Category Name</th>
                  <th className="py-4 px-6">Associated Brand</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date Created</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-border text-sm text-foreground">
                {categories.map((category) => {
                  const brandName = typeof category.brand === 'object' ? category.brand?.name : category.brand || 'N/A';
                  return (
                    <tr key={category._id} className="hover:bg-primary-card transition-colors">
                      <td className="py-4 px-6 font-semibold text-foreground">{category.name}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center rounded-lg bg-sky-500/10 px-2 py-1 text-xs font-medium text-sky-400 border border-sky-500/20">
                          {brandName}
                        </span>
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate text-slate-500 dark:text-slate-400">
                        {category.description || '-'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          category.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                          {category.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                        {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(category)}
                            className="p-1.5 text-slate-550 dark:text-slate-400 hover:text-sky-400 rounded hover:bg-primary-card transition-colors"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            className="p-1.5 text-slate-550 dark:text-slate-400 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border border-primary-border rounded-xl bg-primary-card">
          <p className="text-sm text-slate-550 font-medium">No categories found. Click "Create Category" to get started.</p>
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

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editCategory ? 'Modify Category' : 'Create Category'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-4">
            <Input
              label={
                <span className="flex items-center gap-1.5 text-slate-400">
                  <FolderOpen size={13} className="text-[#ff5e5b]" />
                  Category Name
                </span>
              }
              placeholder="e.g. Laptops, Motherboards, Monitors"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="input-field border-white/5 bg-black/20 hover:border-white/10 focus:border-[#ff5e5b] focus:ring-1 focus:ring-[#ff5e5b]/20 transition-all duration-300"
              required
            />

            <Select
              label={
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Award size={13} className="text-[#ff5e5b]" />
                  Associated Brand
                </span>
              }
              options={brands.map((b) => ({ label: b, value: b }))}
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              disabled={isSubmitting}
              className="input-field border-white/5 bg-black/20 hover:border-white/10 focus:border-[#ff5e5b] focus:ring-1 focus:ring-[#ff5e5b]/20 transition-all duration-300"
              required
            />

            <Select
              label={
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Activity size={13} className="text-[#ff5e5b]" />
                  Status
                </span>
              }
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              disabled={isSubmitting}
              className="input-field border-white/5 bg-black/20 hover:border-white/10 focus:border-[#ff5e5b] focus:ring-1 focus:ring-[#ff5e5b]/20 transition-all duration-300"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <AlignLeft size={13} className="text-[#ff5e5b]" />
                Description (Optional)
              </label>
              <textarea
                placeholder="Provide a detailed category outline..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field min-h-[100px] resize-none transition-all duration-300 border-white/5 bg-black/20 hover:border-white/10 focus:border-[#ff5e5b] focus:ring-1 focus:ring-[#ff5e5b]/20"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary text-xs h-10 px-5"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-premium-brand text-xs h-10 px-6 font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : editCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

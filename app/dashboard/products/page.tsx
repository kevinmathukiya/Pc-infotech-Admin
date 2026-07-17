'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { Select } from '../../../components/ui';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ShoppingBag,
  Filter,
  Check,
  Star,
  Flame,
  FileText,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  slug: string;
  modelNumber: string;
  sku: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  brand?: 'HP' | 'Canon';
  category?: { _id: string; name: string };
  thumbnail: { url: string; publicId: string };
}

interface Brand {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function ProductsCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const brands = ['HP', 'Canon'];
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Queries
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [flagFilter, setFlagFilter] = useState(''); // 'isFeatured' | 'isNewArrival' | 'isBestSeller'
  const [page, setPage] = useState(1);
  const limit = 8;

  const fetchFilters = async () => {
    try {
      const categoriesRes = await api.get('/categories?limit=100');
      setCategories(categoriesRes.data?.data?.categories || []);
    } catch (error) {
      console.error('Failed to load filter catalogs', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: '-createdAt',
      });

      if (search) query.append('search', search);
      if (brandFilter) query.append('brand', brandFilter);
      if (categoryFilter) query.append('category', categoryFilter);
      if (statusFilter) query.append('status', statusFilter);
      
      // Handle boolean flags
      if (flagFilter) {
        query.append(flagFilter, 'true');
      }

      const res = await api.get(`products?${query.toString()}`);
      setProducts(res.data?.data?.products || []);
      setTotal(res.data?.data?.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch product inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, brandFilter, categoryFilter, statusFilter, flagFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to soft delete this product?')) return;
    try {
      await api.delete(`products/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete product.');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="text-[#ff5e5b]" size={24} />
            Products Inventory
          </h1>
          <p className="text-xs text-slate-450 mt-1">
            Browse, search, and manage individual hardware items, custom specifications, pricing, and stock details.
          </p>
        </div>
        <Link
          href="/dashboard/products/create"
          className="btn-primary flex items-center justify-center gap-1.5 self-start glow-accent"
        >
          <Plus size={16} />
          Create Product
        </Link>
      </div>

      {/* Query Filters */}
      <div className="glass-panel border border-slate-200 rounded-xl p-5 space-y-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by product name, SKU, model number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          </div>
          <button type="submit" className="btn-secondary px-5 flex items-center gap-1.5 text-xs font-semibold">
            <Search size={14} />
            Search
          </button>
        </form>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Select
            label="Filter Brand"
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

          <Select
            label="Filter Category"
            options={[
              { label: 'All Categories', value: '' },
              ...categories.map((c) => ({ label: c.name, value: c._id })),
            ]}
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          />

          <Select
            label="Status"
            options={[
              { label: 'All', value: '' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />

          <Select
            label="Special Promo Tag"
            options={[
              { label: 'None', value: '' },
              { label: 'Featured Products', value: 'isFeatured' },
              { label: 'New Arrivals', value: 'isNewArrival' },
              { label: 'Best Sellers', value: 'isBestSeller' },
            ]}
            value={flagFilter}
            onChange={(e) => {
              setFlagFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Grid or Table Display */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#ff5e5b]" />
        </div>
      ) : products.length > 0 ? (
        <div className="glass-panel border border-primary-border rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary-border bg-primary-slate text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">SKU / Model</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6">Tags</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-border text-sm text-foreground">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-primary-card transition-colors">
                    {/* Image & Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary-slate border border-primary-border overflow-hidden flex items-center justify-center p-0.5">
                          {product.thumbnail?.url ? (
                            <img
                              src={product.thumbnail.url}
                              alt={product.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <ShoppingBag size={18} className="text-slate-500 dark:text-slate-400" />
                          )}
                        </div>
                        <div className="max-w-[200px] sm:max-w-xs">
                          <Link href={`/dashboard/products/view/${product.slug}`} className="hover:text-sky-450 transition-colors">
                            <h3 className="font-semibold text-foreground truncate leading-snug hover:text-sky-400 transition-colors" title={product.name}>
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{product.brand || 'No Brand'}</span>
                            <span className="text-[9px] text-slate-500">•</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{product.category?.name || 'No Category'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* SKU & Model */}
                    <td className="py-4 px-6">
                      <div className="text-xs text-foreground font-semibold tracking-wider">{product.sku}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{product.modelNumber}</div>
                    </td>

                    {/* Pricing */}
                    <td className="py-4 px-6">
                      {product.discountPrice ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">₹{product.discountPrice}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 line-through">₹{product.price}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-foreground">₹{product.price}</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                        product.stockQuantity > 5 
                          ? 'bg-primary-card text-foreground' 
                          : product.stockQuantity > 0 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {product.stockQuantity} in stock
                      </span>
                    </td>

                    {/* Badged Flags */}
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {product.isFeatured && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-[#ff5e5b]/10 border border-[#ff5e5b]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#ff5e5b] uppercase tracking-wider">
                            <Star size={8} fill="currentColor" />
                            Feat
                          </span>
                        )}
                        {product.isNewArrival && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 text-[9px] font-bold text-sky-400 uppercase tracking-wider">
                            <Check size={8} />
                            New
                          </span>
                        )}
                        {product.isBestSeller && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                            <Flame size={8} />
                            Best
                          </span>
                        )}
                        {!product.isFeatured && !product.isNewArrival && !product.isBestSeller && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">-</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        product.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {product.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link
                          href={`/dashboard/products/view/${product.slug}`}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-400 rounded hover:bg-primary-card transition-colors"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          href={`/dashboard/products/edit/${product.slug}`}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-sky-400 rounded hover:bg-primary-card transition-colors"
                          title="Edit Product"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors"
                          title="Delete Product"
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
        <div className="text-center py-16 border border-slate-200 rounded-xl bg-slate-50/30">
          <p className="text-sm text-slate-500 font-medium">No products found. Click "Create Product" to add stock items.</p>
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

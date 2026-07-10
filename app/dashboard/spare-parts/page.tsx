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
  Wrench,
  ShoppingBag,
  Eye
} from 'lucide-react';
import Link from 'next/link';

const getCategorySlug = (cat: any, categoriesList: any[]): string => {
  if (!cat) return '';
  if (typeof cat === 'object') {
    return cat.slug || '';
  }
  const found = categoriesList.find((c) => c._id === cat);
  return found ? found.slug || '' : '';
};

const isMatchingCategory = (spareCatIdOrObj: any, prodCatIdOrObj: any, categoriesList: any[]): boolean => {
  const scSlug = getCategorySlug(spareCatIdOrObj, categoriesList).toLowerCase();
  const pcSlug = getCategorySlug(prodCatIdOrObj, categoriesList).toLowerCase();
  
  if (scSlug.includes('laptop') && pcSlug.includes('laptop')) return true;
  if (scSlug.includes('printer') && pcSlug.includes('printer')) return true;
  if (scSlug.includes('camera') && pcSlug.includes('camera')) return true;
  if (scSlug.includes('desktop') && pcSlug.includes('desktop')) return true;
  if (scSlug.includes('monitor') && pcSlug.includes('monitor')) return true;
  if (scSlug.includes('scanner') && pcSlug.includes('scanner')) return true;
  if (scSlug.includes('projector') && pcSlug.includes('projector')) return true;
  
  return scSlug === pcSlug;
};

interface SparePart {
  _id: string;
  name: string;
  slug: string;
  modelNumber: string;
  sku: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  status: 'active' | 'inactive';
  brand?: { _id: string; name: string };
  category?: { _id: string; name: string };
  product?: { _id: string; name: string; slug?: string };
  thumbnail: { url: string; publicId: string };
}

interface Brand {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
  brand?: string | { _id: string; name: string };
}

export default function SparePartsCatalogPage() {
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Queries
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 8;

  const fetchFilters = async () => {
    try {
      const [brandsRes, categoriesRes, productsRes] = await Promise.all([
        api.get('/api/v1/brands?limit=100'),
        api.get('/api/v1/categories?limit=100'),
        api.get('/api/v1/products?limit=100'),
      ]);
      setBrands(brandsRes.data?.data?.brands || []);
      setCategories(categoriesRes.data?.data?.categories || []);
      setProducts(productsRes.data?.data?.products || []);
    } catch (error) {
      console.error('Failed to load filter catalogs', error);
    }
  };

  const fetchSpareParts = async () => {
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
      if (productFilter) query.append('product', productFilter);
      if (statusFilter) query.append('status', statusFilter);

      const res = await api.get(`/api/v1/spare-parts?${query.toString()}`);
      setSpareParts(res.data?.data?.spareParts || []);
      setTotal(res.data?.data?.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch spare parts inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  // Dynamically filter categories based on brand selection
  useEffect(() => {
    if (brandFilter) {
      const filtered = categories.filter((cat) => {
        const catBrandId = typeof cat.brand === 'object' ? (cat.brand as any)?._id : cat.brand;
        return catBrandId === brandFilter;
      });
      setFilteredCategories(filtered);

      const stillValid = filtered.some((cat) => cat._id === categoryFilter);
      if (!stillValid) {
        setCategoryFilter('');
      }
    } else {
      setFilteredCategories(categories);
    }
  }, [brandFilter, categories]);

  // Dynamically filter products based on brand & category selection
  useEffect(() => {
    if (brandFilter && categoryFilter) {
      const filtered = products.filter((prod) => {
        const prodBrandId = typeof prod.brand === 'object' ? prod.brand?._id : prod.brand;
        return (
          prodBrandId === brandFilter &&
          isMatchingCategory(categoryFilter, prod.category, categories)
        );
      });
      setFilteredProducts(filtered);

      const stillValid = filtered.some((prod) => prod._id === productFilter);
      if (!stillValid) {
        setProductFilter('');
      }
    } else {
      setFilteredProducts([]);
      setProductFilter('');
    }
  }, [brandFilter, categoryFilter, products, categories]);

  useEffect(() => {
    fetchSpareParts();
  }, [page, brandFilter, categoryFilter, productFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSpareParts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this spare part?')) return;
    try {
      await api.delete(`/api/v1/spare-parts/${id}`);
      toast.success('Spare part deleted successfully');
      fetchSpareParts();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete spare part.');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="text-[#ff5e5b]" size={24} />
            Spare Parts & Accessories
          </h1>
          <p className="text-xs text-slate-450 mt-1">
            Manage replacement keyboards, laptop batteries, printer toners, color inks, and camera lenses.
          </p>
        </div>
        <Link
          href="/dashboard/spare-parts/create"
          className="btn-primary flex items-center justify-center gap-1.5 self-start glow-accent"
        >
          <Plus size={16} />
          Create Spare Part
        </Link>
      </div>

      {/* Query Filters */}
      <div className="glass-panel border border-slate-200 rounded-xl p-5 space-y-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by spare part name, SKU, model number..."
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Select
            label="Filter Brand"
            options={[
              { label: 'All Brands', value: '' },
              ...brands.map((b) => ({ label: b.name, value: b._id })),
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
              ...filteredCategories.map((c) => ({ label: c.name, value: c._id })),
            ]}
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            disabled={!brandFilter}
          />

          <Select
            label="Filter Product Model"
            options={[
              { label: 'All Product Models', value: '' },
              ...filteredProducts.map((p) => ({ label: p.name, value: p._id })),
            ]}
            value={productFilter}
            onChange={(e) => {
              setProductFilter(e.target.value);
              setPage(1);
            }}
            disabled={!brandFilter || !categoryFilter}
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
        </div>
      </div>

      {/* Grid or Table Display */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#ff5e5b]" />
        </div>
      ) : spareParts.length > 0 ? (
        <div className="glass-panel border border-primary-border rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary-border bg-primary-slate text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">Spare Part</th>
                  <th className="py-4 px-6">SKU / Model</th>
                  <th className="py-4 px-6">Parent Product</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-border text-sm text-foreground">
                {spareParts.map((part) => (
                  <tr key={part._id} className="hover:bg-primary-card transition-colors">
                    {/* Image & Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary-slate border border-primary-border overflow-hidden flex items-center justify-center p-0.5">
                          {part.thumbnail?.url ? (
                            <img
                              src={part.thumbnail.url}
                              alt={part.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <ShoppingBag size={18} className="text-slate-500 dark:text-slate-400" />
                          )}
                        </div>
                        <div className="max-w-[200px] sm:max-w-xs">
                          <Link href={`/dashboard/spare-parts/view/${part.slug}`} className="hover:text-sky-450 transition-colors">
                            <h3 className="font-semibold text-foreground truncate leading-snug hover:text-sky-400 transition-colors" title={part.name}>
                              {part.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{part.brand?.name || 'No Brand'}</span>
                            <span className="text-[9px] text-slate-500">•</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{part.category?.name || 'No Category'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* SKU & Model */}
                    <td className="py-4 px-6">
                      <div className="text-xs text-foreground font-semibold tracking-wider">{part.sku}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{part.modelNumber}</div>
                    </td>

                    {/* Parent Product */}
                    <td className="py-4 px-6">
                      {part.product && typeof part.product === 'object' ? (
                        <Link
                          href={`/dashboard/products/view/${part.product.slug || part.product._id}`}
                          className="text-xs text-sky-400 hover:underline font-semibold"
                        >
                          {part.product.name}
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">N/A</span>
                      )}
                    </td>

                    {/* Pricing */}
                    <td className="py-4 px-6">
                      {part.discountPrice ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">₹{part.discountPrice}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 line-through">₹{part.price}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-foreground">₹{part.price}</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                        part.stockQuantity > 5 
                          ? 'bg-primary-card text-foreground' 
                          : part.stockQuantity > 0 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {part.stockQuantity} in stock
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        part.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {part.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link
                          href={`/dashboard/spare-parts/view/${part.slug}`}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-400 rounded hover:bg-primary-card transition-colors"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          href={`/dashboard/spare-parts/edit/${part.slug}`}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-sky-400 rounded hover:bg-primary-card transition-colors"
                          title="Edit Spare Part"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(part._id)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors"
                          title="Delete Spare Part"
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
          <p className="text-sm text-slate-500 font-medium">No spare parts found. Click "Create Spare Part" to add items.</p>
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

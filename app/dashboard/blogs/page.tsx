'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { Select } from '../../../components/ui';
import { Plus, Search, Edit, Trash2, FileText, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  publishedDate: string;
  featuredImage: { url: string; publicId: string };
  createdAt?: string;
}

export default function BlogsCatalogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Queries
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 8;

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: '-publishedDate',
      });

      if (search) query.append('search', search);
      if (statusFilter) query.append('status', statusFilter);

      // Call the admin-specific endpoint to get drafts as well!
      const res = await api.get(`/api/v1/blogs/admin/all?${query.toString()}`);
      setBlogs(res.data?.data?.blogs || []);
      setTotal(res.data?.data?.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve blogs from system.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBlogs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await api.delete(`/api/v1/blogs/${id}`);
      toast.success('Blog post deleted successfully');
      fetchBlogs();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete blog.');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-[#ff5e5b]" size={24} />
            Blogs CMS
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Publish articles, tech guides, and updates. Configure metadata for Google SEO alignment.
          </p>
        </div>
        <Link
          href="/dashboard/blogs/create"
          className="btn-primary flex items-center justify-center gap-1.5 self-start glow-accent"
        >
          <Plus size={16} />
          Publish Post
        </Link>
      </div>

      {/* Query Filters */}
      <div className="glass-panel border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search blog post title, tags, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-505" size={16} />
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
              { label: 'Draft Only', value: 'draft' },
              { label: 'Published Only', value: 'published' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Blog grid */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#ff5e5b]" />
        </div>
      ) : blogs.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="glass-card border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between"
            >
              {/* Cover preview */}
              <div className="relative h-40 w-full bg-slate-50 overflow-hidden border-b border-slate-200 flex items-center justify-center">
                {blog.featuredImage?.url ? (
                  <img
                    src={blog.featuredImage.url}
                    alt={blog.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileText size={32} className="text-slate-700" />
                )}
                {/* Status label overlay */}
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase text-white shadow-md ${
                    blog.status === 'published' ? 'bg-emerald-500/90' : 'bg-amber-500/90'
                  }`}>
                    {blog.status}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-700 line-clamp-2 leading-relaxed" title={blog.title}>
                    {blog.title}
                  </h3>
                </div>

                <div className="border-t border-slate-850 mt-4 pt-3.5 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {blog.publishedDate ? new Date(blog.publishedDate).toLocaleDateString() : 'N/A'}
                  </span>
                  
                  <div className="flex gap-1">
                    <Link
                      href={`/dashboard/blogs/edit/${blog.slug}`}
                      className="p-1.5 text-slate-450 hover:text-sky-400 rounded hover:bg-slate-100 transition-colors"
                      title="Edit Post"
                    >
                      <Edit size={13} />
                    </Link>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="p-1.5 text-slate-450 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors"
                      title="Delete Post"
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
        <div className="text-center py-16 border border-slate-200 rounded-xl bg-slate-50/30">
          <p className="text-sm text-slate-500 font-medium">No blog posts found. Click "Publish Post" to start writing.</p>
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

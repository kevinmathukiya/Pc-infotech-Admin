'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../../../lib/api';
import { BlogForm } from '../../../../../components/BlogForm';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditBlogPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/v1/blogs/${slug}`);
        setBlog(res.data?.data?.blog || res.data?.data || res.data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to retrieve blog post.');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-[#ff5e5b]" />
        <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
          Fetching blog post records...
        </p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="space-y-4 text-center py-12">
        <p className="text-sm text-slate-400 font-medium">Blog post not found.</p>
        <Link href="/dashboard/blogs" className="btn-secondary text-xs inline-flex items-center gap-1.5">
          <ArrowLeft size={14} />
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Edit Blog Post</h1>
        <p className="text-xs text-slate-450 mt-1">
          Modify title, content body, tag list, featured images, and metadata settings.
        </p>
      </div>
      <BlogForm initialData={blog} isEditMode />
    </div>
  );
}

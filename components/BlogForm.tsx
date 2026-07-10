'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { Input, Select } from './ui';
import { FileUploadDropzone } from './ui/FileUploadDropzone';
import { RichTextEditor } from './ui/RichTextEditor';
import { FeaturesBuilder } from './ui/DynamicBuilders';
import { ArrowLeft, Save, FileText, Sparkles, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface BlogFormProps {
  initialData?: any;
  isEditMode?: boolean;
}

export const BlogForm: React.FC<BlogFormProps> = ({
  initialData,
  isEditMode = false,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Core fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [publishedDate, setPublishedDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // SEO fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);

  useEffect(() => {
    if (isEditMode && initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setStatus(initialData.status || 'draft');
      setTags(initialData.tags || []);
      
      // Format date string for HTML date input: YYYY-MM-DD
      if (initialData.publishedDate) {
        const dateObj = new Date(initialData.publishedDate);
        const formatted = dateObj.toISOString().split('T')[0];
        setPublishedDate(formatted);
      } else {
        setPublishedDate('');
      }

      // Pre-fill SEO
      if (initialData.seo) {
        setSeoTitle(initialData.seo.title || '');
        setSeoDescription(initialData.seo.description || '');
        setSeoKeywords(initialData.seo.keywords || []);
      }
    } else {
      // Default publishedDate to today
      const today = new Date().toISOString().split('T')[0];
      setPublishedDate(today);
    }
  }, [initialData, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Please enter title and content description.');
      return;
    }

    if (!isEditMode && !imageFile) {
      toast.error('A featured cover image is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('status', status);
      if (publishedDate) formData.append('publishedDate', new Date(publishedDate).toISOString());

      // Stringify lists
      formData.append('tags', JSON.stringify(tags));
      
      const seoObject = {
        title: seoTitle || undefined,
        description: seoDescription || undefined,
        keywords: seoKeywords.length > 0 ? seoKeywords : undefined,
      };
      formData.append('seo', JSON.stringify(seoObject));

      // Append image
      if (imageFile) {
        formData.append('featuredImage', imageFile);
      }

      if (isEditMode) {
        await api.put(`/api/v1/blogs/${initialData._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Blog post updated successfully!');
      } else {
        await api.post('/api/v1/blogs', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Blog post published successfully!');
      }

      router.push('/dashboard/blogs');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to submit blog form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Action Header */}
      <div className="flex items-center justify-between border-b border-primary-border pb-4">
        <Link
          href="/dashboard/blogs"
          className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-foreground transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          Back to list
        </Link>
        
        <button
          type="submit"
          className="btn-primary text-xs h-10 flex items-center gap-1.5 glow-accent"
          disabled={isSubmitting}
        >
          <Save size={15} />
          {isSubmitting ? 'Publishing...' : isEditMode ? 'Save Blog Changes' : 'Publish Blog Post'}
        </button>
      </div>

      {/* Columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Core fields left */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} className="text-[#ff5e5b]" />
              Blog Meta information
            </h3>

            <Input
              label="Blog Post Title"
              placeholder="e.g. 5 Essential Computer Maintenance Tips"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Date Published"
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                disabled={isSubmitting}
                required
              />

              <Select
                label="Status"
                options={[
                  { label: 'Draft', value: 'draft' },
                  { label: 'Published (Publicly Visible)', value: 'published' },
                ]}
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                disabled={isSubmitting}
              />
            </div>

            {/* Tags list */}
            <FeaturesBuilder
              label="Blog Post Tags / Categories"
              value={tags}
              onChange={setTags}
            />
          </div>

          {/* Full editor */}
          <div className="glass-panel border border-slate-200 rounded-xl p-5">
            <RichTextEditor
              label="Blog Body Content"
              value={description}
              onChange={setDescription}
            />
          </div>
        </div>

        {/* SEO & Cover right */}
        <div className="space-y-6">
          {/* SEO metadata */}
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-sky-400" />
              SEO Panel (Metadata)
            </h3>
            
            <Input
              label="SEO Title"
              placeholder="e.g. Read Laptop Cleaning Tips - PC Infotech"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              disabled={isSubmitting}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                SEO Description
              </label>
              <textarea
                placeholder="Write a brief metadata summary for search engine listings..."
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="input-field min-h-[90px]"
                disabled={isSubmitting}
              />
            </div>

            {/* SEO keywords */}
            <FeaturesBuilder
              label="SEO Keywords"
              value={seoKeywords}
              onChange={setSeoKeywords}
            />
          </div>

          {/* Image upload */}
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <ImageIcon size={16} className="text-amber-400" />
              Featured Cover Image
            </h3>

            <FileUploadDropzone
              label="Cover Image File"
              onChange={(file) => setImageFile(file as File | null)}
              existingPreviews={initialData?.featuredImage?.url}
            />
          </div>
        </div>
      </div>
    </form>
  );
};

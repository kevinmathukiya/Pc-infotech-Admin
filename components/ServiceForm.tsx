'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { Input, Select } from './ui';
import { FileUploadDropzone } from './ui/FileUploadDropzone';
import { RichTextEditor } from './ui/RichTextEditor';
import { FeaturesBuilder, FAQBuilder } from './ui/DynamicBuilders';
import { ArrowLeft, Save, Sparkles, FileText, Wrench } from 'lucide-react';
import Link from 'next/link';

interface ServiceFormProps {
  initialData?: any;
  isEditMode?: boolean;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  initialData,
  isEditMode = false,
}) => {
  const router = useRouter();
  const brands = ['HP', 'Canon'];
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Builders
  const [benefits, setBenefits] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [faq, setFaq] = useState<any[]>([]);

  // Files
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        setLoadingOptions(true);
        if (isEditMode && initialData) {
          setName(initialData.name || '');
          setServiceCategory(initialData.serviceCategory || '');
          setStatus(initialData.status || 'active');
          setShortDescription(initialData.shortDescription || '');
          setFullDescription(initialData.fullDescription || '');
          setMetaTitle(initialData.metaTitle || '');
          setMetaDescription(initialData.metaDescription || '');
          setBenefits(initialData.benefits || []);
          setFeatures(initialData.features || []);
          setFaq(initialData.faq || []);

          const brandId = initialData.brand;
          setSelectedBrand(brandId || '');
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load services form dependencies.');
      } finally {
        setLoadingOptions(false);
      }
    };
    loadDependencies();
  }, [initialData, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !serviceCategory.trim() || !shortDescription.trim()) {
      toast.error('Please enter name, category, and short description.');
      return;
    }

    if (!isEditMode && !imageFile) {
      toast.error('Cover image is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('serviceCategory', serviceCategory);
      if (selectedBrand) formData.append('brand', selectedBrand);
      formData.append('status', status);
      formData.append('shortDescription', shortDescription);
      formData.append('fullDescription', fullDescription);
      formData.append('metaTitle', metaTitle);
      formData.append('metaDescription', metaDescription);

      // JSON stringified lists
      formData.append('benefits', JSON.stringify(benefits));
      formData.append('features', JSON.stringify(features));
      formData.append('faq', JSON.stringify(faq));

      // Append files
      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (galleryFiles.length > 0) {
        galleryFiles.forEach((file) => {
          formData.append('gallery', file);
        });
      }

      if (isEditMode) {
        await api.put(`/api/v1/services/${initialData._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Service catalog updated successfully!');
      } else {
        await api.post('/api/v1/services', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Service catalog created successfully!');
      }

      router.push('/dashboard/services');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to submit service form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingOptions) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#ff5e5b]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Header buttons */}
      <div className="flex items-center justify-between border-b border-primary-border pb-4">
        <Link
          href="/dashboard/services"
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
          {isSubmitting ? 'Submitting...' : isEditMode ? 'Update Catalog' : 'Create Service'}
        </button>
      </div>

      {/* Grid structure */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Core fields left */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <Wrench size={16} className="text-[#ff5e5b]" />
              Service Specs
            </h3>

            <Input
              label="Service Name"
              placeholder="e.g. Laptop Chip Level Repairing"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Service Category"
                placeholder="e.g. Laptop Repair, AMC Services"
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
                disabled={isSubmitting}
                required
              />

              <Select
                label="Associated Brand (Optional)"
                options={[
                  { label: 'None', value: '' },
                  ...brands.map((b) => ({ label: b, value: b })),
                ]}
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

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
          </div>

          {/* Bullet points & FAQs */}
          <FeaturesBuilder
            label="Service Benefits Highlight"
            value={benefits}
            onChange={setBenefits}
          />

          <FeaturesBuilder
            label="Service Features Detail"
            value={features}
            onChange={setFeatures}
          />

          <FAQBuilder
            label="Collapsible FAQs Builder"
            value={faq}
            onChange={setFaq}
          />
        </div>

        {/* SEO & Media right */}
        <div className="space-y-6">
          {/* SEO details */}
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-sky-400" />
              SEO Panel (Metadata)
            </h3>
            
            <Input
              label="Meta Title"
              placeholder="e.g. Professional Laptop Repair in Gujarat"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              disabled={isSubmitting}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Meta Description
              </label>
              <textarea
                placeholder="Write a brief metadata summary for search engine listings..."
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="input-field min-h-[90px]"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Media dropzones */}
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} className="text-amber-400" />
              Service Media Uploads
            </h3>

            <FileUploadDropzone
              label="Cover Image (Single Image)"
              onChange={(file) => setImageFile(file as File | null)}
              existingPreviews={initialData?.image?.url}
            />

            <FileUploadDropzone
              label="Service Gallery (Up to 10 images)"
              multiple
              maxFiles={10}
              onChange={(files) => setGalleryFiles(files as File[])}
              existingPreviews={initialData?.gallery?.map((img: any) => img.url)}
            />
          </div>
        </div>
      </div>

      {/* Long description */}
      <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-5">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
          Service Story & Content
        </h3>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Short Description
          </label>
          <textarea
            placeholder="A brief summary describing repair scopes..."
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="input-field min-h-[90px]"
            disabled={isSubmitting}
            required
          />
        </div>

        <RichTextEditor
          label="Full Service Description"
          value={fullDescription}
          onChange={setFullDescription}
        />
      </div>
    </form>
  );
};

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { Input, Select, Checkbox } from './ui';
import { FileUploadDropzone } from './ui/FileUploadDropzone';
import { RichTextEditor } from './ui/RichTextEditor';
import { SpecificationsBuilder, FeaturesBuilder } from './ui/DynamicBuilders';
import { ArrowLeft, Save, Sparkles, FileText, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
  initialData?: any;
  isEditMode?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  isEditMode = false,
}) => {
  const router = useRouter();
  const brands = ['HP', 'Canon'];
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [warranty, setWarranty] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  
  // Dynamic lists
  const [specifications, setSpecifications] = useState<any[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  
  // Descriptions
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  
  // Promotion flags
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Files
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Load categories
  useEffect(() => {
    const loadDependencies = async () => {
      try {
        setLoadingOptions(true);
        const categoriesRes = await api.get('/categories?limit=100');
        const categoryList = categoriesRes.data?.data?.categories || [];

        setAllCategories(categoryList);

        // Pre-fill if edit mode
        if (isEditMode && initialData) {
          setName(initialData.name || '');
          setSku(initialData.sku || '');
          setModelNumber(initialData.modelNumber || '');
          setPrice(initialData.price?.toString() || '');
          setDiscountPrice(initialData.discountPrice?.toString() || '');
          setStockQuantity(initialData.stockQuantity?.toString() || '0');
          setWarranty(initialData.warranty || '');
          setStatus(initialData.status || 'active');
          setSpecifications(initialData.specifications || []);
          setFeatures(initialData.features || []);
          setShortDescription(initialData.shortDescription || '');
          setFullDescription(initialData.fullDescription || '');
          setIsFeatured(!!initialData.isFeatured);
          setIsNewArrival(!!initialData.isNewArrival);
          setIsBestSeller(!!initialData.isBestSeller);
          setMetaTitle(initialData.metaTitle || '');
          setMetaDescription(initialData.metaDescription || '');

          const brandId = initialData.brand;
          const categoryId = typeof initialData.category === 'object' ? initialData.category?._id : initialData.category;
          
          setSelectedBrand(brandId || '');
          setSelectedCategory(categoryId || '');
        } else {
          // Defaults for new product
          setSelectedBrand('HP');
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load form fields dependencies.');
      } finally {
        setLoadingOptions(false);
      }
    };
    loadDependencies();
  }, [initialData, isEditMode]);

  // Dynamically filter categories based on selected brand
  useEffect(() => {
    if (selectedBrand) {
      const filtered = allCategories.filter((cat) => {
        const catBrandId = typeof cat.brand === 'object' ? cat.brand?._id : cat.brand;
        return !catBrandId || catBrandId === selectedBrand;
      });
      setFilteredCategories(filtered);

      // Reset selected category if not in filtered list
      const stillValid = filtered.some((cat) => cat._id === selectedCategory);
      if (!stillValid) {
        setSelectedCategory(filtered[0]?._id || '');
      }
    } else {
      setFilteredCategories([]);
      setSelectedCategory('');
    }
  }, [selectedBrand, allCategories, selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !sku.trim() || !price || !selectedBrand || !selectedCategory) {
      toast.error('Please enter name, SKU, price, brand, and category.');
      return;
    }

    if (!isEditMode && imageFiles.length === 0) {
      toast.error('At least one gallery image is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('sku', sku);
      formData.append('modelNumber', modelNumber);
      formData.append('price', price);
      if (discountPrice) formData.append('discountPrice', discountPrice);
      formData.append('stockQuantity', stockQuantity);
      formData.append('warranty', warranty);
      formData.append('brand', selectedBrand);
      formData.append('category', selectedCategory);
      formData.append('status', status);
      formData.append('shortDescription', shortDescription);
      formData.append('fullDescription', fullDescription);
      formData.append('isFeatured', isFeatured.toString());
      formData.append('isNewArrival', isNewArrival.toString());
      formData.append('isBestSeller', isBestSeller.toString());
      if (metaTitle) formData.append('metaTitle', metaTitle);
      if (metaDescription) formData.append('metaDescription', metaDescription);

      // Stringify lists for backend stringToJSON preprocessors
      formData.append('specifications', JSON.stringify(specifications));
      formData.append('features', JSON.stringify(features));

      // Append files
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append('images', file);
        });
      }

      if (isEditMode) {
        await api.put(`/api/v1/products/${initialData._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated successfully!');
      } else {
        await api.post('/api/v1/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product created successfully!');
      }

      router.push('/dashboard/products');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to submit product form.');
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
      
      {/* Action Header */}
      <div className="flex items-center justify-between border-b border-primary-border pb-4">
        <Link
          href="/dashboard/products"
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
          {isSubmitting ? 'Submitting...' : isEditMode ? 'Update Inventory' : 'Create Product'}
        </button>
      </div>

      {/* Main Form Fields Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Core Data & Specifications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <ShoppingBag size={16} className="text-[#ff5e5b]" />
              Basic Product Information
            </h3>
            
            <Input
              label="Product Name"
              placeholder="e.g. Dell XPS 15 Laptop"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="SKU Code"
                placeholder="e.g. DELL-XPS15-01"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <Input
                label="Model Number"
                placeholder="e.g. XPS-9530"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Regular Price (₹)"
                type="number"
                placeholder="85000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <Input
                label="Discount Price (₹)"
                type="number"
                placeholder="79999"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                disabled={isSubmitting}
              />
              <Input
                label="Stock Quantity"
                type="number"
                placeholder="10"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Brand"
                options={brands.map((b) => ({ label: b, value: b }))}
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <Select
                label="Category (Filtered by Brand)"
                options={
                  filteredCategories.length > 0
                    ? filteredCategories.map((c) => ({ label: c.name, value: c._id }))
                    : [{ label: 'No Categories under selected Brand', value: '' }]
                }
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Warranty Period"
                placeholder="e.g. 1 Year Domestic Warranty"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                disabled={isSubmitting}
              />
              <Select
                label="Publishing Status"
                options={[
                  { label: 'Active (Visible on website)', value: 'active' },
                  { label: 'Inactive (Hidden)', value: 'inactive' },
                ]}
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Technical builders */}
          <SpecificationsBuilder
            label="Product Technical Specifications"
            value={specifications}
            onChange={setSpecifications}
          />

          <FeaturesBuilder
            label="Key Product Features Highlight"
            value={features}
            onChange={setFeatures}
          />
        </div>

        {/* Right column: Description & Media */}
        <div className="space-y-6">
          
          {/* Promotion Options */}
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-sky-400" />
              Promotion Badging
            </h3>
            
            <div className="flex flex-col gap-3">
              <Checkbox
                label="Mark as Featured Product"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                disabled={isSubmitting}
              />
              <Checkbox
                label="Mark as New Arrival"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                disabled={isSubmitting}
              />
              <Checkbox
                label="Mark as Best Seller"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-[#ff5e5b]" />
              SEO Search Metadata
            </h3>
            <Input
              label="Meta Title (SEO)"
              placeholder="e.g. Buy Dell XPS 15 Online"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-550 dark:text-slate-400">
                Meta Description (SEO)
              </label>
              <textarea
                placeholder="Brief summary of product for search engines..."
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="input-field min-h-[90px] resize-none"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Media dropzones */}
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} className="text-amber-400" />
              Product Media Uploads
            </h3>

            {/* Gallery Upload */}
            <FileUploadDropzone
              label="Gallery Images (Up to 10 images)"
              multiple
              maxFiles={10}
              onChange={(files) => setImageFiles(files as File[])}
              existingPreviews={initialData?.images?.map((img: any) => img.url)}
            />
          </div>
        </div>
      </div>

      {/* Description editors - Full width */}
      <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-5">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
          Product Story & Copywriting
        </h3>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Short Description
          </label>
          <textarea
            placeholder="A compelling single paragraph summarizing this product..."
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="input-field min-h-[90px]"
            disabled={isSubmitting}
            required
          />
        </div>

        <RichTextEditor
          label="Full Description (HTML Supported)"
          value={fullDescription}
          onChange={setFullDescription}
        />
      </div>
    </form>
  );
};

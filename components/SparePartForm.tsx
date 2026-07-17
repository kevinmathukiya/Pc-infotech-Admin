'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { sparePartAdminService } from '../lib/sparePartAdminService';
import { toast } from 'react-hot-toast';
import { Input, Select } from './ui';
import { FileUploadDropzone } from './ui/FileUploadDropzone';
import { RichTextEditor } from './ui/RichTextEditor';
import { SpecificationsBuilder, FeaturesBuilder } from './ui/DynamicBuilders';
import { ArrowLeft, Save, Sparkles, FileText, Wrench } from 'lucide-react';
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

interface SparePartFormProps {
  initialData?: any;
  isEditMode?: boolean;
}

export const SparePartForm: React.FC<SparePartFormProps> = ({
  initialData,
  isEditMode = false,
}) => {
  const router = useRouter();
  const brands = ['HP', 'Canon'];
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
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
  const [selectedProduct, setSelectedProduct] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  
  // Dynamic lists
  const [specifications, setSpecifications] = useState<any[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  
  // Descriptions
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  
  // SEO fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Files
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Load categories and products
  useEffect(() => {
    const loadDependencies = async () => {
      try {
        setLoadingOptions(true);
        const [categoriesRes, productsRes] = await Promise.all([
          api.get('categories?limit=100'),
          api.get('products?limit=100'),
        ]);

        const categoryList = categoriesRes.data?.data?.categories || [];
        const productList = productsRes.data?.data?.products || [];

        setAllCategories(categoryList);
        setProducts(productList);

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
          setMetaTitle(initialData.metaTitle || '');
          setMetaDescription(initialData.metaDescription || '');

          const brandId = initialData.brand;
          const categoryId = typeof initialData.category === 'object' ? initialData.category?._id : initialData.category;
          const productId = typeof initialData.product === 'object' ? initialData.product?._id : initialData.product;
          
          setSelectedBrand(brandId || '');
          setSelectedCategory(categoryId || '');
          setSelectedProduct(productId || '');
        } else {
          // Defaults for new spare part
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

      const initialCategoryId = typeof initialData?.category === 'object' ? initialData.category?._id : initialData?.category;
      const isInitialCategoryValid = filtered.some((cat) => cat._id === initialCategoryId);

      const stillValid = filtered.some((cat) => cat._id === selectedCategory);
      if (isEditMode && isInitialCategoryValid && selectedBrand === (typeof initialData?.brand === 'object' ? initialData.brand?._id : initialData?.brand)) {
        setSelectedCategory(initialCategoryId);
      } else if (!stillValid) {
        setSelectedCategory(filtered[0]?._id || '');
      }
    } else {
      setFilteredCategories([]);
      setSelectedCategory('');
    }
  }, [selectedBrand, allCategories, initialData, isEditMode, selectedCategory]);

  // Dynamically filter products based on selected brand and category
  useEffect(() => {
    if (selectedBrand && selectedCategory) {
      const filtered = products.filter((prod) => {
        const prodBrandId = typeof prod.brand === 'object' ? prod.brand?._id : prod.brand;
        return (
          prodBrandId === selectedBrand &&
          isMatchingCategory(selectedCategory, prod.category, allCategories)
        );
      });
      setFilteredProducts(filtered);

      const initialProductId = typeof initialData?.product === 'object' ? initialData.product?._id : initialData?.product;
      const isInitialProductValid = filtered.some((prod) => prod._id === initialProductId);

      const stillValid = filtered.some((prod) => prod._id === selectedProduct);
      if (isEditMode && isInitialProductValid && selectedBrand === (typeof initialData?.brand === 'object' ? initialData.brand?._id : initialData?.brand) && selectedCategory === (typeof initialData?.category === 'object' ? initialData.category?._id : initialData?.category)) {
        setSelectedProduct(initialProductId);
      } else if (!stillValid) {
        setSelectedProduct(filtered[0]?._id || '');
      }
    } else {
      setFilteredProducts([]);
      setSelectedProduct('');
    }
  }, [selectedBrand, selectedCategory, products, allCategories, initialData, isEditMode, selectedProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !sku.trim() || !price || !selectedBrand || !selectedCategory || !selectedProduct) {
      toast.error('Please enter name, SKU, price, brand, category, and associated product.');
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
      formData.append('compatibleModels', modelNumber);
      formData.append('price', price);
      if (discountPrice) formData.append('discountPrice', discountPrice);
      formData.append('stockQuantity', stockQuantity);
      formData.append('stock', stockQuantity);
      formData.append('warranty', warranty);
      formData.append('brand', selectedBrand);
      formData.append('category', selectedCategory);
      formData.append('product', selectedProduct);
      formData.append('status', status);
      formData.append('shortDescription', shortDescription);
      formData.append('fullDescription', fullDescription);
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
        await sparePartAdminService.updateSparePart(initialData._id, formData);
        toast.success('Spare part updated successfully!');
      } else {
        await sparePartAdminService.createSparePart(formData);
        toast.success('Spare part created successfully!');
      }

      router.push('/dashboard/spare-parts');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to submit spare part form.');
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
          href="/dashboard/spare-parts"
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
          {isSubmitting ? 'Submitting...' : isEditMode ? 'Update Inventory' : 'Create Spare Part'}
        </button>
      </div>

      {/* Main Form Fields Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Core Data & Specifications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <Wrench size={16} className="text-[#ff5e5b]" />
              Basic Spare Part Information
            </h3>
            
            <Input
              label="Spare Part Name"
              placeholder="e.g. HP Pavilion Laptop Keyboard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="SKU Code"
                placeholder="e.g. HP-SP-KB-PAV15"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <Input
                label="Model Number"
                placeholder="e.g. Pavilion 15-cs Series"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Regular Price (₹)"
                type="number"
                placeholder="1800"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <Input
                label="Discount Price (₹)"
                type="number"
                placeholder="1299"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                disabled={isSubmitting}
              />
              <Input
                label="Stock Quantity"
                type="number"
                placeholder="50"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
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
              <Select
                label="Product Model (Filtered by Category)"
                options={
                  filteredProducts.length > 0
                    ? filteredProducts.map((p) => ({ label: p.name, value: p._id }))
                    : [{ label: 'No Product Models under selected Category', value: '' }]
                }
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Warranty Period"
                placeholder="e.g. 6 Months Warranty"
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
            label="Spare Part Specifications"
            value={specifications}
            onChange={setSpecifications}
          />

          <FeaturesBuilder
            label="Key Spare Part Highlights"
            value={features}
            onChange={setFeatures}
          />
        </div>

        {/* Right column: Description & Media */}
        <div className="space-y-6">
          {/* SEO Metadata */}
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-[#ff5e5b]" />
              SEO Search Metadata
            </h3>
            <Input
              label="Meta Title (SEO)"
              placeholder="e.g. Buy HP Pavilion Laptop Keyboard online"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-555 dark:text-slate-400">
                Meta Description (SEO)
              </label>
              <textarea
                placeholder="Brief summary of spare part for search engines..."
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
              Spare Part Media Uploads
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
          Spare Part Description & Details
        </h3>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Short Description
          </label>
          <textarea
            placeholder="A compelling single paragraph summarizing this spare part..."
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

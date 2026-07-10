'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../../lib/api';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Edit, Trash2, ShoppingBag, Eye, Calendar, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function ViewProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/v1/products/${slug}`);
        const prod = res.data?.data?.product || res.data?.data || res.data;
        setProduct(prod);
        if (prod?.thumbnail?.url) {
          setActiveImage(prod.thumbnail.url);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to retrieve product details.');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to soft delete this product?')) return;
    try {
      await api.delete(`/api/v1/products/${product._id}`);
      toast.success('Product deleted successfully');
      router.push('/dashboard/products');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete product.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-[#ff5e5b]" />
        <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
          Retrieving product record...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4 text-center py-12">
        <p className="text-sm text-slate-400 font-medium">Product not found.</p>
        <Link href="/dashboard/products" className="btn-secondary text-xs inline-flex items-center gap-1.5">
          <ArrowLeft size={14} />
          Back to list
        </Link>
      </div>
    );
  }

  const brandName = typeof product.brand === 'object' ? product.brand?.name : 'No Brand';
  const categoryName = typeof product.category === 'object' ? product.category?.name : 'No Category';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Action Header */}
      <div className="flex items-center justify-between border-b border-primary-border pb-4">
        <Link
          href="/dashboard/products"
          className="flex items-center gap-1 text-slate-500 hover:text-foreground transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          Back to Products list
        </Link>
        
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/products/edit/${product.slug}`}
            className="btn-secondary text-xs h-9 px-4 flex items-center gap-1.5"
          >
            <Edit size={14} />
            Edit Product
          </Link>
          <button
            onClick={handleDelete}
            className="btn-secondary text-xs h-9 px-4 flex items-center gap-1.5 text-red-500 hover:bg-red-500/10 border-red-500/20 hover:border-red-500/30 transition-colors"
          >
            <Trash2 size={14} />
            Delete Product
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Media Preview & Tech Spec Sheet */}
        <div className="lg:col-span-1 space-y-6">
          {/* Cover & Gallery Card */}
          <div className="glass-panel border border-primary-border rounded-xl p-5 flex flex-col items-center">
            <div className="h-64 w-full bg-primary-slate border border-primary-border rounded-lg overflow-hidden flex items-center justify-center p-2">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <ShoppingBag size={48} className="text-slate-400" />
              )}
            </div>
            
            {/* Gallery Thumbs */}
            {product.images && product.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {/* Add thumbnail to gallery selection */}
                {product.thumbnail && (
                  <button
                    onClick={() => setActiveImage(product.thumbnail.url)}
                    className={`h-12 w-12 rounded border p-0.5 flex items-center justify-center bg-primary-slate ${
                      activeImage === product.thumbnail.url ? 'border-[#ff5e5b]' : 'border-primary-border'
                    }`}
                  >
                    <img src={product.thumbnail.url} alt="Cover thumb" className="max-h-full max-w-full object-contain" />
                  </button>
                )}
                {product.images.map((img: any, idx: number) => (
                  <button
                    key={img.publicId || idx}
                    onClick={() => setActiveImage(img.url)}
                    className={`h-12 w-12 rounded border p-0.5 flex items-center justify-center bg-primary-slate ${
                      activeImage === img.url ? 'border-[#ff5e5b]' : 'border-primary-border'
                    }`}
                  >
                    <img src={img.url} alt={`Thumb ${idx}`} className="max-h-full max-w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-primary-border pb-2">
                Technical Specifications
              </h3>
              <div className="divide-y divide-primary-border text-xs">
                {product.specifications.map((spec: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex justify-between gap-4">
                    <span className="text-slate-450 dark:text-slate-500">{spec.key}</span>
                    <span className="text-foreground font-semibold text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Information details, Stock, & Highlights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel border border-primary-border rounded-xl p-6 space-y-5">
            {/* Title & Brand Meta */}
            <div>
              <div className="flex flex-wrap gap-2 mb-2.5">
                <span className="inline-flex rounded bg-[#ff5e5b]/10 px-2 py-0.5 text-[9px] font-bold text-[#ff5e5b] tracking-wider uppercase border border-[#ff5e5b]/20">
                  {brandName}
                </span>
                <span className="inline-flex rounded bg-sky-500/10 px-2 py-0.5 text-[9px] font-bold text-sky-400 tracking-wider uppercase border border-sky-500/20">
                  {categoryName}
                </span>
                {product.isFeatured && (
                  <span className="inline-flex rounded bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-400 tracking-wider uppercase border border-amber-500/20">
                    Featured Product
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight leading-snug">
                {product.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                {product.shortDescription}
              </p>
            </div>

            {/* Price & Stock Stats grid */}
            <div className="grid gap-4 sm:grid-cols-3 border-t border-b border-primary-border py-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-550 dark:text-slate-500 font-semibold uppercase tracking-wider block">Price Value</span>
                <div className="flex items-baseline gap-2">
                  {product.discountPrice ? (
                    <>
                      <span className="text-lg font-bold text-foreground">₹{product.discountPrice}</span>
                      <span className="text-xs text-slate-500 line-through">₹{product.price}</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-foreground">₹{product.price}</span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-550 dark:text-slate-500 font-semibold uppercase tracking-wider block">Stock Level</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                  product.stockQuantity > 5 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : product.stockQuantity > 0 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {product.stockQuantity} items in stock
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-550 dark:text-slate-500 font-semibold uppercase tracking-wider block">Warranty Details</span>
                <span className="text-xs text-foreground font-semibold flex items-center gap-1">
                  <ShieldCheck size={14} className="text-sky-400" />
                  {product.warranty || 'No Warranty info'}
                </span>
              </div>
            </div>

            {/* Key Features */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Key Features & Highlights
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {product.features.map((feat: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 leading-normal">
                      <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sku & Model */}
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-slate-500 font-medium">
              <div>
                <span>SKU Code: </span>
                <span className="text-foreground font-semibold">{product.sku}</span>
              </div>
              <div>
                <span>Model Number: </span>
                <span className="text-foreground font-semibold">{product.modelNumber}</span>
              </div>
              <div>
                <span>Status: </span>
                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  product.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                }`}>
                  {product.status}
                </span>
              </div>
            </div>
          </div>

          {/* Full description */}
          {product.fullDescription && (
            <div className="glass-panel border border-primary-border rounded-xl p-6 space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-primary-border pb-2">
                Detailed Product Overview
              </h3>
              <div 
                className="prose dark:prose-invert max-w-none text-xs text-slate-600 dark:text-slate-450 leading-relaxed pt-1"
                dangerouslySetInnerHTML={{ __html: product.fullDescription }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

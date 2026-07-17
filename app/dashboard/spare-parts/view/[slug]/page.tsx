'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../../lib/api';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Edit, Trash2, Wrench, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ViewSparePartPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [sparePart, setSparePart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    const fetchSparePart = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/v1/spare-parts/${slug}`);
        const part = res.data?.data?.sparePart || res.data?.data || res.data;
        setSparePart(part);
        if (part?.thumbnail?.url) {
          setActiveImage(part.thumbnail.url);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to retrieve spare part details.');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchSparePart();
  }, [slug]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this spare part?')) return;
    try {
      await api.delete(`/api/v1/spare-parts/${sparePart._id}`);
      toast.success('Spare part deleted successfully');
      router.push('/dashboard/spare-parts');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete spare part.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-[#ff5e5b]" />
        <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
          Retrieving spare part record...
        </p>
      </div>
    );
  }

  if (!sparePart) {
    return (
      <div className="space-y-4 text-center py-12">
        <p className="text-sm text-slate-400 font-medium">Spare part not found.</p>
        <Link href="/dashboard/spare-parts" className="btn-secondary text-xs inline-flex items-center gap-1.5">
          <ArrowLeft size={14} />
          Back to list
        </Link>
      </div>
    );
  }

  const brandName = typeof sparePart.brand === 'object' ? sparePart.brand?.name : 'No Brand';
  const categoryName = typeof sparePart.category === 'object' ? sparePart.category?.name : 'No Category';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Action Header */}
      <div className="flex items-center justify-between border-b border-primary-border pb-4">
        <Link
          href="/dashboard/spare-parts"
          className="flex items-center gap-1 text-slate-500 hover:text-foreground transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          Back to Spare Parts list
        </Link>
        
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/spare-parts/edit/${sparePart.slug}`}
            className="btn-secondary text-xs h-9 px-4 flex items-center gap-1.5"
          >
            <Edit size={14} />
            Edit Spare Part
          </Link>
          <button
            onClick={handleDelete}
            className="btn-secondary text-xs h-9 px-4 flex items-center gap-1.5 text-red-500 hover:bg-red-500/10 border-red-500/20 hover:border-red-500/30 transition-colors"
          >
            <Trash2 size={14} />
            Delete Spare Part
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Media Preview & Specifications */}
        <div className="lg:col-span-1 space-y-6">
          {/* Cover & Gallery Card */}
          <div className="glass-panel border border-primary-border rounded-xl p-5 flex flex-col items-center">
            <div className="h-64 w-full bg-primary-slate border border-primary-border rounded-lg overflow-hidden flex items-center justify-center p-2">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={sparePart.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <Wrench size={48} className="text-slate-400" />
              )}
            </div>
            
            {/* Gallery Thumbs */}
            {sparePart.images && sparePart.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {sparePart.images.map((img: any, idx: number) => (
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

          {/* Product Association Hierarchy */}
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-primary-border pb-2">
              Product Association Hierarchy
            </h3>
            <div className="divide-y divide-primary-border text-xs">
              <div className="py-2.5 flex justify-between gap-4">
                <span className="text-slate-450 dark:text-slate-500 font-medium">Associated Brand</span>
                <span className="text-foreground font-semibold">{brandName}</span>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <span className="text-slate-450 dark:text-slate-500 font-medium">Category</span>
                <span className="text-foreground font-semibold">{categoryName}</span>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <span className="text-slate-450 dark:text-slate-500 font-medium">Parent Product Model</span>
                {sparePart.product && typeof sparePart.product === 'object' ? (
                  <Link
                    href={`/dashboard/products/view/${sparePart.product.slug || sparePart.product._id}`}
                    className="text-sky-400 hover:text-sky-350 hover:underline font-bold transition-colors"
                  >
                    {sparePart.product.name}
                  </Link>
                ) : (
                  <span className="text-slate-500 font-semibold">N/A</span>
                )}
              </div>
            </div>
          </div>

          {/* Specifications */}
          {sparePart.specifications && sparePart.specifications.length > 0 && (
            <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-primary-border pb-2">
                Part Specifications
              </h3>
              <div className="divide-y divide-primary-border text-xs">
                {sparePart.specifications.map((spec: any, idx: number) => (
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
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight leading-snug">
                {sparePart.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                {sparePart.shortDescription}
              </p>
            </div>

            {/* Price & Stock Stats grid */}
            <div className="grid gap-4 sm:grid-cols-3 border-t border-b border-primary-border py-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-550 dark:text-slate-500 font-semibold uppercase tracking-wider block">Price Value</span>
                <div className="flex items-baseline gap-2">
                  {sparePart.discountPrice ? (
                    <>
                      <span className="text-lg font-bold text-foreground">₹{sparePart.discountPrice}</span>
                      <span className="text-xs text-slate-500 line-through">₹{sparePart.price}</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-foreground">₹{sparePart.price}</span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-550 dark:text-slate-500 font-semibold uppercase tracking-wider block">Stock Level</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                  sparePart.stockQuantity > 5 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : sparePart.stockQuantity > 0 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {sparePart.stockQuantity} items in stock
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-550 dark:text-slate-500 font-semibold uppercase tracking-wider block">Warranty Details</span>
                <span className="text-xs text-foreground font-semibold flex items-center gap-1">
                  <ShieldCheck size={14} className="text-sky-400" />
                  {sparePart.warranty || 'No Warranty info'}
                </span>
              </div>
            </div>

            {/* Key Features */}
            {sparePart.features && sparePart.features.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Key Spare Part Highlights
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {sparePart.features.map((feat: string, idx: number) => (
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
                <span className="text-foreground font-semibold">{sparePart.sku}</span>
              </div>
              <div>
                <span>Model Number: </span>
                <span className="text-foreground font-semibold">{sparePart.modelNumber}</span>
              </div>
              <div>
                <span>Status: </span>
                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  sparePart.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                }`}>
                  {sparePart.status}
                </span>
              </div>
            </div>
          </div>

          {/* Full description */}
          {sparePart.fullDescription && (
            <div className="glass-panel border border-primary-border rounded-xl p-6 space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-primary-border pb-2">
                Detailed Spare Part Overview
              </h3>
              <div 
                className="prose dark:prose-invert max-w-none text-xs text-slate-600 dark:text-slate-450 leading-relaxed pt-1"
                dangerouslySetInnerHTML={{ __html: sparePart.fullDescription }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

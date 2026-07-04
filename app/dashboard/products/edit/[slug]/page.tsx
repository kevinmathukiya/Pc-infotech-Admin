'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../../../lib/api';
import { ProductForm } from '../../../../../components/ProductForm';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditProductPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data?.data?.product || res.data?.data || res.data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to retrieve product details.');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-[#ff5e5b]" />
        <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
          Loading product records...
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Edit Inventory Stock</h1>
        <p className="text-xs text-slate-450 mt-1">
          Modify hardware details, change prices, update specifications, and replace images.
        </p>
      </div>
      <ProductForm initialData={product} isEditMode />
    </div>
  );
}

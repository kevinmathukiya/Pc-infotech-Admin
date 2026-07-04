'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../../../lib/api';
import { ServiceForm } from '../../../../../components/ServiceForm';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditServicePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/services/${slug}`);
        setService(res.data?.data?.service || res.data?.data || res.data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to retrieve service catalog.');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchService();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-[#ff5e5b]" />
        <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
          Fetching service information...
        </p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="space-y-4 text-center py-12">
        <p className="text-sm text-slate-400 font-medium">Service catalog not found.</p>
        <Link href="/dashboard/services" className="btn-secondary text-xs inline-flex items-center gap-1.5">
          <ArrowLeft size={14} />
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Edit Service Scope</h1>
        <p className="text-xs text-slate-450 mt-1">
          Modify repair descriptions, bullet lists, cover pictures, and FAQ items.
        </p>
      </div>
      <ServiceForm initialData={service} isEditMode />
    </div>
  );
}

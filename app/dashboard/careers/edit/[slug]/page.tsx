'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../../../lib/api';
import { CareerForm } from '../../../../../components/CareerForm';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditCareerPage() {
  const params = useParams();
  const id = params?.slug as string;

  const [career, setCareer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCareer = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/careers/${id}`);
        setCareer(res.data?.data?.career || res.data?.data || res.data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to retrieve career listing.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCareer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-[#ff5e5b]" />
        <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
          Fetching career posting records...
        </p>
      </div>
    );
  }

  if (!career) {
    return (
      <div className="space-y-4 text-center py-12">
        <p className="text-sm text-slate-450 font-medium">Career listing not found.</p>
        <Link href="/dashboard/careers" className="btn-secondary text-xs inline-flex items-center gap-1.5">
          <ArrowLeft size={14} />
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Career Listing</h1>
        <p className="text-xs text-slate-450 mt-1">
          Modify title, location, type, experience level, salary range, description, and list of requirements/benefits.
        </p>
      </div>
      <CareerForm initialData={career} isEditMode />
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../../lib/api';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Edit, Trash2, Wrench, CheckCircle2, AlertCircle, HelpCircle, Award } from 'lucide-react';
import Link from 'next/link';

export default function ViewServicePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/v1/services/${slug}`);
        setService(res.data?.data?.service || res.data?.data || res.data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to retrieve service details.');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchService();
  }, [slug]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/api/v1/services/${service._id}`);
      toast.success('Service deleted successfully');
      router.push('/dashboard/services');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete service.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-[#ff5e5b]" />
        <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
          Retrieving service record...
        </p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="space-y-4 text-center py-12">
        <p className="text-sm text-slate-400 font-medium">Service not found.</p>
        <Link href="/dashboard/services" className="btn-secondary text-xs inline-flex items-center gap-1.5">
          <ArrowLeft size={14} />
          Back to list
        </Link>
      </div>
    );
  }

  const brandName = typeof service.brand === 'object' ? service.brand?.name : 'No Brand';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Action Header */}
      <div className="flex items-center justify-between border-b border-primary-border pb-4">
        <Link
          href="/dashboard/services"
          className="flex items-center gap-1 text-slate-500 hover:text-foreground transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          Back to Services list
        </Link>
        
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/services/edit/${service.slug}`}
            className="btn-secondary text-xs h-9 px-4 flex items-center gap-1.5"
          >
            <Edit size={14} />
            Edit Service
          </Link>
          <button
            onClick={handleDelete}
            className="btn-secondary text-xs h-9 px-4 flex items-center gap-1.5 text-red-500 hover:bg-red-500/10 border-red-500/20 hover:border-red-500/30 transition-colors"
          >
            <Trash2 size={14} />
            Delete Service
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Cover & Key Benefits */}
        <div className="lg:col-span-1 space-y-6">
          {/* Cover card */}
          <div className="glass-panel border border-primary-border rounded-xl p-5 flex flex-col items-center">
            <div className="h-48 w-full bg-primary-slate border border-primary-border rounded-lg overflow-hidden flex items-center justify-center p-0.5">
              {service.image?.url ? (
                <img
                  src={service.image.url}
                  alt={service.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Wrench size={48} className="text-slate-400" />
              )}
            </div>

            <div className="w-full mt-4 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Service Category:</span>
              <span className="inline-flex rounded-lg bg-sky-500/10 px-2 py-0.5 font-bold text-sky-400 border border-sky-500/20 uppercase tracking-wide">
                {service.serviceCategory}
              </span>
            </div>
          </div>

          {/* Benefits */}
          {service.benefits && service.benefits.length > 0 && (
            <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-primary-border pb-2 flex items-center gap-1.5">
                <Award size={15} className="text-[#ff5e5b]" />
                Service Benefits
              </h3>
              <div className="space-y-2.5 pt-1">
                {service.benefits.map((benefit: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Service Description, Features, & FAQs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel border border-primary-border rounded-xl p-6 space-y-5">
            {/* Title & Brand */}
            <div>
              <span className="inline-flex rounded bg-[#ff5e5b]/10 px-2 py-0.5 text-[9px] font-bold text-[#ff5e5b] tracking-wider uppercase border border-[#ff5e5b]/20 mb-2.5">
                {brandName} Support Service
              </span>
              <h2 className="text-xl font-bold text-foreground tracking-tight leading-snug">
                {service.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                {service.shortDescription}
              </p>
            </div>

            {/* Core Features */}
            {service.features && service.features.length > 0 && (
              <div className="border-t border-primary-border pt-4 space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle size={15} className="text-sky-400" />
                  Service Scope & Included Features
                </h3>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {service.features.map((feat: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 leading-normal">
                      <CheckCircle2 size={14} className="text-sky-400 mt-0.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status and dates info */}
            <div className="flex gap-6 text-xs text-slate-500 font-medium pt-2 border-t border-primary-border">
              <div>
                <span>Status: </span>
                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  service.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                }`}>
                  {service.status}
                </span>
              </div>
            </div>
          </div>

          {/* Full description */}
          {service.fullDescription && (
            <div className="glass-panel border border-primary-border rounded-xl p-6 space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-primary-border pb-2">
                Detailed Service Description
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed pt-1">
                {service.fullDescription}
              </p>
            </div>
          )}

          {/* FAQs Accordion */}
          {service.faq && service.faq.length > 0 && (
            <div className="glass-panel border border-primary-border rounded-xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-primary-border pb-2 flex items-center gap-1.5">
                <HelpCircle size={15} className="text-amber-500" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                {service.faq.map((item: any, idx: number) => (
                  <div key={idx} className="space-y-1.5 bg-primary-card border border-primary-border p-3.5 rounded-lg">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <span className="text-[#ff5e5b]">Q.</span>
                      {item.question}
                    </h4>
                    <p className="text-xs text-slate-550 dark:text-slate-400 leading-normal pl-4">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

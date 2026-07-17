'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { toast } from 'react-hot-toast';

import { ArrowLeft, User, Mail, Phone, Calendar, FileText, Download, Award } from 'lucide-react';
import Link from 'next/link';

export default function JobApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/job-applications/${id}`);
      setApp(res.data?.data?.application || res.data?.data || res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve application details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchApplication();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      await api.patch(`/job-applications/${id}/status`, { status: newStatus });
      toast.success(`Application status updated to ${newStatus}`);
      fetchApplication();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-[#ff5e5b]" />
        <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
          Retrieving candidate records...
        </p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="space-y-4 text-center py-12">
        <p className="text-sm text-slate-450 font-medium">Job application not found.</p>
        <Link href="/dashboard/job-applications" className="btn-secondary text-xs inline-flex items-center gap-1.5">
          <ArrowLeft size={14} />
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-primary-border pb-4">
        <Link
          href="/dashboard/job-applications"
          className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-foreground transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          Back to list
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Candidate Info and Cover Letter */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-5">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-primary-border pb-3">
              <User size={16} className="text-[#ff5e5b]" />
              Candidate Profile
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Full Name</span>
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <User size={14} className="text-slate-400" />
                  {app.name}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email Address</span>
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" />
                  <a href={`mailto:${app.email}`} className="text-sky-400 hover:underline">{app.email}</a>
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Phone Number</span>
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" />
                  <a href={`tel:${app.phone}`} className="hover:text-sky-400 transition-colors">{app.phone}</a>
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Submitted Date</span>
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  {new Date(app.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Cover Letter Section */}
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-primary-border pb-3">
              <FileText size={16} className="text-sky-400" />
              Cover Letter / Candidate Notes
            </h3>
            {app.coverLetter ? (
              <p className="text-sm leading-relaxed text-slate-650 dark:text-slate-300 whitespace-pre-wrap">
                {app.coverLetter}
              </p>
            ) : (
              <p className="text-sm text-slate-450 italic">Candidate did not submit a cover letter.</p>
            )}
          </div>
        </div>

        {/* Right Column: Resume & Application Status */}
        <div className="space-y-6">
          {/* Resume Upload Details */}
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <Award size={16} className="text-amber-400" />
              Candidate Resume
            </h3>

            <div className="rounded-xl border border-primary-border bg-primary-slate p-4 flex flex-col items-center text-center gap-3">
              <FileText size={36} className="text-slate-450 animate-bounce" />
              <div>
                <span className="text-xs text-slate-450 block font-semibold">Attachment Format</span>
                <span className="text-xs font-bold text-foreground uppercase">Document / PDF</span>
              </div>
              
              {app.resume?.url ? (
                <a
                  href={app.resume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full text-xs h-9 flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-95 transition-all mt-2"
                >
                  <Download size={14} />
                  Open / Download Resume
                </a>
              ) : (
                <span className="text-xs text-red-400 italic">No resume file attached</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

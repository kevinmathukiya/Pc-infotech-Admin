'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { Modal, Input, Select } from '../../../components/ui';
import { FileUploadDropzone } from '../../../components/ui/FileUploadDropzone';
import { MessageSquare, Plus, Edit, Trash2, Star, Calendar, User } from 'lucide-react';

interface Testimonial {
  _id: string;
  customerName: string;
  company: string;
  rating: number;
  review: string;
  status: 'active' | 'inactive';
  photo: { url: string; publicId: string };
  createdAt?: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTestimonial, setEditTestimonial] = useState<Testimonial | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [company, setCompany] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await api.get('testimonials');
      setTestimonials(res.data?.data?.testimonials || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve testimonials database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openCreateModal = () => {
    setEditTestimonial(null);
    setCustomerName('');
    setCompany('');
    setRating(5);
    setReview('');
    setStatus('active');
    setPhotoFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t: Testimonial) => {
    setEditTestimonial(t);
    setCustomerName(t.customerName);
    setCompany(t.company);
    setRating(t.rating);
    setReview(t.review);
    setStatus(t.status);
    setPhotoFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !company.trim() || !review.trim()) {
      toast.error('Please enter customer name, company, and review message.');
      return;
    }

    if (!editTestimonial && !photoFile) {
      toast.error('A customer profile photo is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('customerName', customerName);
      formData.append('company', company);
      formData.append('rating', rating.toString());
      formData.append('review', review);
      formData.append('status', status);

      if (photoFile) formData.append('photo', photoFile);

      if (editTestimonial) {
        await api.put(`testimonials/${editTestimonial._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Testimonial updated successfully!');
      } else {
        await api.post('testimonials', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Testimonial registered successfully!');
      }

      setIsModalOpen(false);
      fetchTestimonials();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Transaction failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await api.delete(`testimonials/${id}`);
      toast.success('Testimonial deleted successfully');
      fetchTestimonials();
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove testimonial.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="text-[#ff5e5b]" size={24} />
            Customer Testimonials
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Display social proof of services, customer remarks, and ratings on the public website homepage.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center justify-center gap-1.5 self-start glow-accent"
        >
          <Plus size={16} />
          Add Testimonial
        </button>
      </div>

      {/* Grid of testimonial cards */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-border border-t-[#ff5e5b]" />
        </div>
      ) : testimonials.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t._id}
              className="glass-card border border-primary-border rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  {/* Rating stars */}
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        fill={i < t.rating ? 'currentColor' : 'none'}
                        className={i < t.rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'}
                      />
                    ))}
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    t.status === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {t.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-4 leading-relaxed line-clamp-4">
                  "{t.review}"
                </p>
              </div>

              <div className="border-t border-primary-border mt-5 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full border border-primary-border overflow-hidden bg-primary-slate flex items-center justify-center">
                    {t.photo?.url ? (
                      <img src={t.photo.url} alt={t.customerName} className="h-full w-full object-cover" />
                    ) : (
                      <User size={16} className="text-slate-500 dark:text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{t.customerName}</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{t.company}</span>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(t)}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-sky-400 rounded hover:bg-primary-card transition-colors"
                    title="Edit Review"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(t._id)}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-primary-border rounded-xl bg-primary-card/30">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No testimonials found. Click "Add Testimonial" to create one.</p>
        </div>
      )}

      {/* Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editTestimonial ? 'Edit Review Details' : 'Add Customer Testimonial'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Customer Name"
              placeholder="e.g. John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <Input
              label="Company / Designation"
              placeholder="e.g. CEO, Tech Corp"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Customer Review
            </label>
            <textarea
              placeholder="Write customer review content details here..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="input-field min-h-[90px]"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Rating Slider Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Star Rating (1-5 Stars)
            </label>
            <div className="flex items-center gap-2 bg-primary-slate border border-primary-border p-2.5 rounded-lg">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full accent-[#ff5e5b] cursor-pointer"
                disabled={isSubmitting}
              />
              <span className="flex items-center gap-1 text-sm font-bold text-amber-400 w-10 justify-end">
                <Star size={14} fill="currentColor" />
                {rating}
              </span>
            </div>
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

          {/* Profile Photo dropzone */}
          <FileUploadDropzone
            label="Customer Profile Image File"
            onChange={(file) => setPhotoFile(file as File | null)}
            existingPreviews={editTestimonial?.photo?.url}
          />

          {/* Action buttons */}
          <div className="flex justify-end gap-3 border-t border-primary-border pt-4 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary text-xs h-10"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs h-10 glow-accent"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : editTestimonial ? 'Update Testimonial' : 'Register Testimonial'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

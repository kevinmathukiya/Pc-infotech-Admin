'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { Input, Select } from './ui';
import { FeaturesBuilder } from './ui/DynamicBuilders';
import { RichTextEditor } from './ui/RichTextEditor';
import { FileUploadDropzone } from './ui/FileUploadDropzone';
import { ArrowLeft, Save, Briefcase, Sparkles, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface CareerFormProps {
  initialData?: any;
  isEditMode?: boolean;
}

export const CareerForm: React.FC<CareerFormProps> = ({
  initialData,
  isEditMode = false,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pendingInputsRef = useRef<{ [key: string]: string }>({});

  // Form states
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Internship'>('Full-time');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string>('');

  useEffect(() => {
    if (isEditMode && initialData) {
      setTitle(initialData.title || '');
      setDepartment(initialData.department || '');
      setLocation(initialData.location || '');
      setType(initialData.type || 'Full-time');
      setExperienceLevel(initialData.experienceLevel || '');
      setSalaryRange(initialData.salaryRange || '');
      setDescription(initialData.description || '');
      setRequirements(initialData.requirements || []);
      setBenefits(initialData.benefits || []);
      setStatus(initialData.status || 'active');
      setExistingImage(initialData.image?.url || '');
    }
  }, [initialData, isEditMode]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingFields = [];
    if (!title.trim()) missingFields.push('Job Role Title');
    if (!department.trim()) missingFields.push('Department');
    if (!location.trim()) missingFields.push('Job Location');
    if (!experienceLevel.trim()) missingFields.push('Experience Level');
    const plainDescription = description.replace(/<[^>]*>/g, '').trim();
if (!plainDescription) missingFields.push('Job Description');

    if (missingFields.length > 0) {
      console.log('Validation failed. Missing fields:', missingFields, {
        title: title.trim(),
        department: department.trim(),
        location: location.trim(),
        experienceLevel: experienceLevel.trim(),
        description: description.trim(),
      });
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    const finalRequirements = [...requirements];
    const pendingReq = pendingInputsRef.current['requirements'];
    if (pendingReq && pendingReq.trim()) {
      finalRequirements.push(pendingReq.trim());
    }

    const finalBenefits = [...benefits];
    const pendingBenefit = pendingInputsRef.current['benefits'];
    if (pendingBenefit && pendingBenefit.trim()) {
      finalBenefits.push(pendingBenefit.trim());
    }

    if (finalRequirements.length === 0) {
      toast.error('Please add at least one job requirement.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('department', department);
      formData.append('location', location);
      formData.append('type', type);
      formData.append('experienceLevel', experienceLevel);
      if (salaryRange) {
        formData.append('salaryRange', salaryRange);
      }
      formData.append('description', description);
      formData.append('status', status);

      // Serialize arrays as JSON strings
      formData.append('requirements', JSON.stringify(finalRequirements));
      formData.append('benefits', JSON.stringify(finalBenefits));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (isEditMode) {
        await api.put(`/careers/${initialData._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Career posting updated successfully!');
      } else {
        await api.post('/careers', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Career posting created successfully!');
      }

      router.push('/dashboard/careers');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to submit career form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between border-b border-primary-border pb-4">
        <Link
          href="/dashboard/careers"
          className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-foreground transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          Back to listings
        </Link>

        <button
          type="submit"
          className="btn-primary text-xs h-10 flex items-center gap-1.5 glow-accent"
          disabled={isSubmitting}
        >
          <Save size={15} />
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Career Listing' : 'Publish Job Role'}
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Core fields left */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <Briefcase size={16} className="text-[#ff5e5b]" />
              Basic Job Information
            </h3>

            <Input
              label="Job Role Title"
              placeholder="e.g. Senior Printer Technician"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Department"
                placeholder="e.g. Technical Support / Administration"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <Input
                label="Job Location"
                placeholder="e.g. Ahmedabad, Gujarat"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Select
                label="Job Type"
                options={[
                  { label: 'Full-time', value: 'Full-time' },
                  { label: 'Part-time', value: 'Part-time' },
                  { label: 'Contract', value: 'Contract' },
                  { label: 'Internship', value: 'Internship' },
                ]}
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                disabled={isSubmitting}
                required
              />
              <Input
                label="Experience Level"
                placeholder="e.g. 2+ Years / Freshers"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <Input
                label="Salary Range (Optional)"
                placeholder="e.g. ₹20,000 - ₹30,000 / month"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

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

          {/* Job description */}
          <div className="glass-panel border border-primary-border rounded-xl p-5">
            <RichTextEditor
              label="Job Description"
              value={description}
              onChange={setDescription}
            />
          </div>
        </div>

        {/* Requirements and Benefits right */}
        <div className="space-y-6">
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-sky-400" />
              Requirements & Skills
            </h3>
            <FeaturesBuilder
              label="Job Requirements List"
              value={requirements}
              onChange={setRequirements}
              pendingKey="requirements"
              pendingInputsRef={pendingInputsRef}
            />
          </div>

          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-400" />
              Perks & Benefits (Optional)
            </h3>
            <FeaturesBuilder
              label="Benefits List"
              value={benefits}
              onChange={setBenefits}
              pendingKey="benefits"
              pendingInputsRef={pendingInputsRef}
            />
          </div>

          {/* Image upload */}
          <div className="glass-panel border border-primary-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <ImageIcon size={16} className="text-amber-400" />
              Job Cover Image
            </h3>
            <FileUploadDropzone
              label="Cover Image File"
              onChange={(file) => setImageFile(file as File | null)}
              existingPreviews={existingImage}
            />
          </div>
        </div>
      </div>
    </form>
  );
};

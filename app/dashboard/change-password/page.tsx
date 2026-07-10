'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { changePassword } from '../../../lib/auth';
import { toast } from 'react-hot-toast';
import { Input } from '../../../components/ui';
import { ShieldAlert, Key, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim() || !newPassword.trim()) {
      toast.error('All password fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Access credentials updated successfully!');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Redirect back to overview
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-primary-border pb-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-foreground transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>
      </div>

      <div className="glass-panel border border-primary-border rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-primary-border pb-4">
          <div className="p-2 rounded-lg bg-primary-deep border border-primary-border text-[#ff5e5b]">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Update Administrator Security</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Modify credentials to secure access to the admin console.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
            
            <Input
              label="New Password (At least 6 characters)"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="border-t border-primary-border pt-5 mt-6 flex justify-end">
            <button
              type="submit"
              className="btn-primary text-xs h-10 flex items-center gap-1.5 glow-accent"
              disabled={isSubmitting}
            >
              <Key size={14} />
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { resetPassword } from '../../../lib/auth';
import { Input } from '../../../components/ui';
import { Key, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const rawToken = params?.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : (rawToken || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim() || !confirmPassword.trim()) {
      toast.error('Please complete both fields.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token, password);
      toast.success('Password reset successfully. Please login with your new password.');
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Unable to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background px-4 transition-colors duration-300">
      <div className="glass-panel w-full max-w-md rounded-2xl p-8 border border-primary-border shadow-2xl relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Create a new password for your administrator account.
            </p>
          </div>
          <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-foreground">
            Back to login
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
            required
          />

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 h-11 text-base font-semibold glow-accent"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <CheckCircle size={18} />
                Reset Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

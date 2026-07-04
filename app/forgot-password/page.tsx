'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { forgotPassword } from '../../lib/auth';
import { Input } from '../../components/ui';
import { Mail, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@pcinfotech.com');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      toast.success('Password reset instructions sent to your email.');
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Unable to send reset instructions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background px-4 transition-colors duration-300">
      <div className="glass-panel w-full max-w-md rounded-2xl p-8 border border-primary-border shadow-2xl relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Forgot Password</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter your email and we will send reset instructions.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-semibold text-slate-500 hover:text-foreground"
          >
            Back to login
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@pcinfotech.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
                <Send size={18} />
                Send Reset Link
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

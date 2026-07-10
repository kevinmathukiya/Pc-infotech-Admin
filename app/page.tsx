'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    // defaultValues: { email: 'admin@yopmail.com', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success('Logged in successfully!');
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background px-4 transition-colors duration-300">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff5e5b]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="glass-panel w-full max-w-md rounded-2xl p-8 border border-primary-border shadow-2xl relative">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-border bg-primary-deep p-1 mb-4 shadow-lg">
            <img
              src="/image/pc_logo.png"
              alt="PC INFOTECH Logo"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold tracking-wide text-foreground uppercase">PC INFOTECH</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest mt-1">Admin Portal</p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mail size={13} />
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your admin email"
              {...register('email')}
              className={`input-field ${errors.email ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {errors.email && (
              <span className="text-xs text-red-400 font-medium">{errors.email.message}</span>
            )}
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Lock size={13} />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={`input-field pr-11 ${errors.password ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-red-400 font-medium">{errors.password.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2 h-11 text-base font-semibold glow-accent"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <ShieldCheck size={18} />
                Access Console
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/forgot-password"
            className="text-primary-light hover:text-primary-light/80 transition-colors font-semibold"
          >
            Forgot your password?
          </Link>
        </div>

        <div className="mt-8 text-center border-t border-primary-border pt-4">
          <p className="text-[11px] text-slate-500 font-semibold tracking-wider uppercase">
            © 2026 PC INFOTECH • SYSTEM ADMINISTRATION
          </p>
        </div>
      </div>
    </div>
  );
}

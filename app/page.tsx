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
    <div className="flex min-h-screen w-screen items-center justify-center bg-background px-4 transition-colors duration-300 relative overflow-hidden grid-overlay">
      {/* Background drifting mesh glows using brand colors */}
      <div className="absolute top-10 left-10 h-[350px] w-[350px] rounded-full bg-[#ff5e5b]/8 blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 h-[400px] w-[400px] rounded-full bg-sky-500/8 blur-[120px] pointer-events-none animate-float" />
      <div className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-emerald-500/5 blur-[90px] pointer-events-none animate-float-delayed" />
      <div className="absolute bottom-1/3 left-1/4 h-[250px] w-[250px] rounded-full bg-violet-600/5 blur-[80px] pointer-events-none animate-pulse-slow" />

      {/* Login Card */}
      <div className="glass-card-premium w-full max-w-md rounded-2xl p-8 border border-primary-border shadow-2xl relative z-10 transition-all duration-300 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-primary-border bg-primary-card p-2 mb-4">
            <img
              src="/image/pc_logo.png"
              alt="PC INFOTECH Logo"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <h2 className="text-2xl font-black tracking-wide text-foreground uppercase">PC INFOTECH</h2>
          <p className="text-[10px] text-[#ff5e5b] font-bold uppercase tracking-widest mt-1">Admin Portal</p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email input */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Mail size={12} className="text-[#ff5e5b]" />
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your admin email"
                {...register('email')}
                className={`input-field pr-4 transition-all duration-300 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <span className="text-xs text-red-500 dark:text-red-400 font-medium">{errors.email.message}</span>
            )}
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Lock size={12} className="text-[#ff5e5b]" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={`input-field pr-11 transition-all duration-300 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-red-500 dark:text-red-400 font-medium">{errors.password.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-premium-brand w-full flex items-center justify-center gap-2 mt-4 h-12 text-sm uppercase tracking-wider font-bold"
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

        <div className="mt-5 text-center">
          <Link
            href="/forgot-password"
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-[#ff5e5b] transition-colors font-semibold tracking-wide"
          >
            Forgot your password?
          </Link>
        </div>

        <div className="mt-8 text-center border-t border-primary-border pt-5">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-widest uppercase">
            © 2026 PC INFOTECH • SECURE SYSTEM MANAGEMENT
          </p>
        </div>
      </div>
    </div>
  );
}

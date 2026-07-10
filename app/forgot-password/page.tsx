'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { forgotPassword, verifyOtp, resetPassword } from '../../lib/auth';
import { Mail, Lock, Eye, EyeOff, Send, ArrowLeft, CheckCircle, KeyRound, Check, X, Shield, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');

  // OTP multi-input state
  const [otpArray, setOtpArray] = useState<string[]>(new Array(6).fill(''));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Timer states
  const [countdown, setCountdown] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  // Success screen redirection timer
  const [redirectCount, setRedirectCount] = useState(5);

  // Handle OTP resend cooldown timer
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [timerActive]);

  // Handle Success redirect timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (step === 4 && redirectCount > 0) {
      interval = setInterval(() => {
        setRedirectCount((prev) => prev - 1);
      }, 1000);
    } else if (step === 4 && redirectCount === 0) {
      router.push('/');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, redirectCount, router]);

  // Auto-focus first OTP input box when Step 2 starts
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      toast.success('A 6-digit verification code has been sent to your email.');
      setStep(2);
      setOtpArray(new Array(6).fill('')); // Reset OTP input
      setCountdown(60);
      setTimerActive(true);
    } catch (error: unknown) {
      console.error(error);
      const err = error as ApiErrorResponse;
      toast.error(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP array individual handlers
  const handleOtpChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, ''); // numeric only
    const newOtp = [...otpArray];

    if (digit.length > 0) {
      newOtp[index] = digit[digit.length - 1];
      setOtpArray(newOtp);
      // Auto-advance to next cell
      if (index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    } else {
      newOtp[index] = '';
      setOtpArray(newOtp);
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otpArray];

      if (!otpArray[index]) {
        // Current cell is empty, go backward and clear
        if (index > 0) {
          newOtp[index - 1] = '';
          setOtpArray(newOtp);
          otpRefs.current[index - 1]?.focus();
        }
      } else {
        // Current cell has a digit, clear it
        newOtp[index] = '';
        setOtpArray(newOtp);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpArray(digits);
      // Focus on the last input cell
      otpRefs.current[5]?.focus();
    } else {
      toast.error('Please paste a valid 6-digit number.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otpArray.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the full 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await verifyOtp(email, otpCode);
      // Extract token from either response.data?.data?.resetToken or response.data?.resetToken
      const token = response.data?.data?.resetToken || (response.data as { resetToken?: string })?.resetToken;
      if (!token) {
        throw new Error('Verification failed. Reset token not found.');
      }
      setResetToken(token);
      toast.success('OTP verified successfully! Create your new password.');
      setStep(3);
    } catch (error: unknown) {
      console.error(error);
      const err = error as ApiErrorResponse;
      toast.error(err.response?.data?.message || 'The verification code is invalid or has expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation checks matching criteria
    if (!password.trim() || !confirmPassword.trim()) {
      toast.error('Please complete both password fields.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/\d/.test(password)) {
      toast.error('Password must contain at least one number.');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      toast.error('Password must contain at least one special character.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(resetToken, password);
      toast.success('Password updated successfully!');
      setStep(4);
    } catch (error: unknown) {
      console.error(error);
      const err = error as ApiErrorResponse;
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password complexity criteria check helper
  const passChecks = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const strengthScore = Object.values(passChecks).filter(Boolean).length;

  const getStrengthLabel = () => {
    if (password.length === 0) return '';
    if (strengthScore <= 1) return 'Weak';
    if (strengthScore <= 3) return 'Medium';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (strengthScore <= 1) return 'bg-red-500';
    if (strengthScore <= 3) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const isButtonDisabled = isSubmitting ||
    (step === 1 && !email.trim()) ||
    (step === 2 && otpArray.join('').length !== 6) ||
    (step === 3 && (strengthScore < 4 || password !== confirmPassword));

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background px-4 transition-colors duration-300 relative">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff5e5b]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" />

      <div className="glass-panel w-full max-w-md rounded-2xl p-8 border border-primary-border shadow-2xl relative overflow-hidden transition-all duration-300">

        {/* Step Progress Tracker */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              {/* Connector line */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary-border z-0" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-accent-coral z-0 transition-all duration-500"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />

              {/* Step 1 */}
              <div className="z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step > 1
                    ? 'bg-accent-coral text-white'
                    : step === 1
                      ? 'bg-accent-coral text-white ring-4 ring-accent-soft'
                      : 'bg-primary-card text-slate-400 border border-primary-border'
                  }`}>
                  {step > 1 ? <Check size={14} /> : '1'}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 transition-colors ${step >= 1 ? 'text-accent-coral font-semibold' : 'text-slate-400'
                  }`}>Identify</span>
              </div>

              {/* Step 2 */}
              <div className="z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step > 2
                    ? 'bg-accent-coral text-white'
                    : step === 2
                      ? 'bg-accent-coral text-white ring-4 ring-accent-soft'
                      : 'bg-primary-card text-slate-400 border border-primary-border'
                  }`}>
                  {step > 2 ? <Check size={14} /> : '2'}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 transition-colors ${step >= 2 ? 'text-accent-coral font-semibold' : 'text-slate-400'
                  }`}>Verify</span>
              </div>

              {/* Step 3 */}
              <div className="z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step > 3
                    ? 'bg-accent-coral text-white'
                    : step === 3
                      ? 'bg-accent-coral text-white ring-4 ring-accent-soft'
                      : 'bg-primary-card text-slate-400 border border-primary-border'
                  }`}>
                  3
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 transition-colors ${step >= 3 ? 'text-accent-coral font-semibold' : 'text-slate-400'
                  }`}>Reset</span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Forms */}
        {step === 1 && (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Forgot Password</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enter your email to receive a 6-digit verification code.
                </p>
              </div>
              <Link
                href="/"
                className="text-xs font-semibold text-slate-550 dark:text-slate-400 hover:text-foreground transition-colors flex items-center gap-1"
              >
                <ArrowLeft size={13} />
                Login
              </Link>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-555 dark:text-slate-400 flex items-center gap-1.5">
                  <Mail size={13} />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    disabled={isSubmitting}
                    required
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2 h-11 text-base font-semibold glow-accent disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isButtonDisabled}
              >
                {isSubmitting ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Send size={18} />
                    Send Verification Code
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Verify OTP</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  We&apos;ve sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-slate-550 dark:text-slate-400 hover:text-foreground transition-colors flex items-center gap-1"
                disabled={isSubmitting}
              >
                <ArrowLeft size={13} />
                Back
              </button>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-555 dark:text-slate-400 text-center mb-1">
                  Verification Code
                </label>

                {/* 6-box input */}
                <div className="flex justify-between gap-2.5">
                  {otpArray.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      onPaste={idx === 0 ? handleOtpPaste : undefined}
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-primary-border bg-slate-50 text-foreground focus:border-accent-coral focus:ring-4 focus:ring-accent-soft outline-none transition-all shadow-sm"
                      disabled={isSubmitting}
                      required
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-500 hover:text-foreground transition-colors"
                  disabled={isSubmitting}
                >
                  Change Email
                </button>
                {timerActive ? (
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <RefreshCw size={12} className="animate-spin text-slate-500" />
                    Resend in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1.5"
                    disabled={isSubmitting}
                  >
                    <RefreshCw size={12} />
                    Resend Code
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2 h-11 text-base font-semibold glow-accent disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isButtonDisabled}
              >
                {isSubmitting ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Verify OTP Code
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">New Password</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enter your new password to update your account.
                </p>
              </div>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* New Password input */}
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-555 dark:text-slate-400 flex items-center gap-1.5">
                  <Lock size={13} />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-11"
                    disabled={isSubmitting}
                    required
                  />
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="space-y-2.5 bg-slate-100 dark:bg-primary-card/50 rounded-xl p-3 border border-primary-border">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Password Strength:</span>
                    <span className={`font-bold transition-colors ${strengthScore <= 1 ? 'text-red-500' : strengthScore <= 3 ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                      {getStrengthLabel()}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStrengthColor()} transition-all duration-300`}
                      style={{ width: `${(strengthScore / 4) * 100}%` }}
                    />
                  </div>

                  {/* Requirements List */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {passChecks.length ? (
                        <Check size={12} className="text-emerald-500 shrink-0" />
                      ) : (
                        <X size={12} className="text-red-400 shrink-0" />
                      )}
                      <span className={passChecks.length ? 'text-emerald-500 dark:text-emerald-400 font-medium' : 'text-slate-500'}>Min 6 chars</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passChecks.uppercase ? (
                        <Check size={12} className="text-emerald-500 shrink-0" />
                      ) : (
                        <X size={12} className="text-red-400 shrink-0" />
                      )}
                      <span className={passChecks.uppercase ? 'text-emerald-500 dark:text-emerald-400 font-medium' : 'text-slate-500'}>Uppercase (A-Z)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passChecks.number ? (
                        <Check size={12} className="text-emerald-500 shrink-0" />
                      ) : (
                        <X size={12} className="text-red-400 shrink-0" />
                      )}
                      <span className={passChecks.number ? 'text-emerald-500 dark:text-emerald-400 font-medium' : 'text-slate-500'}>Number (0-9)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passChecks.special ? (
                        <Check size={12} className="text-emerald-500 shrink-0" />
                      ) : (
                        <X size={12} className="text-red-400 shrink-0" />
                      )}
                      <span className={passChecks.special ? 'text-emerald-500 dark:text-emerald-400 font-medium' : 'text-slate-500'}>Special symbol</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm Password input */}
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-555 dark:text-slate-400 flex items-center gap-1.5">
                  <Lock size={13} />
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10 pr-11"
                    disabled={isSubmitting}
                    required
                  />
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <span className="text-[11px] text-red-400 font-semibold flex items-center gap-1 mt-0.5 animate-in fade-in duration-200">
                    <Shield size={11} /> Passwords do not match yet
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2 h-11 text-base font-semibold glow-accent disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isButtonDisabled}
              >
                {isSubmitting ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <KeyRound size={18} />
                    Update Password
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-6 animate-in zoom-in duration-300 flex flex-col items-center">
            {/* Animated Success Checkmark Ring */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping duration-1000 scale-125" />
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle size={44} className="text-emerald-500 animate-pulse" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-foreground">Password Reset</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-[280px] mx-auto">
              Your password has been updated securely. You can now access your console.
            </p>

            <div className="mt-8 space-y-4 w-full">
              <div className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-primary-card/50 border border-primary-border py-2 px-4 rounded-xl flex items-center justify-center gap-2">
                <RefreshCw size={12} className="animate-spin text-slate-500" />
                Redirecting to login in {redirectCount}s...
              </div>

              <button
                onClick={() => router.push('/')}
                className="btn-primary w-full flex items-center justify-center gap-2 h-11 text-base font-semibold glow-accent"
              >
                Go to Login
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

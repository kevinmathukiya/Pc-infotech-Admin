'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { updateProfile, getMe } from '../../../lib/auth';
import { toast } from 'react-hot-toast';
import { Input } from '../../../components/ui';
import { ShieldCheck, User, Mail, Calendar, Phone, Activity, Save, Shield, Key, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  
  // Profile Info Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // Sync state with latest database profile on mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const res = await getMe();
        const admin = res.data?.data?.admin;
        if (admin) {
          setName(admin.name || '');
          setEmail(admin.email || '');
          setAge(admin.age?.toString() || '');
          setMobileNumber(admin.mobileNumber || '');
        }
      } catch (error) {
        console.error('Failed to load complete profile data', error);
        // Fallback to global session details
        if (user) {
          setName(user.name || '');
          setEmail(user.email || '');
          setAge(user.age?.toString() || '');
          setMobileNumber(user.mobileNumber || '');
        }
      }
    };
    loadProfileData();
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error('Name and Email are required.');
      return;
    }

    setIsSubmittingProfile(true);
    try {
      const payload: any = {
        name,
        email,
      };

      if (age) payload.age = Number(age);
      if (mobileNumber) payload.mobileNumber = mobileNumber;

      await updateProfile(payload);
      toast.success('Administrator profile updated successfully!');
      await refreshUser();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update administrator profile.');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <User className="text-[#ff5e5b]" size={24} />
          Administrator Profile
        </h1>
        <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
          Review and update your personal details, credentials, and console privileges.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Avatar Display Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel border border-primary-border rounded-2xl p-6 text-center flex flex-col items-center justify-center relative overflow-hidden min-h-[350px]">
            {/* Ambient background glow */}
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-[#ff5e5b]/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Avatar Circle */}
            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-[#ff5e5b]/20 to-[#ff5e5b]/5 border border-[#ff5e5b]/30 flex items-center justify-center text-[#ff5e5b] shadow-xl mb-4 relative z-10">
              <User size={44} />
            </div>

            <h2 className="text-lg font-bold text-foreground truncate max-w-full relative z-10">
              {user?.name || 'Administrator'}
            </h2>
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#ff5e5b]/10 text-[#ff5e5b] border border-[#ff5e5b]/20 mt-2 relative z-10">
              <ShieldCheck size={11} />
              {user?.role === 'admin' ? 'Super Admin' : 'System Staff'}
            </span>

            <div className="w-full border-t border-primary-border my-6 pt-5 space-y-4 text-left text-xs relative z-10">
              <div className="flex items-center gap-3 text-slate-550 dark:text-slate-400">
                <div className="p-1.5 bg-slate-50 border border-primary-border rounded-lg text-[#ff5e5b] dark:bg-slate-900">
                  <Mail size={13} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">Email Address</span>
                  <span className="truncate block font-medium mt-0.5">{user?.email}</span>
                </div>
              </div>

              {user?.mobileNumber && (
                <div className="flex items-center gap-3 text-slate-550 dark:text-slate-400">
                  <div className="p-1.5 bg-slate-50 border border-primary-border rounded-lg text-sky-400 dark:bg-slate-900">
                    <Phone size={13} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">Mobile Contact</span>
                    <span className="block font-medium mt-0.5">{user.mobileNumber}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-slate-550 dark:text-slate-400">
                <div className="p-1.5 bg-slate-50 border border-primary-border rounded-lg text-emerald-400 dark:bg-slate-900">
                  <Activity size={13} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">System Privileges</span>
                  <span className="block font-medium mt-0.5 text-emerald-400">Full Database Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile & Security Shortcuts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form 1: Edit Profile Details */}
          <form onSubmit={handleProfileSubmit} className="glass-panel border border-primary-border rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-primary-border pb-3">
              <Shield size={16} className="text-[#ff5e5b]" />
              Manage Account Information
            </h3>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Full Name"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmittingProfile}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. admin@pcinfotech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmittingProfile}
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Age (Years)"
                type="number"
                placeholder="e.g. 30"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={isSubmittingProfile}
              />

              <Input
                label="Mobile Contact"
                placeholder="e.g. 9925435034"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                disabled={isSubmittingProfile}
              />
            </div>

            {/* Action Footer */}
            <div className="border-t border-primary-border pt-4 flex justify-end">
              <button
                type="submit"
                className="btn-primary text-xs h-10 px-5 flex items-center gap-1.5 glow-accent"
                disabled={isSubmittingProfile}
              >
                <Save size={15} />
                {isSubmittingProfile ? 'Updating...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>

          {/* Security Action Card */}
          <div className="glass-panel border border-primary-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-primary-border pb-3">
              <div className="p-2 rounded-lg bg-primary-deep border border-primary-border text-[#ff5e5b]">
                <Key size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
                  Console Security Credentials
                </h3>
                <p className="text-[10px] text-slate-550 dark:text-slate-400 font-medium">Protect console privileges by keeping authorization credentials updated.</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-primary-slate/30 border border-primary-border p-4 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-405 leading-relaxed max-w-md">
                To update your account password, proceed to the security credentials updater panel.
              </p>
              <Link
                href="/dashboard/change-password"
                className="btn-secondary text-xs h-9 px-4 flex items-center gap-1.5 hover:border-[#ff5e5b]/45 transition-colors shrink-0"
              >
                <span>Change Password</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

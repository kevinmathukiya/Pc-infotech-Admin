'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { updateProfile, getMe } from '../../../lib/auth';
import { toast } from 'react-hot-toast';
import { Input } from '../../../components/ui';
import { ShieldCheck, User, Mail, Calendar, Phone, Activity, Save, Shield, Key, ArrowRight, Settings } from 'lucide-react';
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

      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-primary-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2 tracking-tight">
            <Settings size={20} className="text-slate-500" />
            Account Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal profile details, login contact, and console credentials.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Minimalist Account Card */}
        <div className="lg:col-span-1">
          <div className="glass-panel border border-primary-border rounded-xl p-6 flex flex-col space-y-6 shadow-sm">
            {/* Avatar & Title Section */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg bg-primary-card border border-primary-border flex items-center justify-center text-slate-400 flex-shrink-0">
                <User size={30} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-foreground truncate">
                  {user?.name || 'Administrator'}
                </h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-primary-card border border-primary-border text-slate-500 dark:text-slate-400">
                    {user?.role === 'admin' ? 'Super Admin' : 'Staff'}
                  </span>
                </div>
              </div>
            </div>

            {/* Subtle Key-Value Details Grid */}
            <div className="border-t border-primary-border pt-5 space-y-4">
              <div className="flex items-start justify-between gap-2 text-xs">
                <span className="text-slate-450 dark:text-slate-500">Email Address</span>
                <span className="text-foreground font-medium text-right break-all">{user?.email}</span>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-450 dark:text-slate-500">Console Privileges</span>
                <span className="text-emerald-500 font-medium text-right">Full Access</span>
              </div>

              {user?.mobileNumber && (
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-450 dark:text-slate-500">Mobile Contact</span>
                  <span className="text-foreground font-medium text-right">{user.mobileNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form & Security */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <form onSubmit={handleProfileSubmit} className="glass-panel border border-primary-border rounded-xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-primary-border pb-3">
              <User size={16} className="text-slate-400" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Profile Details
              </h3>
            </div>

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
                placeholder="Enter your email"
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
                className="btn-primary text-xs h-9 px-4 flex items-center gap-1.5 shadow-sm"
                disabled={isSubmittingProfile}
              >
                <Save size={14} />
                {isSubmittingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Security Box */}
          <div className="glass-panel border border-primary-border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary-card border border-primary-border flex items-center justify-center text-slate-400">
                <Key size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Console Password
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-0.5">
                  Update your console authorization password regularly to keep the panel secure.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/change-password"
              className="btn-secondary text-xs h-9 px-4 flex items-center gap-1.5 hover:border-slate-400 transition-colors shrink-0"
            >
              <span>Change Password</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

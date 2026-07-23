'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { Modal, Input, Select } from '../../../components/ui';
import { MapPin, Plus, Edit, Trash2, Phone, Mail, Clock, Shield, Globe, Search } from 'lucide-react';

interface Branch {
  _id: string;
  name: string;
  branchType: 'head_office' | 'branch_partner';
  address: string;
  city: string;
  state: string;
  pincode: string;
  region: string;
  phoneNumber: string;
  email: string;
  googleMapUrl: string;
  workingHours: string;
  supportScope: string;
  status: 'active' | 'inactive';
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Tabs and forms
  const [regions, setRegions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('');

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [branchType, setBranchType] = useState<'head_office' | 'branch_partner'>('branch_partner');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [region, setRegion] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [googleMapUrl, setGoogleMapUrl] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [supportScope, setSupportScope] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);

      const res = await api.get(`branches?${query.toString()}`);
      const list = res.data?.data?.branches || [];
      setBranches(list);

      // Collect unique regions
      const uniqueRegions: string[] = Array.from(
        new Set(list.map((b: Branch) => b.region.toUpperCase().trim()))
      );
      setRegions(uniqueRegions);

      // Auto-selection of regions is removed as the filters now default to "All Regions".
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve branches database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBranches();
  };

  const openCreateModal = () => {
    setEditBranch(null);
    setName('');
    setBranchType('branch_partner');
    setAddress('');
    setCity('');
    setState('');
    setPincode('');
    setRegion(activeTab || 'GUJARAT REGION');
    setPhoneNumber('');
    setEmail('');
    setGoogleMapUrl('');
    setWorkingHours('9:30 AM to 6:30 PM (Mon-Sat)');
    setSupportScope('Hardware support, Laptop repair service, AMC');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditBranch(brandRef => branch);
    setName(branch.name);
    setBranchType(branch.branchType);
    setAddress(branch.address);
    setCity(branch.city);
    setState(branch.state);
    setPincode(branch.pincode);
    setRegion(branch.region);
    setPhoneNumber(branch.phoneNumber);
    setEmail(branch.email);
    setGoogleMapUrl(branch.googleMapUrl);
    setWorkingHours(branch.workingHours);
    setSupportScope(branch.supportScope);
    setStatus(branch.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !pincode.trim() || !region.trim()) {
      toast.error('Please enter branch name, address, pincode, and region.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        branchType,
        address,
        city,
        state,
        pincode,
        region: region.toUpperCase().trim(),
        phoneNumber,
        email,
        googleMapUrl,
        workingHours,
        supportScope,
        status,
      };

      if (editBranch) {
        await api.put(`branches/${editBranch._id}`, payload);
        toast.success('Branch details updated successfully!');
      } else {
        await api.post('branches', payload);
        toast.success('Branch created successfully!');
      }

      setIsModalOpen(false);
      // Re-load branches and select the region of the created/edited branch
      const targetRegion = region.toUpperCase().trim();
      setActiveTab(targetRegion);
      fetchBranches();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Transaction failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;
    try {
      await api.delete(`branches/${id}`);
      toast.success('Branch location removed');
      fetchBranches();
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove branch.');
    }
  };

  // Filter branches by region (or show all if activeTab is empty)
  const activeBranchesList = branches.filter(
    (b) => !activeTab || b.region.toUpperCase().trim() === activeTab
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="text-[#ff5e5b]" size={24} />
            Branch Locations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-405 mt-1">
            Display regional head offices and partner outlets. Geocoding coordinates are calculated automatically.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-premium-brand flex items-center justify-center gap-1.5 self-start text-xs font-bold"
        >
          <Plus size={16} />
          Add Branch
        </button>
      </div>

      {/* Query Filters */}
      <div className="glass-card-premium rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch border border-primary-border">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search branches by name, city, state, region, type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 h-10 w-full"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
          <button type="submit" className="btn-secondary h-10 px-5 flex items-center gap-1.5 shrink-0">
            <Search size={14} />
            Find
          </button>
        </form>

        <div className="w-full md:w-52 h-10 select-wrapper">
          <Select
            options={[
              { label: 'All Regions', value: '' },
              ...regions.map((reg) => ({ label: reg, value: reg })),
            ]}
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          />
        </div>
      </div>

      {/* Branch Cards list */}
      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-border border-t-[#ff5e5b]" />
        </div>
      ) : activeBranchesList.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {activeBranchesList.map((branch) => (
            <div
              key={branch._id}
              className="glass-card-premium border border-primary-border rounded-2xl p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(255,94,91,0.02)]"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-[#ff5e5b] transition-colors">{branch.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${branch.branchType === 'head_office'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                        <Shield size={10} />
                        {branch.branchType === 'head_office' ? 'Head Office' : 'Partner Branch'}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${branch.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                        {branch.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEditModal(branch)}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-sky-400 rounded-lg hover:bg-primary-card transition-all duration-200"
                      title="Edit Branch"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(branch._id)}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all duration-200"
                      title="Delete Branch"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-xs text-slate-600 dark:text-slate-400 bg-primary-card p-3 rounded-xl border border-primary-border">
                  <p className="font-semibold text-foreground/90 mb-1">Support Scope:</p>
                  <p className="leading-relaxed">{branch.supportScope}</p>
                </div>

                {/* Details layout */}
                <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={14} className="text-[#ff5e5b] mt-0.5 shrink-0" />
                    <span>{branch.address}, {branch.city}, {branch.state} - {branch.pincode}</span>
                  </div>
                  {branch.phoneNumber && (
                    <div className="flex items-center gap-2.5">
                      <Phone size={14} className="text-sky-400 shrink-0" />
                      <span>{branch.phoneNumber}</span>
                    </div>
                  )}
                  {branch.email && (
                    <div className="flex items-center gap-2.5">
                      <Mail size={14} className="text-emerald-400 shrink-0" />
                      <span>{branch.email}</span>
                    </div>
                  )}
                  {branch.workingHours && (
                    <div className="flex items-center gap-2.5">
                      <Clock size={14} className="text-amber-400 shrink-0" />
                      <span>{branch.workingHours}</span>
                    </div>
                  )}
                </div>
              </div>

              {branch.googleMapUrl && (
                <div className="border-t border-primary-border mt-5 pt-3">
                  <a
                    href={branch.googleMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-[#ff5e5b] font-semibold transition-colors"
                  >
                    <Globe size={13} />
                    Open Google Maps directions
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-primary-border rounded-xl bg-primary-card/30">
          <p className="text-sm text-slate-550 font-medium">
            {regions.length > 0 ? 'No branches registered under this region.' : 'No branch outlets configured yet.'}
          </p>
        </div>
      )}

      {/* Forms Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editBranch ? 'Edit Branch Location' : 'Add New Branch Outlet'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <MapPin size={13} className="text-[#ff5e5b]" />
                      Branch Name
                    </span>
                  }
                  placeholder="e.g. PC Infotech Surat"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <Select
                  label={
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Shield size={13} className="text-[#ff5e5b]" />
                      Branch Type
                    </span>
                  }
                  options={[
                    { label: 'Partner Outlets', value: 'branch_partner' },
                    { label: 'Head Office', value: 'head_office' },
                  ]}
                  value={branchType}
                  onChange={(e) => setBranchType(e.target.value as 'head_office' | 'branch_partner')}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Input
                    label={
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Globe size={13} className="text-[#ff5e5b]" />
                        Region
                      </span>
                    }
                    placeholder="e.g. GUJARAT REGION"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <Input
                  label={
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <MapPin size={13} className="text-[#ff5e5b]" />
                      Pincode
                    </span>
                  }
                  placeholder="395001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  maxLength={6}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Globe size={13} className="text-[#ff5e5b]" />
                      City
                    </span>
                  }
                  placeholder="e.g. Surat"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <Input
                  label={
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Globe size={13} className="text-[#ff5e5b]" />
                      State
                    </span>
                  }
                  placeholder="e.g. Gujarat"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#ff5e5b]" />
                  Address Description
                </label>
                <textarea
                  placeholder="Full shop/office address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field min-h-[85px] resize-none"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Phone size={13} className="text-[#ff5e5b]" />
                      Contact Phone
                    </span>
                  }
                  placeholder="+91 9999999999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <Input
                  label={
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Mail size={13} className="text-[#ff5e5b]" />
                      Contact Email
                    </span>
                  }
                  type="email"
                  placeholder="surat@pcinfotech.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <Input
                label={
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Clock size={13} className="text-[#ff5e5b]" />
                    Working Hours Summary
                  </span>
                }
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                disabled={isSubmitting}
                required
              />

              <Input
                label={
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Globe size={13} className="text-[#ff5e5b]" />
                    Google Maps Direct Link
                  </span>
                }
                placeholder="https://maps.google.com/?cid=..."
                value={googleMapUrl}
                onChange={(e) => setGoogleMapUrl(e.target.value)}
                disabled={isSubmitting}
                required
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Input
                    label={
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Shield size={13} className="text-[#ff5e5b]" />
                        Support Scope Summary
                      </span>
                    }
                    placeholder="e.g. AMC, Computer assembly"
                    value={supportScope}
                    onChange={(e) => setSupportScope(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <Select
                  label={
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Shield size={13} className="text-[#ff5e5b]" />
                      Status
                    </span>
                  }
                  options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                  ]}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 border-t border-primary-border pt-4 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary text-xs h-10 px-5"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-premium-brand text-xs h-10 px-6 font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : editBranch ? 'Update Outlet' : 'Add Outlet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

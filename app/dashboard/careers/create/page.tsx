'use client';

import React from 'react';
import { CareerForm } from '../../../../components/CareerForm';

export default function CreateCareerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Publish New Job Role</h1>
        <p className="text-xs text-slate-450 mt-1">
          Specify listing details, experience requirements, salary ranges, location, and technical skill requirements.
        </p>
      </div>

      <div className="glass-panel border border-slate-200 rounded-xl p-6">
        <CareerForm />
      </div>
    </div>
  );
}

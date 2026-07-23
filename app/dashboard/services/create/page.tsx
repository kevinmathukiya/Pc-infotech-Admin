'use client';

import React from 'react';
import { ServiceForm } from '../../../../components/ServiceForm';

export default function CreateServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Publish New Service Scope</h1>
        <p className="text-xs text-slate-450 mt-1">
          Specify repair descriptions, benefits bullet points, cover media, and FAQ accordions.
        </p>
      </div>
      <ServiceForm />
    </div>
  );
}

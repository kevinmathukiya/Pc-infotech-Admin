'use client';

import React from 'react';
import { SparePartForm } from '../../../../components/SparePartForm';

export default function CreateSparePartPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Add New Spare Part / Accessory</h1>
        <p className="text-xs text-slate-450 mt-1">
          Add replacement components, keyboards, batteries, toner cartridges, and original brand accessories.
        </p>
      </div>
      <SparePartForm />
    </div>
  );
}

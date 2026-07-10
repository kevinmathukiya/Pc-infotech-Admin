'use client';

import React from 'react';
import { ProductForm } from '../../../../components/ProductForm';

export default function CreateProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Add New Inventory Stock</h1>
        <p className="text-xs text-slate-450 mt-1">
          Add hardware components, describe details, specify specs, and upload media.
        </p>
      </div>
      <ProductForm />
    </div>
  );
}

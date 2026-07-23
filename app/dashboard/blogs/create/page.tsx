'use client';

import React from 'react';
import { BlogForm } from '../../../../components/BlogForm';

export default function CreateBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Publish New Blog Post</h1>
        <p className="text-xs text-slate-450 mt-1">
          Compose updates, share tech guides, customize tags, and add cover images.
        </p>
      </div>
      <BlogForm />
    </div>
  );
}

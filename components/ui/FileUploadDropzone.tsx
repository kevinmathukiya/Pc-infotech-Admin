'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, X, Image as ImageIcon } from 'lucide-react';

interface FileUploadDropzoneProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  onChange: (files: File | File[] | null) => void;
  existingPreviews?: string | string[];
}

export const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({
  label,
  accept = 'image/*',
  multiple = false,
  maxFiles = 10,
  onChange,
  existingPreviews = '',
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingList, setExistingList] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize existing previews from backend
  useEffect(() => {
    if (existingPreviews) {
      if (Array.isArray(existingPreviews)) {
        setExistingList(existingPreviews);
      } else {
        setExistingList([existingPreviews]);
      }
    } else {
      setExistingList([]);
    }
  }, [existingPreviews]);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Validate file type
    const isPdfOnly = accept.includes('pdf');
    const validFiles = fileArray.filter((file) => {
      if (isPdfOnly) return file.type === 'application/pdf';
      return file.type.startsWith('image/');
    });

    if (multiple) {
      const updatedFiles = [...selectedFiles, ...validFiles].slice(0, maxFiles);
      setSelectedFiles(updatedFiles);
      
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews].slice(0, maxFiles));
      
      onChange(updatedFiles);
    } else {
      const singleFile = validFiles[0] || null;
      setSelectedFiles(singleFile ? [singleFile] : []);
      
      // Revoke old single preview
      previews.forEach((url) => URL.revokeObjectURL(url));
      setPreviews(singleFile ? [URL.createObjectURL(singleFile)] : []);
      
      onChange(singleFile);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);

    // Revoke and remove preview URL
    URL.revokeObjectURL(previews[index]);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);

    onChange(multiple ? updatedFiles : null);
  };

  const removeExisting = (index: number) => {
    const updated = existingList.filter((_, i) => i !== index);
    setExistingList(updated);
  };

  const isPdf = accept.includes('pdf');
  const hasSinglePreview = !multiple && (existingList.length > 0 || previews.length > 0);
  const activePreviewUrl = previews[0] || existingList[0];

  return (
    <div className="w-full flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </span>

      {/* Inline Single File Preview (Premium SaaS Style) */}
      {hasSinglePreview ? (
        <div className="relative flex h-[110px] w-full items-center justify-center rounded-xl border border-primary-border bg-primary-deep overflow-hidden group">
          {isPdf ? (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <FileText size={32} className="text-[#ff5e5b] mb-1" />
              <span className="text-xs font-semibold text-foreground truncate max-w-xs">
                {selectedFiles[0]?.name || 'Existing Document (PDF)'}
              </span>
            </div>
          ) : (
            <img
              src={activePreviewUrl}
              alt="Uploaded Preview"
              className="h-full w-full object-contain p-2"
            />
          )}

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={triggerInput}
              className="px-3 py-1.5 rounded-lg bg-white text-slate-800 text-xs font-bold hover:bg-slate-100 transition-colors shadow"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (previews.length > 0) {
                  removeSelectedFile(0);
                } else {
                  removeExisting(0);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-650 transition-colors shadow"
            >
              Remove
            </button>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={accept}
            className="hidden"
          />
        </div>
      ) : (
        /* Drag & Drop Container */
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={triggerInput}
          className={`flex min-h-[110px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all p-4 ${
            isDragActive
              ? 'border-[#ff5e5b] bg-[#ff5e5b]/5'
              : 'border-primary-border bg-primary-card hover:border-primary-light hover:bg-primary-slate/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={accept}
            multiple={multiple}
            className="hidden"
          />
          <UploadCloud size={24} className="text-slate-500 dark:text-slate-400 mb-1.5" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
            Drag & drop here, or{' '}
            <span className="text-[#ff5e5b] hover:underline">browse</span>
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5 text-center">
            {isPdf ? 'PDF brochure only' : `Images (${accept}) ${multiple ? `max ${maxFiles} files` : 'single'}`}
          </p>
        </div>
      )}

      {/* Previews List (Only for Multiple Files) */}
      {multiple && (existingList.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-2">
          {/* Existing URL Previews */}
          {existingList.map((url, index) => (
            <div
              key={`exist-${index}`}
              className="relative aspect-square rounded-lg border border-primary-border bg-primary-card overflow-hidden group"
            >
              {isPdf ? (
                <div className="flex h-full flex-col items-center justify-center p-2 text-center text-slate-550 dark:text-slate-400">
                  <FileText size={24} className="text-red-400" />
                  <span className="text-[10px] mt-1 truncate max-w-full">Existing PDF</span>
                </div>
              ) : (
                <img
                  src={url}
                  alt="Existing Preview"
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeExisting(index);
                  }}
                  className="rounded-full bg-red-500 p-1 text-white hover:bg-red-650 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* New Selected File Previews */}
          {previews.map((url, index) => (
            <div
              key={`new-${index}`}
              className="relative aspect-square rounded-lg border border-[#ff5e5b]/30 bg-primary-card overflow-hidden group"
            >
              {isPdf ? (
                <div className="flex h-full flex-col items-center justify-center p-2 text-center text-slate-700 dark:text-slate-300">
                  <FileText size={24} className="text-[#ff5e5b]" />
                  <span className="text-[10px] mt-1 truncate max-w-full">
                    {selectedFiles[index]?.name}
                  </span>
                </div>
              ) : (
                <img
                  src={url}
                  alt="Local Preview"
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSelectedFile(index);
                  }}
                  className="rounded-full bg-red-500 p-1 text-white hover:bg-red-650 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

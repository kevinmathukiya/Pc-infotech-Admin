'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

/**
 * Type alias for allowed status strings. Exported for reuse.
 */
export type JobApplicationStatus =
  | 'pending'
  | 'reviewed'
  | 'accepted'
  | 'rejected';

const STATUS_STYLES: Record<string, string> = {
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  reviewed: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  accepted: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  rejected: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const DOT_STYLES: Record<string, string> = {
  pending: 'bg-amber-400',
  reviewed: 'bg-sky-400',
  accepted: 'bg-emerald-400',
  rejected: 'bg-red-400',
};

/**
 * StatusDropdown — fully custom dropdown that uses a React portal so the
 * dropdown list escapes any parent `overflow: hidden / auto` containers
 * (e.g. table scroll wrappers).
 */
export default function StatusDropdown({
  value,
  onChange,
  options,
}: {
  /** Current selected status */
  value: string;
  /** Change handler — mimics React.ChangeEvent for compatibility */
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Optional custom options */
  options?: Array<{ value: string; label: string }>;
}) {
  const defaultOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const finalOptions = options ?? defaultOptions;
  const selected = finalOptions.find((o) => o.value === value) ?? finalOptions[0];

  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Calculate position of the dropdown list relative to the button
  const openDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setOpen(true);
  };

  // Close on outside click, scroll, or window resize
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        listRef.current &&
        !listRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    const handleScrollOrResize = () => setOpen(false);

    document.addEventListener('mousedown', handler);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [open]);

  const handleSelect = (optValue: string) => {
    setOpen(false);
    const nativeEvent = {
      target: { value: optValue },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(nativeEvent);
  };

  return (
    <div className="relative w-40">
      {/* Trigger button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openDropdown())}
        className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 ${
          STATUS_STYLES[value] ?? 'text-slate-400 bg-slate-500/10 border-slate-500/30'
        }`}
      >
        <span>{selected.label}</span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown list — rendered via portal to escape overflow:hidden parents */}
      {open &&
        dropPos &&
        createPortal(
          <ul
            ref={listRef}
            style={{
              position: 'absolute',
              top: dropPos.top,
              left: dropPos.left,
              width: dropPos.width,
              zIndex: 9999,
            }}
            className="rounded-md border border-primary-border bg-primary-slate shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden"
          >
            {finalOptions.map((opt) => {
              const isSelected = opt.value === value;
              const textColorMap: Record<string, string> = {
                pending: '#f59e0b',
                reviewed: '#0284c7',
                accepted: '#10b981',
                rejected: '#ef4444',
              };
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    style={{
                      color: isSelected
                        ? (textColorMap[opt.value] ?? 'var(--foreground)')
                        : 'var(--text-secondary)',
                      background: isSelected ? 'var(--primary-card)' : 'transparent',
                    }}
                    className="flex w-full items-center px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-150 hover:bg-primary-card"
                  >
                    <span
                      className={`mr-2 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                        DOT_STYLES[opt.value] ?? 'bg-slate-400'
                      }`}
                    />
                    {opt.label}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </div>
  );
}

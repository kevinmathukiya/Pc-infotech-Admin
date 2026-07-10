'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Code
} from 'lucide-react';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (content: string) => void;
  error?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  value,
  onChange,
  error,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update editor content from value prop, but only if it's different
  // to avoid resetting cursor positions
  useEffect(() => {
    if (editorRef.current && isMounted) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '<p><br></p>';
      }
    }
  }, [value, isMounted]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, arg: string = '') => {
    document.execCommand(command, false, arg);
    handleInput();
  };

  if (!isMounted) {
    return (
      <div className="w-full flex flex-col gap-1.5 animate-pulse">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-550 dark:text-slate-400">
          {label}
        </span>
        <div className="h-40 rounded-lg bg-primary-card border border-primary-border" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-550 dark:text-slate-400">
        {label}
      </span>

      {/* Editor Box */}
      <div className={`flex flex-col rounded-xl border bg-primary-card overflow-hidden ${
        error ? 'border-red-500' : 'border-primary-border focus-within:border-[#ff5e5b] focus-within:shadow-[0_0_0_2px_rgba(255,94,91,0.2)]'
      }`}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 bg-primary-slate border-b border-primary-border p-2">
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:text-foreground hover:bg-primary-border transition-colors"
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:text-foreground hover:bg-primary-border transition-colors"
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className="p-1.5 rounded text-slate-550 dark:text-slate-400 hover:text-foreground hover:bg-primary-border transition-colors"
            title="Underline"
          >
            <Underline size={16} />
          </button>
          
          <div className="h-4 w-[1px] bg-primary-border mx-1" />

          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h1>')}
            className="p-1.5 rounded text-slate-550 dark:text-slate-400 hover:text-foreground hover:bg-primary-border transition-colors"
            title="Heading 1"
          >
            <Heading1 size={16} />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h2>')}
            className="p-1.5 rounded text-slate-550 dark:text-slate-400 hover:text-foreground hover:bg-primary-border transition-colors"
            title="Heading 2"
          >
            <Heading2 size={16} />
          </button>

          <div className="h-4 w-[1px] bg-primary-border mx-1" />

          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 rounded text-slate-555 dark:text-slate-400 hover:text-foreground hover:bg-primary-border transition-colors"
            title="Unordered List"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 rounded text-slate-555 dark:text-slate-400 hover:text-foreground hover:bg-primary-border transition-colors"
            title="Ordered List"
          >
            <ListOrdered size={16} />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<pre>')}
            className="p-1.5 rounded text-slate-555 dark:text-slate-400 hover:text-foreground hover:bg-primary-border transition-colors"
            title="Code Block"
          >
            <Code size={16} />
          </button>
        </div>

        {/* Content Editable Body */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          className="min-h-[160px] max-h-[300px] overflow-y-auto p-4 outline-none text-foreground/90 text-sm font-sans leading-relaxed focus:text-foreground"
          style={{ whiteSpace: 'pre-wrap' }}
        />
      </div>
      {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import { Input } from './index';

// Specifications Builder Component
interface Specification {
  key: string;
  value: string;
}

interface SpecificationsBuilderProps {
  label: string;
  value: Specification[];
  onChange: (specs: Specification[]) => void;
}

export const SpecificationsBuilder: React.FC<SpecificationsBuilderProps> = ({
  label,
  value = [],
  onChange,
}) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const addSpec = () => {
    if (!newKey.trim() || !newValue.trim()) return;
    const updated = [...value, { key: newKey.trim(), value: newValue.trim() }];
    onChange(updated);
    setNewKey('');
    setNewValue('');
  };

  const removeSpec = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="w-full flex flex-col gap-2 border border-primary-border rounded-xl p-4 bg-primary-deep">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </span>

      {/* Existing Specs */}
      {value.length > 0 ? (
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto mb-2 scrollbar-thin">
          {value.map((spec, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 bg-primary-slate border border-primary-border p-2.5 rounded-lg text-sm text-foreground"
            >
              <div className="flex-1 grid grid-cols-2 gap-4">
                <span className="font-semibold text-slate-500 dark:text-slate-400">{spec.key}:</span>
                <span>{spec.value}</span>
              </div>
              <button
                type="button"
                onClick={() => removeSpec(index)}
                className="text-slate-500 dark:text-slate-400 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-2">No specifications added yet.</p>
      )}

      {/* Input Form Fields */}
      <div className="flex items-end gap-3">
        <div className="flex-1 grid grid-cols-2 gap-3">
          <Input
            placeholder="Specification Key (e.g. CPU)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <Input
            placeholder="Value (e.g. Intel Core i7)"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={addSpec}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff5e5b] text-white hover:bg-[#ff3b38] transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};

// Features Builder Component
interface FeaturesBuilderProps {
  label: string;
  value: string[];
  onChange: (features: string[]) => void;
  pendingKey?: string;
  pendingInputsRef?: React.MutableRefObject<{ [key: string]: string }>;
}

export const FeaturesBuilder: React.FC<FeaturesBuilderProps> = ({
  label,
  value = [],
  onChange,
  pendingKey,
  pendingInputsRef,
}) => {
  const [newFeature, setNewFeature] = useState('');

  const handleInputChange = (val: string) => {
    setNewFeature(val);
    if (pendingInputsRef && pendingKey) {
      pendingInputsRef.current[pendingKey] = val;
    }
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    const updated = [...value, newFeature.trim()];
    onChange(updated);
    setNewFeature('');
    if (pendingInputsRef && pendingKey) {
      pendingInputsRef.current[pendingKey] = '';
    }
  };

  const removeFeature = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="w-full flex flex-col gap-2 border border-primary-border rounded-xl p-4 bg-primary-deep">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </span>

      {/* Existing List */}
      {value.length > 0 ? (
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto mb-2 scrollbar-thin">
          {value.map((feat, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 bg-primary-slate border border-primary-border p-2.5 rounded-lg text-sm text-foreground"
            >
              <span className="flex-1 truncate">{feat}</span>
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="text-slate-500 dark:text-slate-400 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-2">No key items added yet.</p>
      )}

      {/* Input */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Input
            placeholder="Add point description..."
            value={newFeature}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={addFeature}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addFeature();
              }
            }}
          />
        </div>
        <button
          type="button"
          onClick={addFeature}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff5e5b] text-white hover:bg-[#ff3b38] transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};

// FAQ Builder Component
interface FaqItem {
  question: string;
  answer: string;
}

interface FAQBuilderProps {
  label: string;
  value: FaqItem[];
  onChange: (faqs: FaqItem[]) => void;
}

export const FAQBuilder: React.FC<FAQBuilderProps> = ({
  label,
  value = [],
  onChange,
}) => {
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const addFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const updated = [...value, { question: newQuestion.trim(), answer: newAnswer.trim() }];
    onChange(updated);
    setNewQuestion('');
    setNewAnswer('');
  };

  const removeFaq = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="w-full flex flex-col gap-2 border border-primary-border rounded-xl p-4 bg-primary-deep">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </span>

      {/* Existing FAQs */}
      {value.length > 0 ? (
        <div className="flex flex-col gap-3 max-h-60 overflow-y-auto mb-2 scrollbar-thin">
          {value.map((faq, index) => (
            <div
              key={index}
              className="flex flex-col gap-1.5 bg-primary-slate border border-primary-border p-3 rounded-lg text-sm"
            >
              <div className="flex items-center justify-between gap-3 font-semibold text-foreground">
                <span className="flex items-center gap-1.5 text-foreground/90">
                  <HelpCircle size={15} className="text-[#ff5e5b]" />
                  {faq.question}
                </span>
                <button
                  type="button"
                  onClick={() => removeFaq(index)}
                  className="text-slate-500 dark:text-slate-400 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-405 pl-5">{faq.answer}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-2">No FAQs added yet.</p>
      )}

      {/* Forms */}
      <div className="flex flex-col gap-3 border-t border-primary-border pt-3">
        <Input
          placeholder="Frequently Asked Question"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        />
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              placeholder="Answer Description..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={addFaq}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff5e5b] text-white hover:bg-[#ff3b38] transition-colors"
            title="Add FAQ"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

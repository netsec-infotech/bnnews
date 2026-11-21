'use client';

import React from 'react';
import { Newspaper, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'હાલમાં કોઈ સમાચાર ઉપલબ્ધ નથી',
  message = 'નવીનતમ અપડેટ્સ મેળવવા માટે થોડા સમય પછી ફરી પ્રયાસ કરો અથવા પૃષ્ઠ રિફ્રેશ કરો.',
  actionText,
  onAction,
}) => {
  return (
    <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center my-6 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-blue-50 text-primary flex items-center justify-center mx-auto mb-4">
        <Newspaper className="w-8 h-8" />
      </div>
      <h3 className="font-gujarati text-lg font-bold text-neutral-text mb-2">
        {title}
      </h3>
      <p className="font-gujarati text-sm text-neutral-muted leading-relaxed mb-6">
        {message}
      </p>

      {onAction && actionText && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;

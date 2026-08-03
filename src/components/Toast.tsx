import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className="px-4 py-3 rounded-2xl bg-zinc-900 border border-blue-500/50 text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5 backdrop-blur-md">
        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};

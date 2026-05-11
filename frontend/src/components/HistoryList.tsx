import { useState, useEffect } from 'react';
import type { UrlEntry } from '../types/url.types';

interface HistoryListProps {
  history: UrlEntry[];
  onClear: () => void;
}

const HistoryItem = ({ entry }: { entry: UrlEntry }) => {
  const [copied, setCopied] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const fullUrl = `${BACKEND_URL}/${entry.shortCode}`;

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div
      className="glass-card p-4 rounded-xl border border-white/5 flex flex-col gap-2 hover:border-brand-500/20 transition-all group"
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col min-w-0 flex-1">
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 font-bold hover:underline text-base truncate"
            title={fullUrl}
          >
            {fullUrl}
          </a>
          <p className="text-[10px] text-stone-500 truncate mt-0.5" title={entry.originalUrl}>
            {entry.originalUrl}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 ml-4">
          <button
            onClick={handleCopy}
            className={`p-1.5 rounded-md border transition-all ${
              copied 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-surface-800 border-white/10 text-stone-400 hover:text-brand-400 hover:border-brand-500/30'
            }`}
            title="Copiar enlace"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            )}
          </button>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-stone-300 bg-surface-800 px-2 py-0.5 rounded-full border border-white/5">
              {entry.clicks} {entry.clicks === 1 ? 'clic' : 'clics'}
            </span>
            <span className="text-[9px] text-stone-600 mt-1">
              {new Date(entry.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      {entry.lastClickedAt && (
        <div className="text-[10px] text-stone-500 flex items-center gap-1 border-t border-white/5 pt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500/50"></span>
          Último clic: {new Date(entry.lastClickedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export const HistoryList = ({ history, onClear }: HistoryListProps) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full mt-8 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-stone-200">Historial reciente</h2>
        <button
          onClick={onClear}
          className="text-xs text-stone-500 hover:text-red-400 transition-colors"
          aria-label="Limpiar historial"
        >
          Limpiar
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {history.map((entry) => (
          <HistoryItem key={entry.shortCode} entry={entry} />
        ))}
      </div>
    </div>
  );
};

import { UrlEntry } from '../types/url.types';

interface HistoryListProps {
  history: UrlEntry[];
  onClear: () => void;
}

export const HistoryList = ({ history, onClear }: HistoryListProps) => {
  if (history.length === 0) return null;

  const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
          <div
            key={entry.shortCode}
            className="glass-card p-4 rounded-xl border border-white/5 flex flex-col gap-1 hover:border-brand-500/20 transition-all group"
          >
            <div className="flex justify-between items-start">
              <a
                href={`${BACKEND_URL}/${entry.shortCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-400 font-bold hover:underline"
              >
                {entry.shortCode}
              </a>
              <span className="text-[10px] text-stone-600">
                {new Date(entry.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-stone-400 truncate w-full" title={entry.originalUrl}>
              {entry.originalUrl}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

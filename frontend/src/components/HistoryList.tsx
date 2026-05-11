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
            className="glass-card p-4 rounded-xl border border-white/5 flex flex-col gap-2 hover:border-brand-500/20 transition-all group"
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <a
                  href={`${BACKEND_URL}/${entry.shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 font-bold hover:underline text-lg"
                >
                  {entry.shortCode}
                </a>
                <p className="text-xs text-stone-500 truncate max-w-[200px] sm:max-w-md" title={entry.originalUrl}>
                  {entry.originalUrl}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-stone-300 bg-surface-800 px-2 py-0.5 rounded-full border border-white/5">
                  {entry.clicks} {entry.clicks === 1 ? 'clic' : 'clics'}
                </span>
                <span className="text-[10px] text-stone-600 mt-1">
                  Creado: {new Date(entry.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            {entry.lastClickedAt && (
              <div className="text-[10px] text-stone-500 flex items-center gap-1 border-t border-white/5 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500/50"></span>
                Último clic: {new Date(entry.lastClickedAt).toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

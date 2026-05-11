import type { UrlEntry } from '../types/url.types';

const HISTORY_KEY = 'shorter_history';

export const getHistory = (): UrlEntry[] => {
  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveToHistory = (entry: UrlEntry): void => {
  const history = getHistory();
  // Filtrar si ya existe para evitar duplicados y mover al principio
  const filteredHistory = history.filter((item) => item.shortCode !== entry.shortCode);
  const newHistory = [entry, ...filteredHistory];
  
  // Limitar historial a los últimos 20 items
  const limitedHistory = newHistory.slice(0, 20);
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
};

export const clearHistory = (): void => {
  localStorage.removeItem(HISTORY_KEY);
};

import { useState, useEffect } from 'react';
import { UrlEntry } from '../types/url.types';
import { getHistory, saveToHistory, clearHistory as clearStorage } from '../utils/storage';

export const useHistory = () => {
  const [history, setHistory] = useState<UrlEntry[]>([]);

  // Cargar historial al montar
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const addToHistory = (entry: UrlEntry) => {
    saveToHistory(entry);
    setHistory(getHistory());
  };

  const clearHistory = () => {
    clearStorage();
    setHistory([]);
  };

  return {
    history,
    addToHistory,
    clearHistory
  };
};

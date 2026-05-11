import { useState, useEffect, useCallback } from 'react';
import { UrlEntry } from '../types/url.types';
import { getHistory, saveToHistory, clearHistory as clearStorage } from '../utils/storage';
import { getMyLinks } from '../api/urlApi';

export const useHistory = (token?: string | null) => {
  const [history, setHistory] = useState<UrlEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    if (token) {
      setIsLoading(true);
      try {
        const remoteLinks = await getMyLinks(token);
        setHistory(remoteLinks);
      } catch (err) {
        console.error('Error loading remote history:', err);
        // Fallback to local if remote fails
        setHistory(getHistory());
      } finally {
        setIsLoading(false);
      }
    } else {
      setHistory(getHistory());
    }
  }, [token]);

  // Cargar historial al montar o cuando cambie el token
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const addToHistory = (entry: UrlEntry) => {
    if (!token) {
      saveToHistory(entry);
    }
    // Si hay token, la DB ya lo tiene, pero actualizamos localmente para feedback inmediato
    setHistory(prev => {
      const filtered = prev.filter(item => item.shortCode !== entry.shortCode);
      return [entry, ...filtered];
    });
  };

  const clearHistory = () => {
    if (!token) {
      clearStorage();
    }
    setHistory([]);
    // Nota: El backend no tiene endpoint para limpiar historial todavía (fuera de spec)
  };

  return {
    history,
    isLoading,
    addToHistory,
    clearHistory,
    refreshHistory: loadHistory
  };
};

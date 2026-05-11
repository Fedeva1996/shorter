import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { saveToHistory, getHistory, clearHistory } from '../utils/storage';
import type { UrlEntry } from '../types/url.types';

const mockEntry: UrlEntry = {
  id: '1',
  originalUrl: 'https://example.com',
  shortCode: 'abc123',
  clicks: 0,
  createdAt: new Date().toISOString(),
  lastClickedAt: null,
};

describe('Storage Utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debe guardar una entrada en el historial', () => {
    saveToHistory(mockEntry);
    const history = getHistory();
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(mockEntry);
  });

  it('debe recuperar un historial vacío si no hay nada guardado', () => {
    const history = getHistory();
    expect(history).toEqual([]);
  });

  it('no debe duplicar entradas con el mismo shortCode', () => {
    saveToHistory(mockEntry);
    saveToHistory(mockEntry); // Intentar guardar la misma de nuevo
    const history = getHistory();
    expect(history).toHaveLength(1);
  });

  it('debe mantener las entradas más recientes al principio', () => {
    const entry2 = { ...mockEntry, id: '2', shortCode: 'xyz789' };
    saveToHistory(mockEntry);
    saveToHistory(entry2);
    const history = getHistory();
    expect(history[0]).toEqual(entry2);
    expect(history[1]).toEqual(mockEntry);
  });

  it('debe limpiar el historial', () => {
    saveToHistory(mockEntry);
    clearHistory();
    expect(getHistory()).toEqual([]);
  });
});

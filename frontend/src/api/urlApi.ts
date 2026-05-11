import type { CreateUrlResponse, UrlEntry } from '../types/url.types';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE_URL = `${BACKEND_URL}/api/v1/urls`;

export const createShortUrl = async (originalUrl: string, token?: string | null): Promise<CreateUrlResponse> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ originalUrl }),
  });

  if (!response.ok) {
    let errorMessage = 'Error al crear la URL acortada';
    try {
      const errorData = await response.json();
      if (errorData?.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Si no hay JSON descriptivo, mantenemos el error genérico
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

export const getMyLinks = async (token: string): Promise<UrlEntry[]> => {
  const response = await fetch(`${API_BASE_URL}/my-links`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener tus enlaces');
  }

  return response.json();
};

export const syncRemoteLinks = async (token: string, shortCodes: string[]): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ shortCodes }),
  });

  if (!response.ok) {
    throw new Error('Error al sincronizar enlaces');
  }
};

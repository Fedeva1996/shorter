import { CreateUrlResponse } from '../types/url.types';

const API_BASE_URL = '/api/v1/urls';

export const createShortUrl = async (originalUrl: string): Promise<CreateUrlResponse> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ originalUrl }),
  });

  if (!response.ok) {
    let errorMessage = 'Error al crear la URL acortada';
    try {
      const errorData = await response.json();
      if (errorData && errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // Ignoramos el error de parsing; usará el errorMessage genérico
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

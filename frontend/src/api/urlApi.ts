import type { CreateUrlResponse } from '../types/url.types';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE_URL = `${BACKEND_URL}/api/v1/urls`;
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
    const errorData = await response.json();
    if (errorData?.error) {
      errorMessage = errorData.error;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

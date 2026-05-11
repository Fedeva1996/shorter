const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE_URL = `${BACKEND_URL}/api/v1/auth`;

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export const registerUser = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al registrarse');
  }

  return response.json();
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al iniciar sesión');
  }

  return response.json();
};

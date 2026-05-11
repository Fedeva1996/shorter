import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { getHistory } from '../utils/storage';
import { syncRemoteLinks } from '../api/urlApi';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await loginUser(email, password);
      login(response.token, response.user);
      
      // Sincronizar historial local
      const localHistory = getHistory();
      if (localHistory.length > 0) {
        const shortCodes = localHistory.map(item => item.shortCode);
        await syncRemoteLinks(response.token, shortCodes).catch(console.error);
        localStorage.removeItem('shorter_history');
      }
      
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-20 p-6">
      <div className="glass-card rounded-2xl p-8 glow-brand">
        <h2 className="text-2xl font-bold text-stone-100 mb-6 text-center">Iniciar Sesión</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-dark w-full rounded-lg px-4 py-3 text-sm"
              placeholder="tu@email.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-400">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-dark w-full rounded-lg px-4 py-3 text-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs mt-1 text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full rounded-lg px-6 py-3 text-sm font-semibold text-white mt-4"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-stone-500 text-sm text-center mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-brand-400 hover:underline">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
};

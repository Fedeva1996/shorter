import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="w-full max-w-4xl mx-auto flex justify-between items-center py-6 px-4">
      <Link to="/" className="text-2xl font-bold text-gradient-brand">
        Shorty
      </Link>
      
      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-stone-500">Conectado como</span>
              <span className="text-sm font-medium text-stone-300">{user?.email}</span>
            </div>
            <Link 
              to="/dashboard" 
              className="text-sm font-semibold text-stone-400 hover:text-brand-400 transition-colors"
            >
              Mis Enlaces
            </Link>
            <button
              onClick={logout}
              className="text-sm font-semibold text-stone-400 hover:text-red-400 transition-colors"
            >
              Salir
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className="text-sm font-semibold text-stone-400 hover:text-stone-200 transition-colors"
            >
              Entrar
            </Link>
            <Link 
              to="/register" 
              className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/20"
            >
              Empezar
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

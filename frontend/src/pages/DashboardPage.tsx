import { useAuth } from '../context/AuthContext';
import { useHistory } from '../hooks/useHistory';
import { HistoryList } from '../components/HistoryList';
import { Navigate } from 'react-router-dom';

export const DashboardPage = () => {
  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { history, isLoading: isHistoryLoading, clearHistory } = useHistory(token);

  if (isAuthLoading) return <div className="text-center mt-20">Cargando usuario...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 px-4">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-100">Mis Enlaces</h1>
          <p className="text-stone-400">Gestiona y consulta las estadísticas de tus links acortados</p>
        </div>
      </div>

      {isHistoryLoading ? (
        <div className="text-center py-20 text-stone-500 italic">Cargando tus enlaces...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <HistoryList history={history} onClear={clearHistory} />
        </div>
      )}
    </div>
  );
};

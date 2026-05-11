import { useState } from 'react';
import { ShortenerForm } from './components/ShortenerForm';
import { ResultDisplay } from './components/ResultDisplay';
import { HistoryList } from './components/HistoryList';
import { createShortUrl } from './api/urlApi';
import { useHistory } from './hooks/useHistory';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortCode, setShortCode] = useState<string | null>(null);
  const { history, addToHistory, clearHistory } = useHistory();

  const handleShorten = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setShortCode(null);

    try {
      const response = await createShortUrl(url);
      setShortCode(response.shortCode);
      addToHistory(response);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Header simple */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient-brand mb-2">Shorty</h1>
          <p className="text-stone-400">Acorta tus enlaces en segundos</p>
        </div>

        {/* Card Principal */}
        <div className="glass-card w-full rounded-2xl p-6 glow-brand">
          <ShortenerForm onSubmit={handleShorten} isLoading={isLoading} />
          
          {/* Mensaje de Error */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-200 text-sm animate-fade-in text-center">
              {error}
            </div>
          )}
        </div>

        {/* Resultado (fuera del card para destacar) */}
        {shortCode && !error && (
          <ResultDisplay shortCode={shortCode} />
        )}

        {/* Historial (fuera del card principal) */}
        <HistoryList history={history} onClear={clearHistory} />
      </div>
    </main>
  );
}

export default App;

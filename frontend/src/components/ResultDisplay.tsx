import { useState, useEffect } from 'react';

interface ResultDisplayProps {
  shortCode: string;
}

export const ResultDisplay = ({ shortCode }: ResultDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const fullUrl = `${window.location.origin}/${shortCode}`;

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div className="glass-card w-full rounded-lg p-5 animate-fade-in flex flex-col gap-4 mt-4">
      <div>
        <h3 className="text-sm font-medium text-stone-300 mb-1">¡Tu enlace está listo!</h3>
        <a 
          href={fullUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-lg font-semibold text-gradient-brand break-all"
        >
          {fullUrl}
        </a>
      </div>
      
      <button
        type="button"
        onClick={handleCopy}
        className="w-full rounded-md px-4 py-2 text-sm font-semibold bg-surface-800 border border-brand-500/30 text-stone-200 hover:bg-surface-700 transition-colors flex justify-center items-center gap-2"
      >
        {copied ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ¡Copiado!
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-400"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copiar al portapapeles
          </>
        )}
      </button>
    </div>
  );
};

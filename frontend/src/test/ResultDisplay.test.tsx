import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ResultDisplay } from '../components/ResultDisplay'; 

// Mock the clipboard API
const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe('ResultDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renderiza la URL corta completa', () => {
    const shortCode = 'aB3x9Z';
    render(<ResultDisplay shortCode={shortCode} />);
    
    // Asumimos que muestra el origen actual + /shortCode
    const expectedUrl = `${window.location.origin}/${shortCode}`;
    expect(screen.getByText(expectedUrl)).toBeInTheDocument();
  });

  it('copia la URL al portapapeles al hacer clic en el botón', async () => {
    const shortCode = 'aB3x9Z';
    const expectedUrl = `${window.location.origin}/${shortCode}`;
    
    render(<ResultDisplay shortCode={shortCode} />);
    
    const copyButton = screen.getByRole('button', { name: /copiar/i });
    fireEvent.click(copyButton);
    
    expect(mockWriteText).toHaveBeenCalledWith(expectedUrl);
    expect(mockWriteText).toHaveBeenCalledTimes(1);
  });

  it('cambia el texto del botón a "¡Copiado!" y luego vuelve a la normalidad', async () => {
    render(<ResultDisplay shortCode="test12" />);
    
    const copyButton = screen.getByRole('button', { name: /copiar/i });
    expect(copyButton).toHaveTextContent(/copiar/i);
    
    fireEvent.click(copyButton);
    
    // Wait for the async writeText to resolve
    await act(async () => {
      await Promise.resolve();
    });
    
    expect(copyButton).toHaveTextContent(/¡copiado!/i);
    
    // Avanzar el tiempo para que el timeout del "Copiado" se ejecute
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    expect(copyButton).toHaveTextContent(/copiar/i);
    expect(copyButton).not.toHaveTextContent(/¡copiado!/i);
  });
});


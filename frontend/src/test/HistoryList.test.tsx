import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HistoryList } from '../components/HistoryList';
import type { UrlEntry } from '../types/url.types';

const mockHistory: UrlEntry[] = [
  {
    id: '1',
    originalUrl: 'https://example.com/very-long-url-1',
    shortCode: 'abc123',
    clicks: 5,
    createdAt: new Date().toISOString(),
    lastClickedAt: null,
  },
  {
    id: '2',
    originalUrl: 'https://example.com/very-long-url-2',
    shortCode: 'xyz789',
    clicks: 10,
    createdAt: new Date().toISOString(),
    lastClickedAt: null,
  },
];

describe('HistoryList Component', () => {
  it('no renderiza nada si el historial está vacío', () => {
    const { container } = render(<HistoryList history={[]} onClear={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza la lista de enlaces', () => {
    render(<HistoryList history={mockHistory} onClear={() => {}} />);
    expect(screen.getByText(/abc123/)).toBeInTheDocument();
    expect(screen.getByText(/xyz789/)).toBeInTheDocument();
    expect(screen.getByText('https://example.com/very-long-url-1')).toBeInTheDocument();
  });

  it('llama a onClear cuando se pulsa el botón de limpiar', async () => {
    const onClear = vi.fn();
    render(<HistoryList history={mockHistory} onClear={onClear} />);
    
    const clearButton = screen.getByRole('button', { name: /limpiar/i });
    clearButton.click();
    
    expect(onClear).toHaveBeenCalled();
  });
});

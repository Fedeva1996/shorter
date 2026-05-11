import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import * as urlApi from '../api/urlApi';

vi.mock('../api/urlApi', () => ({
  createShortUrl: vi.fn(),
}));

describe('App Orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra un mensaje de error si la API falla', async () => {
    const user = userEvent.setup();
    (urlApi.createShortUrl as any).mockRejectedValueOnce(new Error('La URL está en lista negra'));

    render(<App />);

    const input = screen.getByRole('textbox', { name: /url/i });
    await user.type(input, 'https://example.com/bad-url');

    const button = screen.getByRole('button', { name: /acortar/i });
    await user.click(button);

    // Debe mostrar el error en pantalla
    await waitFor(() => {
      expect(screen.getByText('La URL está en lista negra')).toBeInTheDocument();
    });
  });

  it('muestra el enlace acortado cuando la API es exitosa', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      id: '123',
      originalUrl: 'https://example.com/valid',
      shortCode: 'xY9z2A',
      clicks: 0,
      createdAt: new Date().toISOString(),
      lastClickedAt: null,
    };

    (urlApi.createShortUrl as any).mockResolvedValueOnce(mockResponse);

    render(<App />);

    const input = screen.getByRole('textbox', { name: /url/i });
    await user.type(input, 'https://example.com/valid');

    const button = screen.getByRole('button', { name: /acortar/i });
    await user.click(button);

    // Debe mostrar la URL generada en pantalla
    const expectedUrl = `${window.location.origin}/${mockResponse.shortCode}`;
    await waitFor(() => {
      expect(screen.getByText(expectedUrl)).toBeInTheDocument();
    });
  });

  it('guarda el enlace en el historial al ser creado exitosamente', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      id: 'history-1',
      originalUrl: 'https://history.com',
      shortCode: 'hist01',
      clicks: 0,
      createdAt: new Date().toISOString(),
      lastClickedAt: null,
    };

    (urlApi.createShortUrl as any).mockResolvedValueOnce(mockResponse);

    render(<App />);

    const input = screen.getByRole('textbox', { name: /url/i });
    await user.type(input, 'https://history.com');

    const button = screen.getByRole('button', { name: /acortar/i });
    await user.click(button);

    // Debe aparecer en el historial (HistoryList)
    await waitFor(() => {
      expect(screen.getByText('Historial reciente')).toBeInTheDocument();
      expect(screen.getByText('hist01')).toBeInTheDocument();
      expect(screen.getByText('https://history.com')).toBeInTheDocument();
    });
  });
});

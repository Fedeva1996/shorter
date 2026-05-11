import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import * as urlApi from '../api/urlApi';

vi.mock('../api/urlApi', () => ({
  createShortUrl: vi.fn(),
  getMyLinks: vi.fn().mockResolvedValue([]),
  syncRemoteLinks: vi.fn().mockResolvedValue(undefined),
}));

describe('App Orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renderiza la página de inicio correctamente', async () => {
    render(<App />);
    expect(screen.getByText(/Acorta tus enlaces/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Entrar/i })).toBeInTheDocument();
  });
});

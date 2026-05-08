import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShortenerForm } from '../components/ShortenerForm';

describe('ShortenerForm', () => {
  const mockOnSubmit = vi.fn();

  it('renderiza el input y el botón de acortar', () => {
    render(<ShortenerForm onSubmit={mockOnSubmit} isLoading={false} />);

    expect(screen.getByRole('textbox', { name: /url/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /acortar/i })).toBeInTheDocument();
  });

  it('el botón está deshabilitado cuando el input está vacío', () => {
    render(<ShortenerForm onSubmit={mockOnSubmit} isLoading={false} />);

    const button = screen.getByRole('button', { name: /acortar/i });
    expect(button).toBeDisabled();
  });

  it('no llama a onSubmit al hacer submit con el input vacío', async () => {
    const user = userEvent.setup();
    render(<ShortenerForm onSubmit={mockOnSubmit} isLoading={false} />);

    const button = screen.getByRole('button', { name: /acortar/i });
    await user.click(button);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('no llama a onSubmit con una URL obviamente malformada (sin http/https)', async () => {
    const user = userEvent.setup();
    render(<ShortenerForm onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByRole('textbox', { name: /url/i });
    await user.type(input, 'esto-no-es-una-url');

    const button = screen.getByRole('button', { name: /acortar/i });
    await user.click(button);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('llama a onSubmit con la URL cuando el valor es válido', async () => {
    const user = userEvent.setup();
    render(<ShortenerForm onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByRole('textbox', { name: /url/i });
    await user.type(input, 'https://example.com/valid-url');

    const button = screen.getByRole('button', { name: /acortar/i });
    await user.click(button);

    expect(mockOnSubmit).toHaveBeenCalledWith('https://example.com/valid-url');
  });

  it('el botón está deshabilitado mientras isLoading es true', () => {
    render(<ShortenerForm onSubmit={mockOnSubmit} isLoading={true} />);

    const button = screen.getByRole('button', { name: /acortar/i });
    expect(button).toBeDisabled();
  });
});

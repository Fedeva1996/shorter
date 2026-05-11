import { useState } from 'react';
import type { FormEvent } from 'react';

interface ShortenerFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const isValidUrl = (value: string): boolean => {
  return value.startsWith('http://') || value.startsWith('https://');
};

export const ShortenerForm = ({ onSubmit, isLoading }: ShortenerFormProps) => {
  const [value, setValue] = useState('');

  const isDisabled = isLoading || !value.trim() || !isValidUrl(value.trim());

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    onSubmit(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="url-input"
          className="text-sm font-medium text-[#fdba74]"
        >
          URL a acortar
        </label>
        <input
          id="url-input"
          type="url"
          aria-label="URL a acortar"
          placeholder="https://ejemplo.com/tu-url-muy-larga"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input-dark w-full rounded-lg px-4 py-3 text-sm"
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        aria-label="Acortar URL"
        disabled={isDisabled}
        className="btn-primary w-full rounded-lg px-6 py-3 text-sm font-semibold text-white"
      >
        {isLoading ? 'Acortando…' : 'Acortar'}
      </button>
    </form>
  );
};

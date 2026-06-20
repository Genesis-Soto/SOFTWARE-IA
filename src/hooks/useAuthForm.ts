import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';

interface UseAuthFormOptions {
  onSubmit: () => Promise<void>;
  defaultError?: string;
}

export default function useAuthForm({ onSubmit, defaultError = '' }: UseAuthFormOptions) {
  const navigate = useNavigate();
  const [error, setError] = useState(defaultError);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        await onSubmit();
        navigate('/dashboard');
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [onSubmit, navigate]
  );

  return { error, loading, handleSubmit };
}

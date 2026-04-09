import { useEffect } from 'react';

export function useKeyboard(handlers: Record<string, () => void>) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K — command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handlers['cmd+k']?.();
        return;
      }
      if (e.key === 'Escape') {
        handlers['escape']?.();
        return;
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        handlers['slash']?.();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlers]);
}

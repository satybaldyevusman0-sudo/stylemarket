import { createContext, useContext, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../lib/hooks.js';

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useLocalStorage('theme', prefersDark ? 'dark' : 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0d1512' : '#ffffff');
  }, [theme]);

  const value = useMemo(() => ({ theme, toggle: () => setTheme((x) => (x === 'dark' ? 'light' : 'dark')) }), [theme, setTheme]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);

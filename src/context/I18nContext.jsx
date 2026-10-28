import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { translations, LANGS } from '../i18n/translations.js';
import { useLocalStorage } from '../lib/hooks.js';

const I18nCtx = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useLocalStorage('lang', 'ky');
  const safe = LANGS.some((l) => l.code === lang) ? lang : 'ky';

  useEffect(() => {
    document.documentElement.lang = safe === 'ky' ? 'ky' : safe;
  }, [safe]);

  const t = useCallback((key, vars) => {
    let s = translations[safe][key] ?? translations.ky[key] ?? key;
    if (vars) Object.entries(vars).forEach(([k, v]) => { s = s.replace(`{${k}}`, v); });
    return s;
  }, [safe]);

  // {ky, ru, en} объектинен учурдагы тилди алат
  const tx = useCallback((obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[safe] || obj.ky || obj.en || obj.ru || '';
  }, [safe]);

  const value = useMemo(() => ({ lang: safe, setLang, t, tx }), [safe, setLang, t, tx]);
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => useContext(I18nCtx);

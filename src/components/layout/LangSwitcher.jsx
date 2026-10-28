import { LANGS } from '../../i18n/translations.js';
import { useI18n } from '../../context/I18nContext.jsx';

export default function LangSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button key={l.code} className={lang === l.code ? 'active' : ''} onClick={() => setLang(l.code)} title={l.name} aria-pressed={lang === l.code}>
          {l.label}
        </button>
      ))}
    </div>
  );
}

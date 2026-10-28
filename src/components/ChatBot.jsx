// Чатбот: суроолорду /api/chat аркылуу серверге жөнөтөт.
import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { Link } from '../lib/router.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { errorText } from './ui/States.jsx';
import Icon from './ui/Icon.jsx';

export default function ChatBot() {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);

  useEffect(() => { listRef.current?.scrollTo(0, listRef.current.scrollHeight); }, [msgs, open]);

  const ask = async (q) => {
    const message = q.trim();
    if (!message || busy) return;
    setMsgs((m) => [...m, { from: 'me', text: message }]);
    setText('');
    setBusy(true);
    try {
      const r = await api('/api/chat', { method: 'POST', body: { message, lang } });
      setMsgs((m) => [...m, { from: 'bot', text: r.answer, link: r.link }]);
    } catch (e) {
      setMsgs((m) => [...m, { from: 'bot', text: errorText(e, t), error: true }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`chatbot ${open ? 'chatbot--open' : ''}`}>
      {open && (
        <section className="chatbot__panel" aria-label={t('chat.title')}>
          <header className="chatbot__head">
            <span>🤖 {t('chat.title')}</span>
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label={t('nav.close')}><Icon name="close" size={18} /></button>
          </header>
          <div className="chatbot__list" ref={listRef} aria-live="polite">
            <div className="msg msg--bot">{t('chat.hello')}</div>
            {msgs.length === 0 && (
              <div className="chatbot__quick">
                {['chat.q1', 'chat.q2', 'chat.q3'].map((k) => <button key={k} onClick={() => ask(t(k))}>{t(k)}</button>)}
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`msg msg--${m.from} ${m.error ? 'msg--error' : ''}`}>
                {m.text}
                {m.link && <Link to={m.link} className="msg__link" onClick={() => setOpen(false)}>{t('chat.more')}</Link>}
              </div>
            ))}
            {busy && <div className="msg msg--bot msg--typing"><i /><i /><i /></div>}
          </div>
          <form className="chatbot__form" onSubmit={(e) => { e.preventDefault(); ask(text); }}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t('chat.placeholder')} maxLength={500} aria-label={t('chat.placeholder')} />
            <button className="icon-btn" disabled={busy || !text.trim()} aria-label="send"><Icon name="send" size={18} /></button>
          </form>
        </section>
      )}
      <button className="chatbot__fab" onClick={() => setOpen((x) => !x)} aria-label={t('chat.open')} aria-expanded={open}>
        <Icon name={open ? 'close' : 'chat'} size={26} />
      </button>
    </div>
  );
}

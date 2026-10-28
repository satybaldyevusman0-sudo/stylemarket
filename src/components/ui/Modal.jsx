import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';
import { useI18n } from '../../context/I18nContext.jsx';

export default function Modal({ open, title, onClose, children, wide = false }) {
  const { t } = useI18n();
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    ref.current?.querySelector('input,select,textarea,button')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal__box ${wide ? 'modal__box--wide' : ''}`} ref={ref}>
        <div className="modal__head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label={t('nav.close')}><Icon name="close" /></button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

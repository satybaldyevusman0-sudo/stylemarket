import { useI18n } from '../context/I18nContext.jsx';
import site, { links } from '../site.js';

// WhatsApp, Telegram (ошол эле номер), Instagram жана чалуу баскычтары
export default function ContactButtons({ compact = false, text }) {
  const { t } = useI18n();
  const wa = text ? `${links.whatsapp}?text=${encodeURIComponent(text)}` : links.whatsapp;
  return (
    <div className={`contact-btns ${compact ? 'contact-btns--compact' : ''}`}>
      <a className="cbtn cbtn--wa" href={wa} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">💬</span> {compact ? 'WhatsApp' : t('ct.whatsapp')}</a>
      <a className="cbtn cbtn--tg" href={links.telegram} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">✈️</span> {compact ? 'Telegram' : t('ct.telegram')}</a>
      <a className="cbtn cbtn--ig" href={links.instagram} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">📸</span> {compact ? 'Instagram' : `@${site.contacts.instagram}`}</a>
      {!compact && <a className="cbtn cbtn--tel" href={links.tel}><span aria-hidden="true">📞</span> {site.contacts.phone}</a>}
    </div>
  );
}

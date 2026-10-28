import { useDocumentTitle } from '../lib/hooks.js';
import { useI18n } from '../context/I18nContext.jsx';
import site from '../site.js';
import PageHeader from '../components/layout/PageHeader.jsx';
import ContactForm from '../components/forms/ContactForm.jsx';
import ContactButtons from '../components/ContactButtons.jsx';

export default function Contact() {
  const { t, tx } = useI18n();
  useDocumentTitle(t('ct.title'));
  const map = `https://www.google.com/maps?q=${encodeURIComponent(tx(site.contacts.address))}&output=embed`;
  return (
    <>
      <PageHeader title={t('ct.title')} subtitle={t('ct.subtitle')} />
      <section className="container section grid grid--2 align-start">
        <div className="stack-lg">
          <div className="card stack">
            <h2>{t('ct.messengers')}</h2>
            <ContactButtons />
            <p className="muted">📍 {tx(site.contacts.address)}<br />🕘 {t('ct.hours')}</p>
          </div>
          <div className="card map-card">
            <iframe title="map" src={map} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
        <div>
          <h2>{t('ct.write')}</h2>
          <ContactForm />
        </div>
      </section>
    </>
  );
}

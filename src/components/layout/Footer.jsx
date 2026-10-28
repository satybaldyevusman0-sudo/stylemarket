import { Link } from '../../lib/router.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import site, { links } from '../../site.js';
import { mainNav } from './navItems.js';
import NavText from './NavText.jsx';
import Logo from './Logo.jsx';

export default function Footer() {
  const { t, tx } = useI18n();
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <Logo />
          <p className="muted">{tx(site.text.about)}</p>
        </div>
        <div>
          <h4>{t('footer.links')}</h4>
          <ul>
            {mainNav.map((n) => <li key={n.to}><Link to={n.to}><NavText item={n} /></Link></li>)}
            <li><Link to="/rates">{t('nav.rates')}</Link></li>
          </ul>
        </div>
        <div>
          <h4>{t('footer.contacts')}</h4>
          <ul>
            <li><a href={links.whatsapp} target="_blank" rel="noopener noreferrer">💬 WhatsApp: {site.contacts.phone}</a></li>
            <li><a href={links.telegram} target="_blank" rel="noopener noreferrer">✈️ Telegram: {site.contacts.phone}</a></li>
            <li><a href={links.instagram} target="_blank" rel="noopener noreferrer">📸 Instagram: @{site.contacts.instagram}</a></li>
            <li><a href={links.tel}>📞 {site.contacts.phone}</a></li>
            <li className="muted">📍 {tx(site.contacts.address)}</li>
          </ul>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} {site.name}. {t('footer.rights')}</span>
        {site.dataNote && <span className="muted">{tx(site.dataNote)}</span>}
      </div>
    </footer>
  );
}

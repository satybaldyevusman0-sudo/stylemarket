// Адаптивдүү бургер меню (телефон жана планшет үчүн)
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from '../../lib/router.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { mainNav } from './navItems.js';
import SearchBar from './SearchBar.jsx';
import LangSwitcher from './LangSwitcher.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import Icon from '../ui/Icon.jsx';
import NavText from './NavText.jsx';
import ContactButtons from '../ContactButtons.jsx';

export default function MobileMenu({ open, onClose }) {
  const { t } = useI18n();
  const { user, isAdmin, logout } = useAuth();
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  // Portal: header'дин backdrop-filter'и fixed элементтерди кыркпашы үчүн body'ге чыгарылат
  return createPortal(
    <div className={`drawer ${open ? 'drawer--open' : ''}`} aria-hidden={!open}>
      <div className="drawer__backdrop" onClick={onClose} />
      <aside className="drawer__panel" aria-label={t('nav.menu')}>
        <div className="drawer__head">
          <strong>{t('nav.menu')}</strong>
          <button className="icon-btn" onClick={onClose} aria-label={t('nav.close')}><Icon name="close" /></button>
        </div>
        <SearchBar onDone={onClose} />
        <nav className="drawer__nav">
          <NavLink to="/" end onClick={onClose}>{t('nav.home')}</NavLink>
          {mainNav.map((n) => <NavLink key={n.to} to={n.to} onClick={onClose}><NavText item={n} /></NavLink>)}
          <NavLink to="/rates" onClick={onClose}>{t('nav.rates')}</NavLink>
          <NavLink to="/favorites" onClick={onClose}>{t('nav.favorites')}</NavLink>
          <NavLink to="/cart" onClick={onClose}>{t('nav.cart')}</NavLink>
          {user && <NavLink to="/profile" onClick={onClose}>{t('nav.profile')}</NavLink>}
          {isAdmin && <NavLink to="/admin" onClick={onClose}>{t('nav.admin')}</NavLink>}
        </nav>
        <ContactButtons compact />
        <div className="drawer__foot">
          <LangSwitcher />
          <ThemeToggle />
        </div>
        {user
          ? <button className="btn btn--outline btn--block" onClick={() => { logout(); onClose(); }}>{t('nav.logout')}</button>
          : <div className="row"><NavLink className="btn btn--outline" to="/login" onClick={onClose}>{t('nav.login')}</NavLink><NavLink className="btn btn--primary" to="/register" onClick={onClose}>{t('nav.register')}</NavLink></div>}
      </aside>
    </div>,
    document.body
  );
}

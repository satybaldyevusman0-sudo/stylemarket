import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from '../../lib/router.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import { mainNav } from './navItems.js';
import Logo from './Logo.jsx';
import SearchBar from './SearchBar.jsx';
import LangSwitcher from './LangSwitcher.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import UserMenu from './UserMenu.jsx';
import MobileMenu from './MobileMenu.jsx';
import Icon from '../ui/Icon.jsx';
import NavText from './NavText.jsx';

export default function Header() {
  const { t } = useI18n();
  const { count } = useCart();
  const { ids } = useFavorites();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="topline" aria-hidden="true" />
      <div className="container header__inner">
        <Logo />
        <nav className="header__nav" aria-label="main">
          {mainNav.map((n) => <NavLink key={n.to} to={n.to}><NavText item={n} /></NavLink>)}
        </nav>
        <div className="header__actions">
          <div className="header__search"><SearchBar /></div>
          <div className="hide-sm"><LangSwitcher /></div>
          <ThemeToggle />
          <Link to="/favorites" className="icon-btn badge-wrap" aria-label={t('nav.favorites')} title={t('nav.favorites')}>
            <Icon name="heart" />{ids.length > 0 && <span className="badge">{ids.length}</span>}
          </Link>
          <Link to="/cart" className="icon-btn badge-wrap" aria-label={t('nav.cart')} title={t('nav.cart')}>
            <Icon name="cart" />{count > 0 && <span className="badge">{count}</span>}
          </Link>
          <UserMenu />
          <button className="icon-btn burger" onClick={() => setOpen(true)} aria-label={t('nav.menu')} aria-expanded={open}>
            <Icon name="menu" />
          </button>
        </div>
      </div>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </header>
  );
}

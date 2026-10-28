import { useEffect, useRef, useState } from 'react';
import { Link, navigate } from '../../lib/router.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Icon from '../ui/Icon.jsx';

export default function UserMenu() {
  const { user, isAdmin, logout } = useAuth();
  const { t } = useI18n();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onDoc = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  if (!user) return <Link to="/login" className="btn btn--primary btn--sm hide-sm">{t('nav.login')}</Link>;
  const close = () => setOpen(false);
  return (
    <div className="user-menu hide-sm" ref={ref}>
      <button className="user-menu__btn" onClick={() => setOpen((x) => !x)} aria-expanded={open} aria-haspopup="menu">
        {user.avatar ? <img src={user.avatar} alt="" /> : <span className="avatar">{user.name[0]?.toUpperCase()}</span>}
        <span className="user-menu__name">{user.name.split(' ')[0]}</span>
      </button>
      {open && (
        <div className="user-menu__drop" role="menu">
          <Link to="/profile" role="menuitem" onClick={close}><Icon name="user" size={16} /> {t('nav.profile')}</Link>
          <Link to="/favorites" role="menuitem" onClick={close}><Icon name="heart" size={16} /> {t('nav.favorites')}</Link>
          {isAdmin && <Link to="/admin" role="menuitem" onClick={close}><Icon name="shield" size={16} /> {t('nav.admin')}</Link>}
          <button role="menuitem" onClick={async () => { close(); await logout(); push(t('auth.loggedOut'), 'info'); navigate('/'); }}><Icon name="logout" size={16} /> {t('nav.logout')}</button>
        </div>
      )}
    </div>
  );
}

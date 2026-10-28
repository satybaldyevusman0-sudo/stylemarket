import { useEffect, useState } from 'react';
import { useLocation } from '../../lib/router.jsx';
import Icon from '../ui/Icon.jsx';

export default function ScrollTopButton() {
  const [show, setShow] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return <button className="scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Up"><Icon name="arrowUp" /></button>;
}

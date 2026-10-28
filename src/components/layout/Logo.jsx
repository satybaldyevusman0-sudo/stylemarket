import { Link } from '../../lib/router.jsx';
import site from '../../site.js';

export default function Logo({ onClick }) {
  const [a, b] = site.nameParts || [site.name, ''];
  return (
    <Link to="/" className="logo" onClick={onClick} aria-label={site.name}>
      <span className="logo__mark" aria-hidden="true">{site.logo}</span>
      <span className="logo__text">{a}<b>{b}</b></span>
    </Link>
  );
}

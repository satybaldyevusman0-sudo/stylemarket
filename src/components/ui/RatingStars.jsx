import { useState } from 'react';
import Icon from './Icon.jsx';

// value: 0–5; onChange берилсе — тандоо режими
export default function RatingStars({ value = 0, onChange, size = 18, label }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  if (!onChange) {
    return (
      <span className="stars" aria-label={`${value} / 5`}>
        {[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" size={size} fill={i <= Math.round(value)} className={i <= Math.round(value) ? 'star--on' : 'star--off'} />)}
      </span>
    );
  }
  return (
    <div className="stars stars--input" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button type="button" key={i} role="radio" aria-checked={value === i} aria-label={`${i}`}
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => onChange(i)}>
          <Icon name="star" size={size + 6} fill={i <= shown} className={i <= shown ? 'star--on' : 'star--off'} />
        </button>
      ))}
    </div>
  );
}

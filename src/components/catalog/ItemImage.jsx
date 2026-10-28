// Сүрөт: жүктөлбөй калса — темага ылайык градиент жана иконка көрсөтүлөт (сынган сүрөт болбойт).
import { useState } from 'react';
import site from '../../site.js';

export default function ItemImage({ src, alt, className = '', icon, eager = false }) {
  const [state, setState] = useState(src ? 'loading' : 'error');
  return (
    <div className={`img-box img-box--${state} ${className}`}>
      {src && state !== 'error' && (
        <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async"
          onLoad={() => setState('ok')} onError={() => setState('error')} />
      )}
      {state !== 'ok' && <span className="img-box__ph" aria-hidden="true">{icon || site.logo}</span>}
    </div>
  );
}

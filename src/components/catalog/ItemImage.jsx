// Сүрөт чынжыры: 1) негизги сүрөт → 2) алмаштыруучу сүрөт (туруктуу seed) → 3) темага ылайык карточка.
// Ошондуктан сүрөт жүктөлбөсө да бет катасыз көрүнөт жана ар бир товар аталышы менен чагылат.
import { useState } from 'react';
import site from '../../site.js';
import { useWikiImage } from '../../lib/useWikiImage.js';

const altSrc = (src) => {
  const seed = encodeURIComponent(String(src || 'item').replace(/[^a-z0-9]/gi, '').slice(-32) || 'item');
  return `https://picsum.photos/seed/${seed}/800/600`;
};

export default function ItemImage(props) {
  // `wiki` берилсе — алгач Wikipedia API'ден туура сүрөт изделет, табылбаса `src` колдонулат
  const found = useWikiImage(props.wiki);
  if (props.wiki && found === undefined) {
    return <div className={`img-box img-box--loading ${props.className || ''}`}><span className="img-box__ph" aria-hidden="true">{props.icon || site.logo}</span></div>;
  }
  return <ImageChain key={found || props.src} {...props} src={found || props.src} />;
}

function ImageChain({ src, alt = '', className = '', icon, label, eager = false }) {
  // 0 = негизги, 1 = алмаштыруучу, 2 = карточка
  const [stage, setStage] = useState(src ? 0 : 2);
  const url = stage === 0 ? src : stage === 1 ? altSrc(src) : null;
  const onError = () => setStage((s) => (s < 2 ? s + 1 : 2));

  return (
    <div className={`img-box ${stage === 2 ? 'img-box--ph' : ''} ${className}`}>
      {url && (
        <img key={url} src={url} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={onError} />
      )}
      {stage === 2 && (
        <div className="img-box__ph" role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}>
          <span className="img-box__icon">{icon || site.logo}</span>
          {label && <span className="img-box__label">{label}</span>}
        </div>
      )}
    </div>
  );
}

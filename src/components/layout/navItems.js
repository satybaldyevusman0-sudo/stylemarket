import site from '../../site.js';

// Навигация: тексттер темага жараша site/config.js'тен алынат
export const mainNav = [
  { to: '/catalog', label: site.text.catalog },
  ...(site.plans?.length ? [{ to: '/plans', label: site.text.plans }] : []),
  { to: '/booking', label: site.text.booking },
  { to: '/contact', key: 'nav.contact' }
];

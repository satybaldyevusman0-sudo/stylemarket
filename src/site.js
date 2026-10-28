// Сайттын конфигурациясы (тема, тексттер, байланыштар). Каталогдун маалыматы API аркылуу алынат.
import site from '../site/config.js';

export default site;

const digits = site.contacts.phone.replace(/\D/g, '');
export const links = {
  whatsapp: `https://wa.me/${digits}`,
  telegram: `https://t.me/+${digits}`,
  instagram: `https://instagram.com/${site.contacts.instagram}`,
  tel: `tel:+${digits}`
};

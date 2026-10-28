// Эрежеге негизделген чатбот: сайттын конфигурациясындагы суроо-жооптордон жана товарлардан жооп берет.
import site from '../../site/config.js';

const L = (lang) => (['ky', 'ru', 'en'].includes(lang) ? lang : 'ky');
const pick = (obj, l) => (typeof obj === 'string' ? obj : obj?.[l] || obj?.ky || '');

const common = [
  {
    keys: ['байланыш', 'телефон', 'номер', 'whatsapp', 'ватсап', 'telegram', 'телеграм', 'контакт', 'связ', 'contact', 'phone', 'instagram'],
    answer: {
      ky: `Биз менен WhatsApp/Telegram аркылуу байланышыңыз: ${site.contacts.phone}. Instagram: @${site.contacts.instagram}.`,
      ru: `Свяжитесь с нами в WhatsApp/Telegram: ${site.contacts.phone}. Instagram: @${site.contacts.instagram}.`,
      en: `Contact us on WhatsApp/Telegram: ${site.contacts.phone}. Instagram: @${site.contacts.instagram}.`
    },
    link: '/contact'
  },
  {
    keys: ['төлө', 'оплат', 'pay', 'карта', 'card', 'stripe'],
    answer: {
      ky: 'Төлөм заказ берилгенден кийин карта менен жүргүзүлөт (Stripe же демо режим). Заказдарыңыз профилде көрүнөт.',
      ru: 'Оплата картой после оформления заказа (Stripe или демо). Заказы видны в профиле.',
      en: 'Pay by card after checkout (Stripe or demo). Your orders appear in your profile.'
    },
    link: '/cart'
  },
  {
    keys: ['бронь', 'жазыл', 'запис', 'book', 'брон'],
    answer: { ky: 'Брондоо үчүн "Бронь" бетинен күн жана бош убакытты тандаңыз.', ru: 'Для брони выберите дату и свободное время на странице «Бронь».', en: 'To book, pick a date and a free slot on the Booking page.' },
    link: '/booking'
  }
];

export function chatAnswer(message, lang = 'ky', items = []) {
  const l = L(lang);
  const text = String(message || '').toLowerCase();
  const all = [...(site.faq || []), ...common];
  const hit = all.find((it) => it.keys.some((k) => text.includes(k.toLowerCase())));
  if (hit) return { answer: pick(hit.answer, l), link: hit.link || '/contact' };
  // Товардын аталышы боюнча издөө
  const words = text.split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2);
  const found = items.filter((x) => words.some((w) => pick(x.title, l).toLowerCase().includes(w))).slice(0, 3);
  if (found.length) {
    const list = found.map((x) => `• ${pick(x.title, l)} — ${x.price ? x.price.toLocaleString('ru-RU') + ' ' + (x.currency || site.currency) : ''}`).join('\n');
    const head = { ky: 'Табылды:', ru: 'Найдено:', en: 'Found:' }[l];
    return { answer: `${head}\n${list}`, link: `/catalog/${found[0].id}` };
  }
  const fallback = {
    ky: `Кечириңиз, так жооп таппадым. Каталогдон издеп көрүңүз же WhatsApp аркылуу жазыңыз: ${site.contacts.phone}`,
    ru: `Извините, точного ответа нет. Поищите в каталоге или напишите в WhatsApp: ${site.contacts.phone}`,
    en: `Sorry, no exact answer. Try the catalog or message us on WhatsApp: ${site.contacts.phone}`
  };
  return { answer: fallback[l], link: '/catalog' };
}

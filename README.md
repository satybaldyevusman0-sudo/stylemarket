# StyleMarket

Кийим-кече интернет-дүкөнү. React 18 + Vite (frontend), Node.js серверсиз функциясы (backend, кошумча пакетсиз), Upstash Redis же JSON-файл (база). Vercel'ге даяр.

## Иштетүү

Талап: Node.js 18.18+ (https://nodejs.org)

```bash
npm install
copy .env.example .env      # Mac/Linux: cp .env.example .env
npm run dev
```

- Сайт: http://localhost:5173
- API: http://localhost:3001/api/health
- Демо админ (локалдык гана): `admin@site.kg` / `Admin12345!` → http://localhost:5173/admin

API тести (сервер иштеп турганда, башка терминалда): `npm run test:api`
Production build: `npm run build`

## Маалымат кайда?

- `site/config.js` — сайттын аты, түстөрү, тексттер (kg/ru/en), категориялар, тарифтер, байланыштар (WhatsApp/Telegram/Instagram).
- `site/items.js` — каталогдун баштапкы маалыматы. Биринчи иштетүүдө базага жүктөлөт, андан кийин **админ панелден** кошуп/өзгөртүп/өчүрөсүз.
- Сүрөттөр: темага ылайык ачкыч сөздөр менен loremflickr.com (Flickr сүрөттөрү) аркылуу алынат. Өз сүрөтүңүздү админ панелден URL же Cloudinary аркылуу коюңуз. Сүрөт жүктөлбөсө, анын ордуна түстүү фон жана иконка чыгат (сынган сүрөт көрүнбөйт).
- Баалар — интернеттеги жарнамалардан алынган **болжолдуу** баалар (сайтта ушундай белгиленген).

## GitHub'га жүктөө

```bash
git init
git add .
git commit -m "StyleMarket"
git branch -M main
git remote add origin https://github.com/<логин>/stylemarket.git
git push -u origin main
```

## Vercel'ге жарыялоо

1. vercel.com → Add New → Project → `stylemarket` репозиторийин тандаңыз (Framework: Vite).
2. Settings → Environment Variables: `JWT_SECRET` (кеминде 32 белги), `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
3. Storage → Upstash Redis (акысыз) кошуңуз — болбосо катталуулар жана заказдар өчүп калышы мүмкүн.
4. Deploy. Андан кийин `APP_URL` = сайттын дареги, кайра Deploy.

## Ачкычтар (милдеттүү эмес)

| Функция | Env | Ачкыч жок болсо |
|---|---|---|
| Telegram билдирүү | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Заказдар базага гана сакталат |
| Почтага заказ | `RESEND_API_KEY`, `NOTIFY_EMAIL` | Ошол эле |
| Stripe | `STRIPE_SECRET_KEY` | DEMO төлөм (карта 4242 4242 4242 4242) |
| Cloudinary | `CLOUDINARY_*` | Сүрөттүн URL'ин жазса болот |
| Google/GitHub кирүү | `GOOGLE_*`, `GITHUB_*` | Баскычтар өчүк |

## Функциялар

Каталог (издөө, категория, баа фильтри, иреттөө, пагинация), толук барак (галерея, мүнөздөмөлөр, окшош товарлар), корзина → заказ → төлөм (Stripe/DEMO), бронь (бош убакыт), катталуу/кирүү (JWT httpOnly cookie, scrypt), private routes, ролдор admin/user, Google/GitHub OAuth, сүйүктүүлөр, пикир/рейтинг, админ панель (recharts статистика, CRUD, заказ/бронь статусу, колдонуучулар, Cloudinary), kg-ru-en, күн/түн, бургер меню, skeleton, error boundary, чатбот, WhatsApp/Telegram/Instagram баскычтары, Telegram/почта билдирүү, валюта курсу (ачык API).
# stylemarket

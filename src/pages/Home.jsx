import { Link } from '../lib/router.jsx';
import { useFetch, useDocumentTitle } from '../lib/hooks.js';
import { useI18n } from '../context/I18nContext.jsx';
import site from '../site.js';
import SearchBar from '../components/layout/SearchBar.jsx';
import ItemCard from '../components/catalog/ItemCard.jsx';
import CategoryGrid from '../components/catalog/CategoryGrid.jsx';
import ContactButtons from '../components/ContactButtons.jsx';
import { GridSkeleton, Skeleton } from '../components/ui/Skeleton.jsx';
import { ErrorState } from '../components/ui/States.jsx';
import { useWikiImage } from '../lib/useWikiImage.js';

export default function Home() {
  const { t, tx } = useI18n();
  useDocumentTitle(null, tx(site.text.heroText));
  const info = useFetch('/api/site');
  const popular = useFetch('/api/items?sort=popular&limit=8');
  const newest = useFetch('/api/items?sort=new&limit=4');
  const heroWiki = useWikiImage(site.heroWiki, 1600);
  const heroImg = !site.heroWiki ? site.heroImage : heroWiki === undefined ? '' : (heroWiki || site.heroImage);

  return (
    <>
      <section className="hero" style={{ '--hero-img': heroImg ? `url("${heroImg}")` : 'none' }}>
        <div className="container hero__inner">
          <span className="pill">{site.logo} {tx(site.text.tagline)}</span>
          <h1>{tx(site.text.heroTitle)}</h1>
          <p className="hero__lead">{tx(site.text.heroText)}</p>
          <SearchBar big />
          <div className="row hero__ctas">
            <Link to="/catalog" className="btn btn--primary btn--lg">{tx(site.text.catalog)} →</Link>
            <Link to="/booking" className="btn btn--light btn--lg">{tx(site.text.booking)}</Link>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="stats-strip">
          {(site.stats || []).map((s) => (
            <div key={tx(s.label)} className="stats-strip__item"><b>{s.value}</b><span>{tx(s.label)}</span></div>
          ))}
        </div>
      </div>

      <section className="section container">
        <div className="section__head"><h2 className="section__title">{t('home.categories')}</h2><Link to="/catalog" className="btn btn--ghost">{t('home.seeAll')} →</Link></div>
        {info.loading ? <div className="cat-grid">{site.categories.map((c) => <Skeleton key={c.id} h={170} r={18} />)}</div>
          : info.error ? <ErrorState error={info.error} onRetry={info.reload} compact />
            : <CategoryGrid categories={info.data.categories} />}
      </section>

      <section className="section section--tinted">
        <div className="container">
          <div className="section__head"><h2 className="section__title">{t('home.popular')}</h2><Link to="/catalog" className="btn btn--ghost">{t('home.seeAll')} →</Link></div>
          {popular.loading ? <GridSkeleton count={8} /> : popular.error ? <ErrorState error={popular.error} onRetry={popular.reload} />
            : <div className="grid grid--cards">{popular.data.items.map((x) => <ItemCard key={x.id} item={x} />)}</div>}
        </div>
      </section>

      <section className="section container">
        <h2 className="section__title">{t('home.why')}</h2>
        <div className="grid grid--4 features">
          {(site.features || []).map((f) => (
            <div key={tx(f.title)} className="card feature">
              <span className="feature__icon" aria-hidden="true">{f.icon}</span>
              <h3>{tx(f.title)}</h3>
              <p className="muted">{tx(f.text)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--tinted">
        <div className="container">
          <div className="section__head"><h2 className="section__title">{t('home.newest')}</h2><Link to="/catalog?sort=new" className="btn btn--ghost">{t('home.seeAll')} →</Link></div>
          {newest.loading ? <GridSkeleton count={4} /> : newest.error ? <ErrorState error={newest.error} onRetry={newest.reload} />
            : <div className="grid grid--cards">{newest.data.items.map((x) => <ItemCard key={x.id} item={x} />)}</div>}
        </div>
      </section>

      <section className="section cta-band">
        <div className="container cta-band__inner">
          <div>
            <h2>{t('home.ctaTitle')}</h2>
            <p>{t('home.ctaText')}</p>
          </div>
          <ContactButtons />
        </div>
      </section>
    </>
  );
}

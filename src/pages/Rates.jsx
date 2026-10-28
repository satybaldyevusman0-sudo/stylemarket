// Тышкы ачык API: валюта курстары (сервер аркылуу проксиленет, кэштелет).
import { useState } from 'react';
import { useFetch, useDocumentTitle } from '../lib/hooks.js';
import { useI18n } from '../context/I18nContext.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { RowsSkeleton } from '../components/ui/Skeleton.jsx';
import { ErrorState } from '../components/ui/States.jsx';

const flags = { KGS: '🇰🇬', KZT: '🇰🇿', RUB: '🇷🇺', EUR: '🇪🇺', CNY: '🇨🇳', TRY: '🇹🇷', UZS: '🇺🇿', AED: '🇦🇪', GBP: '🇬🇧', JPY: '🇯🇵' };

export default function Rates() {
  const { t } = useI18n();
  useDocumentTitle(t('rates.title'));
  const { data, error, loading, reload } = useFetch('/api/external/rates');
  const [amount, setAmount] = useState(100);
  return (
    <>
      <PageHeader title={t('rates.title')} subtitle={t('rates.subtitle')} />
      <section className="container section narrow">
        {loading ? <RowsSkeleton rows={8} /> : error ? <ErrorState error={error} onRetry={reload} /> : (
          <div className="stack-lg">
            <label className="filter"><span>{t('rates.amount')}</span>
              <input type="number" min="0" value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))} />
            </label>
            <div className="rates">
              {Object.entries(data.rates).map(([cur, rate]) => (
                <div key={cur} className="card rate">
                  <span className="rate__flag">{flags[cur] || '💱'}</span>
                  <b>{cur}</b>
                  <span className="rate__val">{rate.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}</span>
                  <small className="muted">{amount} USD = {(rate * amount).toLocaleString('ru-RU', { maximumFractionDigits: 2 })} {cur}</small>
                </div>
              ))}
            </div>
            <p className="muted small">{t('rates.updated')}: {data.updated} · {t('common.source')}: <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer">ExchangeRate-API ↗</a></p>
          </div>
        )}
      </section>
    </>
  );
}

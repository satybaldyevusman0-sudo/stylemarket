// Бронь: күн → бош убакыт → маалымат. Тексттер темага жараша.
import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Link, useQuery } from '../lib/router.jsx';
import { useFetch, useDocumentTitle } from '../lib/hooks.js';
import { check } from '../lib/validators.js';
import { fmtDate } from '../lib/format.js';
import { useI18n } from '../context/I18nContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import site from '../site.js';
import PageHeader from '../components/layout/PageHeader.jsx';
import FormField from '../components/ui/FormField.jsx';
import NotifyResult from '../components/forms/NotifyResult.jsx';
import { Alert, errorText } from '../components/ui/States.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';

const isoLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const formats = site.booking?.formats || [{ id: 'online', label: { ky: 'Онлайн', ru: 'Онлайн', en: 'Online' } }];

export default function Booking() {
  const { t, tx, lang } = useI18n();
  const { user } = useAuth();
  const [query] = useQuery();
  useDocumentTitle(tx(site.text.booking));
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const max = new Date(); max.setDate(max.getDate() + 90);
  const [v, setV] = useState({ date: '', time: '', format: formats[0].id, people: site.booking?.people ? 1 : '', name: user?.name || '', phone: '+996 ', email: user?.email || '', topic: '', itemId: query.item || '' });
  const [errors, setErrors] = useState({});
  useEffect(() => { if (user) setV((x) => ({ ...x, name: x.name || user.name, email: x.email || user.email })); }, [user]);
  const [state, setState] = useState({ busy: false, done: null, error: null });
  const isSunday = v.date && site.booking?.sundayOff !== false && new Date(v.date + 'T00:00:00').getDay() === 0;
  const slots = useFetch(v.date && !isSunday ? `/api/bookings/slots?date=${v.date}` : null);
  const items = useFetch('/api/items?limit=60&sort=name');
  const on = (k) => (e) => setV({ ...v, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!user) return;
    const errs = check(v, { date: ['required'], time: ['required'], name: ['required', { min: 2 }], phone: ['required', 'phone'], email: ['required', 'email'] }, t);
    if (isSunday) errs.date = t('bk.sunday');
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState({ busy: true, done: null, error: null });
    try {
      const body = { ...v, people: v.people === '' ? undefined : Number(v.people), itemId: v.itemId || undefined };
      const r = await api('/api/bookings', { method: 'POST', body });
      setState({ busy: false, done: r, error: null });
    } catch (err) {
      setErrors(err.details || {});
      setState({ busy: false, done: null, error: err });
      slots.reload();
    }
  };

  return (
    <>
      <PageHeader title={tx(site.text.booking)} subtitle={tx(site.text.bookingText)} />
      <section className="container section narrow">
        {state.done ? (
          <div className="card success">
            <div className="success__icon">📅</div>
            <h2>{t('bk.done')}</h2>
            <p><b>{fmtDate(state.done.item.date, lang)} · {state.done.item.time}</b> — {tx(formats.find((f) => f.id === state.done.item.format)?.label)}</p>
            {state.done.item.itemTitle && <p>{state.done.item.itemTitle}</p>}
            <NotifyResult notify={state.done.notify} />
            <div className="row center"><Link className="btn btn--primary" to="/profile">{t('prof.bookings')}</Link></div>
          </div>
        ) : (
          <form className="card form" onSubmit={submit} noValidate>
            {!user && <Alert type="warn">{t('auth.needLogin')} — <Link to="/login?next=/booking">{t('nav.login')}</Link></Alert>}
            {state.error && <Alert type="error">{errorText(state.error, t)}</Alert>}
            <FormField label={tx(site.booking?.itemLabel) || t('bk.item')} name="b-item">
              <select id="f-b-item" value={v.itemId} onChange={on('itemId')}>
                <option value="">—</option>
                {(items.data?.items || []).map((x) => <option key={x.id} value={x.id}>{tx(x.title)}</option>)}
              </select>
            </FormField>
            <div className="form__row">
              <FormField label={t('bk.date')} name="b-date" type="date" min={isoLocal(tomorrow)} max={isoLocal(max)} value={v.date}
                onChange={(e) => setV({ ...v, date: e.target.value, time: '' })} error={errors.date || (isSunday ? t('bk.sunday') : null)} />
              <FormField label={t('bk.format')} name="b-format">
                <select id="f-b-format" value={v.format} onChange={on('format')}>
                  {formats.map((f) => <option key={f.id} value={f.id}>{tx(f.label)}</option>)}
                </select>
              </FormField>
              {site.booking?.people && <FormField label={t('bk.people')} name="b-people" type="number" min={1} max={50} value={v.people} onChange={on('people')} error={errors.people} />}
            </div>
            <div className={`field ${errors.time ? 'field--error' : ''}`}>
              <span className="field__label">{t('bk.time')}</span>
              {!v.date || isSunday ? <p className="muted small">{t('bk.chooseDate')}</p>
                : slots.loading ? <div className="slots">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} w={72} h={40} />)}</div>
                  : slots.error ? <Alert type="error">{errorText(slots.error, t)}</Alert>
                    : (
                      <div className="slots" role="radiogroup">
                        {slots.data.slots.map((s) => (
                          <button type="button" key={s.time} role="radio" aria-checked={v.time === s.time} disabled={!s.free}
                            className={`slot ${v.time === s.time ? 'active' : ''}`} onClick={() => setV({ ...v, time: s.time })}>
                            {s.time}{!s.free && <small>{t('bk.busy')}</small>}
                          </button>
                        ))}
                      </div>
                    )}
              {errors.time && <small className="field__error">{errors.time}</small>}
            </div>
            <div className="form__row">
              <FormField label={t('co.name')} name="b-name" value={v.name} onChange={on('name')} error={errors.name} autoComplete="name" />
              <FormField label={t('co.phone')} name="b-phone" type="tel" value={v.phone} onChange={on('phone')} error={errors.phone} autoComplete="tel" />
            </div>
            <FormField label={t('co.email')} name="b-email" type="email" value={v.email} onChange={on('email')} error={errors.email} autoComplete="email" />
            <FormField label={t('bk.topic')} name="b-topic" as="textarea" rows={3} value={v.topic} onChange={on('topic')} error={errors.topic} maxLength={500} />
            <button className="btn btn--primary btn--lg" disabled={state.busy || !user}>{state.busy ? t('common.loading') : t('bk.submit')}</button>
          </form>
        )}
      </section>
    </>
  );
}

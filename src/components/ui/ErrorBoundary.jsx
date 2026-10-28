import { Component } from 'react';
import { translations } from '../../i18n/translations.js';

// React Error Boundary — бир бөлүктөгү ката бүт сайтты бузбайт.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  componentDidUpdate(prev) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    let lang = 'ky';
    try { lang = JSON.parse(localStorage.getItem('lang')) || 'ky'; } catch { /* default */ }
    const t = (k) => translations[lang]?.[k] || translations.ky[k];
    return (
      <div className="state state--error container section" role="alert">
        <div className="state__icon">🛠️</div>
        <h3>{t('eb.title')}</h3>
        <p>{t('eb.text')}</p>
        <button className="btn btn--primary" onClick={() => window.location.reload()}>{t('eb.reload')}</button>
      </div>
    );
  }
}

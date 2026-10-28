import { useI18n } from '../../context/I18nContext.jsx';

// Навигациядагы пункттун тексти: котормо ачкычы же {ky,ru,en}
export default function NavText({ item }) {
  const { t, tx } = useI18n();
  return item.key ? t(item.key) : tx(item.label);
}

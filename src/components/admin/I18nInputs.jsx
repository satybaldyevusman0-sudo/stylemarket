// ky/ru/en үч тилдеги текст талаалары
import FormField from '../ui/FormField.jsx';

export default function I18nInputs({ label, name, value = {}, onChange, error, textarea = true }) {
  return (
    <fieldset className="i18n-inputs">
      <legend>{label}</legend>
      {['ky', 'ru', 'en'].map((l) => (
        <FormField key={l} label={l.toUpperCase()} name={`${name}-${l}`} as={textarea ? 'textarea' : 'input'} rows={2}
          value={value[l] || ''} onChange={(e) => onChange({ ...value, [l]: e.target.value })} error={l === 'ky' ? error : undefined} />
      ))}
    </fieldset>
  );
}

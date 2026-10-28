// Форма талаасы: label, ката жана жардамчы текст менен.
export default function FormField({ label, name, error, hint, as = 'input', children, ...props }) {
  const id = `f-${name}`;
  const Tag = as;
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      {label && <label htmlFor={id}>{label}</label>}
      {children || <Tag id={id} name={name} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...props} />}
      {hint && !error && <small className="field__hint">{hint}</small>}
      {error && <small className="field__error" id={`${id}-err`}>{error}</small>}
    </div>
  );
}

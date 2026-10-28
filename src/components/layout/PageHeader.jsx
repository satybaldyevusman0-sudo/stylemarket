export default function PageHeader({ title, subtitle, children }) {
  return (
    <section className="page-header">
      <div className="container">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}

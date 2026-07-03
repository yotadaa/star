export default function PageHeader({ label, title, children }) {
  return (
    <header className="page-head">
      <span className="pixel-label">{label}</span>
      <h1>{title}</h1>
      {children && (typeof children === "string" ? <p>{children}</p> : children)}
    </header>
  );
}

const VARIANTS = {
  brand: 'badge-brand',
  slate: 'badge-slate',
}

export default function Badge({ variant = 'slate', children }) {
  return <span className={VARIANTS[variant] || VARIANTS.slate}>{children}</span>
}

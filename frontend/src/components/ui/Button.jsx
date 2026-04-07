const VARIANTS = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  'danger-solid': 'btn-danger-solid',
}

export default function Button({
  variant = 'primary',
  block = false,
  className = '',
  type = 'button',
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`${VARIANTS[variant] || VARIANTS.primary} ${block ? 'btn-block' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

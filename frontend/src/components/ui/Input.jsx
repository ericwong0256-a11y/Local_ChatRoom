import { forwardRef } from 'react'

const Input = forwardRef(function Input({ label, error, className = '', ...rest }, ref) {
  if (label) {
    return (
      <label className="block">
        <span className="label">{label}</span>
        <input ref={ref} className={`input mt-1 ${className}`} {...rest} />
        {error && <span className="field-error mt-1 block">{error}</span>}
      </label>
    )
  }
  return <input ref={ref} className={`input ${className}`} {...rest} />
})

export default Input

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  description?: string
  containerClassName?: string
  rightElement?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      description,
      containerClassName = '',
      rightElement,
      className = '',
      id,
      name,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? name

    return (
      <div className={containerClassName}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            name={name}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error
                ? `${inputId}-error`
                : description
                  ? `${inputId}-description`
                  : undefined
            }
            className={[
              'w-full rounded-lg border px-3 py-2 text-sm',
              'outline-none transition',
              'focus:ring-2 focus:ring-gray-900',
              rightElement ? 'pr-10' : '',
              error
                ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                : 'border-gray-200 focus:border-transparent',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />

          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightElement}
            </div>
          )}
        </div>

        {error ? (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-red-500">
            {error}
          </p>
        ) : description ? (
          <p
            id={`${inputId}-description`}
            className="mt-1 text-xs text-gray-500"
          >
            {description}
          </p>
        ) : null}
      </div>
    )
  },
)

Input.displayName = 'Input'

export default Input
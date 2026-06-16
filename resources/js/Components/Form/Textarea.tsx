import { forwardRef, type TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  description?: string
  containerClassName?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      description,
      containerClassName = '',
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
          <textarea
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
              'w-full rounded-lg border px-3 py-2 text-sm min-h-[120px]',
              'outline-none transition',
              'focus:ring-2 focus:ring-gray-900',
              error
                ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                : 'border-gray-200 focus:border-transparent',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />
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

Textarea.displayName = 'Textarea'

export default Textarea

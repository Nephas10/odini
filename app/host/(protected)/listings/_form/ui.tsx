import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react"

// Shared building blocks for the listing form, so every field looks and behaves the same.

export function inputClass(hasError?: boolean) {
  return `w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7A1F2B] focus:ring-2 focus:ring-[#7A1F2B]/15 ${
    hasError ? "border-red-300" : "border-gray-200"
  }`
}

// A label, the input, then a hint or the error message underneath
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required ? <span className="text-[#7A1F2B]"> *</span> : <span className="font-normal text-gray-400"> (optional)</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string
  label: string
  hint?: string
  errors?: Record<string, string>
}

// Text, number, time or date input with its label and error
export function Input({ name, label, hint, errors, required, ...rest }: InputProps) {
  const error = errors?.[name]
  return (
    <Field label={label} htmlFor={name} hint={hint} error={error} required={required}>
      <input id={name} name={name} className={inputClass(!!error)} aria-invalid={!!error} {...rest} />
    </Field>
  )
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  name: string
  label: string
  hint?: string
  errors?: Record<string, string>
}

export function TextArea({ name, label, hint, errors, required, rows = 3, ...rest }: TextAreaProps) {
  const error = errors?.[name]
  return (
    <Field label={label} htmlFor={name} hint={hint} error={error} required={required}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        className={`${inputClass(!!error)} resize-y`}
        aria-invalid={!!error}
        {...rest}
      />
    </Field>
  )
}

// A titled group of fields, e.g. "The basics" or "Stay details"
export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  )
}

// Tick-box chips, used for amenities and days of the week
export function CheckChips({
  name,
  options,
  defaultValues = [],
}: {
  name: string
  options: { value: string; label: string }[]
  defaultValues?: string[]
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <label key={option.value} className="cursor-pointer">
          <input
            type="checkbox"
            name={name}
            value={option.value}
            defaultChecked={defaultValues.includes(option.value)}
            className="peer sr-only"
          />
          <span className="inline-block rounded-full border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-700 transition peer-checked:border-[#7A1F2B] peer-checked:bg-[#7A1F2B] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#7A1F2B]/30 hover:border-[#7A1F2B]/50">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  )
}

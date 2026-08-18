import { useTranslation } from 'react-i18next'

// Signup.jsx / EditProfile.jsx가 함께 쓰는 폼 프리미티브 (동일한 사용자 프로필 필드셋을 다룸).
export const inputClass =
  'w-full rounded-xl border-2 border-background-200 bg-background-100 px-4 py-3 text-sm text-foreground-950 placeholder-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-500'
export const selectClass = `${inputClass} appearance-none pr-8`
export const labelClass = 'mb-1 block text-sm text-foreground-600'

export function useBooleanOptions() {
  const { t } = useTranslation()
  return [
    { value: true, label: t('enums.boolean.true') },
    { value: false, label: t('enums.boolean.false') },
  ]
}

export function FieldWrapper({ label, children }) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      {children}
    </div>
  )
}

export function SelectField({ label, name, value, onChange, options, placeholder }) {
  const { t } = useTranslation()
  return (
    <FieldWrapper label={label}>
      <div className="relative">
        <select id={name} name={name} value={value} onChange={onChange} required className={selectClass}>
          <option value="">{placeholder ?? t('common.select')}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground-400">▾</span>
      </div>
    </FieldWrapper>
  )
}

export function PillGroup({ label, value, onChange, options, columns = 2 }) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className={`grid gap-2 ${columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {options.map((option) => {
          const selected = value === option.value
          return (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-xl py-3 text-sm font-medium ${
                selected
                  ? 'bg-primary-500 text-white'
                  : 'border-2 border-background-200 bg-background-50 text-foreground-800'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
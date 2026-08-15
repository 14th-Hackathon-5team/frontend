export function localizeOptions(options, prefix, t) {
  return options.map((option) => ({
    ...option,
    label: t(`${prefix}.${option.value}`, { defaultValue: option.label }),
  }))
}

export function localizeSortedOptions(options, prefix, t, locale) {
  return localizeOptions(options, prefix, t).sort((a, b) => a.label.localeCompare(b.label, locale))
}

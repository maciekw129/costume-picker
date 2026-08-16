const NAME_PATTERN = /^[\p{L}\p{N} .\-'’]+$/u

export function normalizeName(raw: string): { key: string; display: string } | null {
  const trimmed = raw.trim().replace(/\s+/g, ' ')
  if (trimmed.length === 0 || trimmed.length > 30) return null
  if (!NAME_PATTERN.test(trimmed)) return null
  const key = trimmed.toLocaleLowerCase('pl')
  const display = trimmed.replace(
    /(^\p{L}|(?<=[\s\-'’])\p{L})/gu,
    (c) => c.toLocaleUpperCase('pl'),
  )
  return { key, display }
}

/** SQLite의 시간대 없는 ISO 시각은 UTC로 해석하고 날짜 전용 값은 유지한다. */
export function apiTimestamp(value: string): string {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(value) ? `${value}Z` : value
}

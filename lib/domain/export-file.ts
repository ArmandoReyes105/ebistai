// "ebistai-aplicaciones-2026-10-29.xlsx", dated with the browser's local day.
export function exportFileName(now: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0")
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  return `ebistai-aplicaciones-${date}.xlsx`
}

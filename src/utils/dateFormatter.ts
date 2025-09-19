export function formatDateTimeLocal(d: Date) {
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n)
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const min = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

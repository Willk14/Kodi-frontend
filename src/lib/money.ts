/**
 * Money is a decimal STRING end-to-end. No parseFloat / Number() anywhere.
 */
const DECIMAL_RE = /^(-?)(\d+)(?:\.(\d+))?$/;

export function isDecimalLike(v: unknown): v is string {
  return typeof v === "string" && DECIMAL_RE.test(v.trim());
}

/** "1234567.5" -> "KES 1,234,567.5". Returns the input unchanged if not a decimal string. */
export function formatKes(value: string): string {
  const m = DECIMAL_RE.exec(value.trim());
  if (!m) return value;
  const [, sign = "", int = "0", frac] = m;
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `KES ${sign}${grouped}${frac !== undefined ? `.${frac}` : ""}`;
}

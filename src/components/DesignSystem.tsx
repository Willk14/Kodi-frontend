import { formatKes } from "@/lib/money";

export function Money({ value, className = "" }: { value: string; className?: string }) {
  return <span className={`money ${className}`.trim()}>{formatKes(value)}</span>;
}
export function PhoneNumber({ value, masked = false }: { value: string; masked?: boolean }) {
  const digits = value.replace(/\D/g, "");
  if (!/^254\d{9}$/.test(digits)) return <span>{value}</span>;
  return <span>{masked ? `+254 ••• ••${digits.slice(-3)}` : `+254 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`}</span>;
}
export function ReceiptCode({ value }: { value: string | null }) {
  return value ? <code className="receipt-code">{value}</code> : <span>—</span>;
}
export function DateTimeEAT({ value }: { value: string | null }) {
  if (!value) return <span>—</span>;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return <span>{value}</span>;
  return <time dateTime={value}>{new Intl.DateTimeFormat("en-KE", { timeZone: "Africa/Nairobi", dateStyle: "medium", timeStyle: "short" }).format(date)} EAT</time>;
}

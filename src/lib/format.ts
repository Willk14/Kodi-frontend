const EAT = "Africa/Nairobi";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;

export const looksLikeDate = (v: string) => ISO_DATE.test(v);
export const looksLikeDateTime = (v: string) => ISO_DATETIME.test(v);

/** Date-only values are formatted in UTC so they never shift a day. */
export function formatDate(iso: string): string {
  if (!ISO_DATE.test(iso)) return iso;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeZone: "UTC" }).format(d);
}

/** Timestamps are shown in East Africa Time. Stored values are untouched. */
export function formatDateTime(iso: string): string {
  if (!ISO_DATETIME.test(iso)) return iso;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short", timeZone: EAT }).format(d)} EAT`;
}

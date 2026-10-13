import type { FieldSpec } from "./api/contract";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PHONE_RE = /^254\d{9}$/;

export const isUuid = (v: string) => UUID_RE.test(v.trim());
export const isKenyanPhone = (v: string) => PHONE_RE.test(v.trim());

export function isDecimalString(v: string, maxDecimals = 2): boolean {
  const re = new RegExp(`^(?:\\d+|\\d{1,3}(?:,\\d{3})+)(\\.\\d{1,${maxDecimals}})?$`);
  return re.test(v.trim());
}

export function isPositiveDecimal(v: string, maxDecimals = 2): boolean {
  return isDecimalString(v, maxDecimals) && /[1-9]/.test(v);
}

export function isIsoDate(v: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

export function validateField(spec: FieldSpec, raw: string): string | null {
  const v = raw.trim();
  if (!v) return spec.required ? `${spec.label} is required.` : null;
  switch (spec.kind) {
    case "uuid":
      return isUuid(v) ? null : "Must be a valid UUID.";
    case "phone":
      return (spec.pattern ?? /^254\d{9}$/).test(v) ? null : "Use the format 254XXXXXXXXX (e.g. 254712345678).";
    case "decimal": {
      const dp = spec.maxDecimals ?? 2;
      if (!isDecimalString(v, dp)) return `Enter an amount with at most ${dp} decimal places. Use commas only as thousands separators.`;
      if (spec.min === "0" ? !/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(v) : !isPositiveDecimal(v, dp)) return "Must be a nonnegative amount.";
      if (spec.maxDigits) {
        const [whole = "0", fraction = ""] = v.replaceAll(",", "").split(".");
        const digits = Math.max(whole.replace(/^0+/, "").length + fraction.length, fraction.length || 1);
        if (digits > spec.maxDigits) return `At most ${spec.maxDigits} digits.`;
      }
      return null;
    }
    case "date":
      return isIsoDate(v) ? null : "Use a valid date (YYYY-MM-DD).";
    case "text":
      if (spec.maxLength && v.length > spec.maxLength) return `At most ${spec.maxLength} characters.`;
      return null;
  }
}

export function validateAll(specs: FieldSpec[], values: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const s of specs) {
    const e = validateField(s, values[s.name] ?? "");
    if (e) errors[s.name] = e;
  }
  return errors;
}

/**
 * Builds a JSON body. Empty values are OMITTED (the backend rejects null /
 * unknown fields). For PATCH pass `initial` so only changed fields are sent.
 */
export function buildPayload(
  specs: FieldSpec[],
  values: Record<string, string>,
  initial?: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const s of specs) {
    const v = (values[s.name] ?? "").trim();
    if (!v) continue;
    if (initial && (initial[s.name] ?? "").trim() === v) continue;
    out[s.name] = s.kind === "decimal" ? v.replaceAll(",", "") : v;
  }
  return out;
}

export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  readonly status: number;
  readonly detail: unknown;
  readonly fieldErrors: FieldErrors;
  readonly retryAfter?: string;

  constructor(status: number, detail: unknown, retryAfter?: string) {
    super(ApiError.describe(status, detail));
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.retryAfter = retryAfter;
    this.fieldErrors = ApiError.extractFieldErrors(detail);
  }

  get isAuth(): boolean {
    return this.status === 401;
  }

  /** FastAPI 422: detail = [{ loc: ["body", "field"], msg, type }] */
  static extractFieldErrors(detail: unknown): FieldErrors {
    const out: FieldErrors = {};
    if (!Array.isArray(detail)) return out;
    for (const item of detail) {
      if (item && typeof item === "object") {
        const { loc, msg } = item as { loc?: unknown; msg?: unknown };
        if (Array.isArray(loc) && typeof msg === "string") {
          const field = String(loc[loc.length - 1] ?? "");
          if (field && !(field in out)) out[field] = msg;
        }
      }
    }
    return out;
  }

  static detailText(detail: unknown): string | null {
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const parts = detail
        .map((d) => (d && typeof d === "object" ? (d as { msg?: unknown }).msg : null))
        .filter((m): m is string => typeof m === "string");
      return parts.length ? parts.join("; ") : null;
    }
    return null;
  }

  static describe(status: number, detail: unknown): string {
    const text = ApiError.detailText(detail);
    switch (status) {
      case 0:
        return "Could not reach the KodiLedger API. Check your connection and try again.";
      case 401:
        return "Your session has expired or is invalid. Please sign in again.";
      case 403:
        return "You do not have permission to do this.";
      case 404:
        return "That record was not found.";
      case 409:
        return text ?? "This conflicts with the current state of the record (it may already have been changed).";
      case 422:
        return text ?? "Some values were rejected. Please check the form.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 502:
      case 503:
        return "The service is temporarily unavailable. Please try again shortly.";
      case 500:
        return "Something went wrong on the server. Please try again.";
      default:
        return text ?? `Request failed (HTTP ${status}).`;
    }
  }
}

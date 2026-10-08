// Next.js only inlines NEXT_PUBLIC_* when accessed as static property reads.
export const config = {
  apiBaseUrl: (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, ""),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
} as const;

/** All backend routes live under this prefix (docs: "All API paths are under /api/v1"). */
export const API_PREFIX = "/api/v1";

export function missingConfig(): string[] {
  const missing: string[] = [];
  if (!config.apiBaseUrl) missing.push("NEXT_PUBLIC_API_BASE_URL");
  if (!config.supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!config.supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return missing;
}

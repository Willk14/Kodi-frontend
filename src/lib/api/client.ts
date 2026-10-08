import { API_PREFIX } from "@/lib/config";
import { ApiError } from "./errors";

export type QueryValue = string | number | boolean | null | undefined;
export type Query = Record<string, QueryValue>;

export interface ApiClientOptions {
  baseUrl: string;
  /** Returns the CURRENT access token (refreshed by the auth layer) or null. */
  getToken: () => Promise<string | null>;
  /** Called on 401 so the auth layer can clear the session. */
  onUnauthorized?: () => void;
  fetchImpl?: typeof fetch;
}

export interface RequestOptions {
  query?: Query;
  body?: unknown;
  signal?: AbortSignal;
}

export interface ApiClient {
  get<T>(path: string, opts?: Omit<RequestOptions, "body">): Promise<T>;
  post<T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "body">): Promise<T>;
  patch<T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "body">): Promise<T>;
}

export function buildUrl(baseUrl: string, path: string, query?: Query): string {
  const url = `${baseUrl.replace(/\/+$/, "")}${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue;
    params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

export function createApiClient(opts: ApiClientOptions): ApiClient {
  async function request<T>(method: string, path: string, ro: RequestOptions = {}): Promise<T> {
    const token = await opts.getToken();
    if (!token) {
      opts.onUnauthorized?.();
      throw new ApiError(401, "Not signed in");
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };
    const init: RequestInit = { method, headers, signal: ro.signal };
    if (ro.body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(ro.body);
    }

    const doFetch = opts.fetchImpl ?? fetch;
    let res: Response;
    try {
      res = await doFetch(buildUrl(opts.baseUrl, path, ro.query), init);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") throw err;
      throw new ApiError(0, null);
    }

    if (res.status === 204) return undefined as T;

    let data: unknown = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }

    if (!res.ok) {
      if (res.status === 401) opts.onUnauthorized?.();
      const detail =
        data && typeof data === "object" && "detail" in data ? (data as { detail: unknown }).detail : null;
      throw new ApiError(res.status, detail, res.headers.get("Retry-After") ?? undefined);
    }
    return data as T;
  }

  return {
    get: (path, o) => request("GET", path, o),
    post: (path, body, o) => request("POST", path, { ...o, body: body ?? {} }),
    patch: (path, body, o) => request("PATCH", path, { ...o, body: body ?? {} }),
  };
}

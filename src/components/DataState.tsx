"use client";

import type { ReactNode } from "react";
import { ApiError } from "@/lib/api/errors";
import type { LoadState } from "@/hooks/useLoad";

export function ErrorPanel({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  const status = error instanceof ApiError ? error.status : undefined;
  return (
    <div role="alert" className="panel panel-error">
      <strong>{status === 403 ? "Not permitted" : status === 404 ? "Not found" : "Something went wrong"}</strong>
      <p>{error.message}</p>
      {status === 429 && error instanceof ApiError && error.retryAfter && (
        <p className="muted">Retry after {error.retryAfter}s.</p>
      )}
      {onRetry && status !== 403 && status !== 404 && (
        <button type="button" className="btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function DataState<T>(props: {
  state: LoadState<T>;
  onRetry?: () => void;
  isEmpty?: (data: T) => boolean;
  emptyTitle?: string;
  emptyHint?: string;
  children: (data: T) => ReactNode;
}) {
  const { state } = props;
  if (state.status === "loading") {
    return (
      <div role="status" aria-live="polite" className="panel skeleton">
        Loading…
      </div>
    );
  }
  if (state.status === "error") return <ErrorPanel error={state.error} onRetry={props.onRetry} />;
  if (props.isEmpty?.(state.data)) {
    return (
      <div className="panel panel-empty">
        <strong>{props.emptyTitle ?? "Nothing here yet"}</strong>
        {props.emptyHint && <p className="muted">{props.emptyHint}</p>}
      </div>
    );
  }
  return <>{props.children(state.data)}</>;
}

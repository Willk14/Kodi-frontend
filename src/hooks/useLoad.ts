"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api/errors";

export type LoadState<T> =
  | { status: "loading" }
  | { status: "error"; error: ApiError | Error }
  | { status: "success"; data: T };

/** Runs `loader` on mount and whenever `deps` change; `reload()` re-runs it. */
export function useLoad<T>(loader: () => Promise<T>, deps: readonly unknown[]) {
  const [state, setState] = useState<LoadState<T>>({ status: "loading" });
  const [tick, setTick] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });
    loaderRef
      .current()
      .then((data) => active && setState({ status: "success", data }))
      .catch((error: unknown) => {
        if (!active) return;
        setState({ status: "error", error: error instanceof Error ? error : new Error("Unexpected error") });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { state, reload };
}

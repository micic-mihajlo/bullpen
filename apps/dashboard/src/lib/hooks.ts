"use client";

import { useEffect, useState } from "react";

/**
 * Caches the last defined value from a Convex useQuery result.
 * Prevents skeleton flash on navigation/refetch — only returns
 * undefined on the very first load, then always returns latest data.
 */
export function useStableData<T>(queryResult: T | undefined): T | undefined {
  const [cached, setCached] = useState<T | undefined>(undefined);
  useEffect(() => {
    if (queryResult !== undefined) {
      setCached(queryResult); // eslint-disable-line react-hooks/set-state-in-effect -- intentional: caches last defined query result
    }
  }, [queryResult]);
  return queryResult !== undefined ? queryResult : cached;
}

/**
 * Returns the current timestamp, updated every `intervalMs` (default 1000).
 * Use instead of Date.now() in render to avoid impure function calls.
 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

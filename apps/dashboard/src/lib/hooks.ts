"use client";

import { useRef } from "react";

/**
 * Caches the last defined value from a Convex useQuery result.
 * Prevents skeleton flash on navigation/refetch — only returns
 * undefined on the very first load, then always returns latest data.
 */
export function useStableData<T>(queryResult: T | undefined): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  if (queryResult !== undefined) {
    ref.current = queryResult;
  }
  return ref.current;
}

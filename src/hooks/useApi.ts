import { useState, useEffect, useCallback } from "react";
import { cacheManager } from "../lib/cache";

interface UseApiOptions {
  cacheKey?: string;
  cacheTTL?: number;
  dependencies?: unknown[];
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  options: UseApiOptions = {}
) {
  const { cacheKey, cacheTTL, dependencies = [] } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(
    async (force: boolean = false) => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        if (cacheKey && !force) {
          const cached = cacheManager.get<T>(cacheKey, cacheTTL);
          if (cached) {
            setData(cached);
            setLoading(false);
            return;
          }
        }

        // Fetch fresh data
        const result = await fetcher();
        setData(result);

        // Cache the result
        if (cacheKey) {
          cacheManager.set(cacheKey, result, cacheTTL);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred"));
      } finally {
        setLoading(false);
      }
    },
    [fetcher, cacheKey, cacheTTL]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData, dependencies]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return { data, loading, error, refetch };
}

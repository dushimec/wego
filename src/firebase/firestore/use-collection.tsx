"use client";

import { useEffect, useState } from "react";
import type { Query, DocumentData } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";

export type WithId<T> = T & { id: string };
export type UseCollectionResult<T> = {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error?: Error | null;
};
export type InternalQuery = Query<DocumentData> | null;

/**
 * Minimal client-side hook to subscribe to a Firestore Query.
 * This is a light, resilient implementation intended to recover the project
 * when the `.tsx` files are missing. It mirrors the common shape used by the app:
 * { data, isLoading, error } where data is an array of documents with `id`.
 */
export function useCollection<T = any>(query: InternalQuery): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!query);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query || typeof query === 'function') {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const unsubscribe = onSnapshot(
        query,
        (snapshot) => {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as T) }));
          setData(items);
          setIsLoading(false);
        },
        (err) => {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
    }
  }, [query]);

  return { data, isLoading, error };
}

export default useCollection;

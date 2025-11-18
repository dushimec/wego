"use client";

import { useEffect, useState } from "react";
import type { DocumentData, DocumentReference } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";

export type UseDocResult<T> = {
  data: (T & { id: string }) | null;
  isLoading: boolean;
  error?: Error | null;
};

export function useDoc<T = any>(ref: DocumentReference<DocumentData> | null): UseDocResult<T> {
  const [data, setData] = useState<(T & { id: string }) | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!ref);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref || typeof ref === 'function') {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const unsubscribe = onSnapshot(
        ref,
        (snapshot) => {
          if (!snapshot.exists()) {
            setData(null);
          } else {
            setData({ id: snapshot.id, ...(snapshot.data() as T) });
          }
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
  }, [ref]);

  return { data, isLoading, error };
}

export default useDoc;

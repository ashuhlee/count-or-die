import { useCallback, useEffect, useRef } from "react";

// returns the timer, in case a caller wants to cancel it early
export type Later = (
  callback: () => void,
  ms: number,
) => ReturnType<typeof setTimeout>;

export function useTimeouts(): Later {
  const ids = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = ids.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  return useCallback((callback, ms) => {
    const id = setTimeout(() => {
      ids.current.delete(id);
      callback();
    }, ms);
    ids.current.add(id);
    return id;
  }, []);
}

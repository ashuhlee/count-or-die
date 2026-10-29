import { useCallback, useEffect, useRef } from "react";

// a setTimeout that is cleared when the component goes away
export function useTimeouts() {
  const ids = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = ids.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  return useCallback((callback: () => void, ms: number) => {
    const id = setTimeout(() => {
      ids.current.delete(id);
      callback();
    }, ms);
    ids.current.add(id);
    return id;
  }, []);
}

import { useCallback, useEffect, useRef } from "react";

// Restarts a CSS animation that is switched on by a class: take the class
// off, let the browser notice, put it back. For elements that cannot simply
// be remounted (the whole game screen, or text that is mid-animation).
export function useReplayAnimation<Element extends HTMLElement>(
  className: string,
) {
  const ref = useRef<Element>(null);

  const replay = useCallback(() => {
    const element = ref.current;
    if (!element) return;

    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }, [className]);

  return [ref, replay] as const;
}

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

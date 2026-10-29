import { useCallback, useRef } from "react";

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

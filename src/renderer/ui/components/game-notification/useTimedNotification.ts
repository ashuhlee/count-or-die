import { useCallback, useEffect, useRef, useState } from "react";

export const SHOWN_FOR = 4000;
export const EXIT = 200;

export function useTimedNotification(shownFor = SHOWN_FOR) {
  const [shown, setShown] = useState<{ id: number; leaving: boolean } | null>(
    null,
  );
  const nextId = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => clear, [clear]);

  const show = useCallback(() => {
    clear();
    setShown({ id: nextId.current++, leaving: false });
    timers.current = [
      setTimeout(
        () => setShown((current) => current && { ...current, leaving: true }),
        shownFor,
      ),
      setTimeout(() => setShown(null), shownFor + EXIT),
    ];
  }, [clear, shownFor]);

  return { shown, show };
}

import { useEffect, useState } from "react";

export function useFps(every = 500): number {
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let frames = 0;
    let since = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      frames++;
      const elapsed = now - since;
      if (elapsed >= every) {
        setFps(Math.round((frames * 1000) / elapsed));
        frames = 0;
        since = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [every]);

  return fps;
}

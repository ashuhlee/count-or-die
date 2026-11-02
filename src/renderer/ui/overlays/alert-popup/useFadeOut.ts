import { useEffect, useState } from "react";

export function useFadeOut(open: boolean, ms: number): boolean {
  const [wasOpen, setWasOpen] = useState(open);
  const [lingering, setLingering] = useState(false);

  if (open !== wasOpen) {
    setWasOpen(open);
    setLingering(!open);
  }

  useEffect(() => {
    if (!lingering) return;
    const timer = setTimeout(() => setLingering(false), ms);
    return () => clearTimeout(timer);
  }, [lingering, ms]);

  return open || lingering;
}

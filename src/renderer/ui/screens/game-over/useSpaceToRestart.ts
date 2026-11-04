import { useEffect, useState } from "react";

import { useGame } from "../../../provider/useGame.ts";

const GRACE = 800;

export function useSpaceToRestart(shown: boolean): void {
  const { actions, loading } = useGame();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!shown) return;

    const timer = setTimeout(() => setArmed(true), GRACE);
    return () => {
      clearTimeout(timer);
      setArmed(false);
    };
  }, [shown]);

  useEffect(() => {
    if (!armed || loading.mounted) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== " " || event.repeat) return;
      if (event.target instanceof HTMLButtonElement) return;
      actions.restartFromGameOver();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [armed, loading.mounted, actions]);
}

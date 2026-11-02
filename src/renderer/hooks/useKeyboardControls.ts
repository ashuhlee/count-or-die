import { useEffect } from "react";

import { useGame } from "../provider/useGame.ts";
import { handleKeydown } from "./handleKeydown.ts";

export function useKeyboardControls(): void {
  const { actions, ready, screen } = useGame();

  useEffect(() => {
    if (!ready) return;

    // only Escape works outside of the game
    const playing = screen === "game";
    const onKeyDown = (event: KeyboardEvent) =>
      handleKeydown(event, {
        onIncrease: () => playing && actions.increase(),
        onBoost: () => playing && actions.boost(),
      });

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [actions, ready, screen]);
}

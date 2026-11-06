import { useEffect } from "react";

import { useGame } from "../provider/useGame.ts";
import { handleKeydown } from "./handleKeydown.ts";

export function useKeyboardControls(onEscape: () => void): void {
  const { actions, ready, screen, paused, loading } = useGame();

  useEffect(() => {
    if (!ready) return;

    const playing = screen === "game";
    const onKeyDown = (event: KeyboardEvent) => {
      if (paused && event.key === "Escape") return;

      handleKeydown(event, {
        onEscape,
        onIncrease: () => playing && actions.increase(),
        onBoost: () => playing && actions.boost(),
        onStart: () =>
          screen === "menu" &&
          !loading.mounted &&
          !paused &&
          !(event.target instanceof HTMLButtonElement) &&
          actions.play(),
      });
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [actions, ready, screen, paused, loading.mounted, onEscape]);
}

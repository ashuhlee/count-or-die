import { useEffect } from "react";

import { useGame } from "../provider/GameProvider.tsx";
import { handleKeydown } from "./handleKeydown.ts";

export function useKeyboardControls(): void {
  const { actions } = useGame();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) =>
      handleKeydown(event, {
        onIncrease: () => actions.increase(),
        onBoost: () => actions.boost(),
      });

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [actions]);
}

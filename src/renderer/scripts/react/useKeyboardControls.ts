import { useEffect } from "react";

import { handleKeydown } from "../controls/keyHandler.ts";
import { gameControls } from "./gameControls.ts";

export default function useKeyboardControls(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) =>
      handleKeydown(event, {
        onIncrease: () => gameControls.increase(),
        onBoost: () => gameControls.boost(),
      });

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
}

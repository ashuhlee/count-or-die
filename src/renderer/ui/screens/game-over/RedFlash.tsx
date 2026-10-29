import { useState } from "react";

import { useGame } from "../../../provider/useGame.ts";
import { useGameEvent } from "../../../provider/useGameEvent.ts";

// the whole screen flashes red: slowly for game over, quickly for a penalty
export default function RedFlash() {
  const { actions } = useGame();
  const [flash, setFlash] = useState<"flash" | "flash-penalty" | null>(null);

  useGameEvent("gameOver", () => setFlash("flash"));
  useGameEvent("penalty", () => setFlash("flash-penalty"));

  return (
    <div
      id="red-flash"
      className={flash ?? undefined}
      onAnimationEnd={() => {
        setFlash(null);
        actions.emit({ type: "flashEnded" });
      }}
    ></div>
  );
}

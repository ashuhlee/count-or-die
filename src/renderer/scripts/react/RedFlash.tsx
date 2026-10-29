import { useSyncExternalStore } from "react";

import { gameOverStore } from "./gameOverStore.ts";

export default function RedFlash() {
  const { flash } = useSyncExternalStore(
    gameOverStore.subscribe,
    gameOverStore.getSnapshot,
  );

  return (
    <div
      id="red-flash"
      className={flash ?? undefined}
      onAnimationEnd={gameOverStore.endFlash}
    ></div>
  );
}

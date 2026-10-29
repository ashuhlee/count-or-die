import { useSyncExternalStore } from "react";

import { highScoreStore } from "./highScoreStore.ts";

export default function HighScore() {
  const { score, isNew } = useSyncExternalStore(
    highScoreStore.subscribe,
    highScoreStore.getSnapshot,
  );

  return (
    <h1
      id="high-score"
      className={`animate__animated${isNew ? " new-score" : ""}`}
    >
      {`high score: ${score}`}
    </h1>
  );
}

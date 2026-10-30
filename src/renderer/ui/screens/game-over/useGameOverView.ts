import { useRef, useState } from "react";

import { pickGameOverPhrase } from "../../../game/phrases.ts";
import { formatCounter } from "../../../utils/formatCounter.ts";
import { useGameEvent } from "../../../provider/useGameEvent.ts";

export function useGameOverView() {
  const [view, setView] = useState({
    visible: false,
    background: false,
    phrase: "you died lolz",
    rainbow: false,
    scoreText: "score: 0",
  });
  const waitingForFlash = useRef(false);

  useGameEvent("gameOver", ({ isHighScore, score }) => {
    waitingForFlash.current = true;
    setView((current) => ({
      ...current,
      background: true,
      phrase: pickGameOverPhrase(isHighScore, Math.random()),
      rainbow: current.rainbow || isHighScore,
      scoreText: `Score: ${formatCounter(score)}`,
    }));
  });

  useGameEvent("flashEnded", () => {
    if (!waitingForFlash.current) return;

    waitingForFlash.current = false;
    setView((current) => ({ ...current, visible: true }));
  });

  useGameEvent("restarted", () => {
    waitingForFlash.current = false;
    setView((current) => ({
      ...current,
      visible: false,
      background: false,
      rainbow: false,
      phrase: pickGameOverPhrase(false, Math.random()),
    }));
  });

  return view;
}

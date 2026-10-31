import { useEffect, useRef, useState } from "react";

import type { GameState } from "../game/gameReducer.ts";
import type { BarStage } from "./useGame.ts";

// how far into a round the bar changes color
const STAGE_AT = [0.495, 0.695, 0.845];
const TIME_UP_AT = 0.995;

export function useCountdown(
  { round, roundSeconds, isGameOver }: GameState,
  onTimeUp: () => void,
  ready = true,
): BarStage {
  const [reached, setReached] = useState({ round: 0, stage: 0 });

  const latestOnTimeUp = useRef(onTimeUp);
  useEffect(() => {
    latestOnTimeUp.current = onTimeUp;
  });

  useEffect(() => {
    if (isGameOver || !ready) return;

    const ms = roundSeconds * 1000;
    const timers = STAGE_AT.map((at, index) =>
      setTimeout(() => setReached({ round, stage: index + 1 }), at * ms),
    );
    timers.push(setTimeout(() => latestOnTimeUp.current(), TIME_UP_AT * ms));

    return () => timers.forEach(clearTimeout);
  }, [round, roundSeconds, isGameOver, ready]);

  return (reached.round === round ? reached.stage : 0) as BarStage;
}

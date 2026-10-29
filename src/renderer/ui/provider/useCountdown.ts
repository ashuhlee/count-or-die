import { useEffect, useRef, useState } from "react";

import type { GameState } from "../../game/gameReducer.ts";
import type { BarStage } from "./useGame.ts";

// how far into a round the bar changes color, and when time is up, as a
// fraction of the round. The bar reads whole percents, so these sit half a
// percent before the round numbers.
const STAGE_AT = [0.495, 0.695, 0.845];
const TIME_UP_AT = 0.995;

// The round's clock. Gives back which color the countdown bar should be, and
// calls `onTimeUp` when the round runs out. It starts over whenever the rules
// start a new round, and stops once the game is over.
export function useCountdown(
  { round, roundSeconds, isGameOver }: GameState,
  onTimeUp: () => void,
): BarStage {
  const [reached, setReached] = useState({ round: 0, stage: 0 });

  const latestOnTimeUp = useRef(onTimeUp);
  useEffect(() => {
    latestOnTimeUp.current = onTimeUp;
  });

  useEffect(() => {
    if (isGameOver) return;

    const ms = roundSeconds * 1000;
    const timers = STAGE_AT.map((at, index) =>
      setTimeout(() => setReached({ round, stage: index + 1 }), at * ms),
    );
    timers.push(setTimeout(() => latestOnTimeUp.current(), TIME_UP_AT * ms));

    return () => timers.forEach(clearTimeout);
  }, [round, roundSeconds, isGameOver]);

  // a stage reached in an earlier round does not count
  return (reached.round === round ? reached.stage : 0) as BarStage;
}

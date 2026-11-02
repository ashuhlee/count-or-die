import { useEffect, useRef, useState } from "react";

import type { GameState } from "../game/gameLogic.ts";
import type { BarStage } from "./useGame.ts";

// how far into a round the bar changes color
const STAGE_AT = [0.495, 0.695, 0.845];
const TIME_UP_AT = 0.995;

export function useCountdown(
  { round, roundSeconds, isGameOver }: GameState,
  onTimeUp: () => void,
  ready = true,
  paused = false,
): BarStage {
  const [reached, setReached] = useState({ round: 0, stage: 0 });

  const latestOnTimeUp = useRef(onTimeUp);
  useEffect(() => {
    latestOnTimeUp.current = onTimeUp;
  });

  const clock = useRef({ key: "", elapsed: 0 });

  useEffect(() => {
    if (isGameOver || !ready || paused) return;

    const key = `${round}-${roundSeconds}`;
    if (clock.current.key !== key) clock.current = { key, elapsed: 0 };

    const ms = roundSeconds * 1000;
    const left = (at: number) => Math.max(0, at * ms - clock.current.elapsed);
    const startedAt = Date.now();

    const timers = STAGE_AT.map((at, index) =>
      setTimeout(() => setReached({ round, stage: index + 1 }), left(at)),
    );
    timers.push(setTimeout(() => latestOnTimeUp.current(), left(TIME_UP_AT)));

    return () => {
      clock.current.elapsed += Date.now() - startedAt;
      timers.forEach(clearTimeout);
    };
  }, [round, roundSeconds, isGameOver, ready, paused]);

  return (reached.round === round ? reached.stage : 0) as BarStage;
}

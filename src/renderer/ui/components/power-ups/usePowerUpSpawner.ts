import { useCallback, useEffect, useRef, useState } from "react";

import { MAX_BOOSTS } from "../../../game/gameLogic.ts";
import { availablePowerUps, choosePowerUp } from "../../../game/powerUps.ts";
import { useGame } from "../../../provider/useGame.ts";
import { useGameEvent } from "../../../provider/useGameEvent.ts";
import type { ClockTimer } from "../../../game/gameClock.ts";
import type { Falling } from "./FallingPowerUp.tsx";

const MIN_WAIT = 6000;
const MAX_WAIT = 12000;

// Sends power-ups down the screen: one after a wait, then the next wait starts
// once it has been collected or has fallen off the screen
export function usePowerUpSpawner() {
  const { state, actions, ready, clock } = useGame();
  const [falling, setFalling] = useState<Falling[]>([]);

  // the timer reads this when it fires, not when it was started
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
  });

  const nextId = useRef(0);
  const timer = useRef<ClockTimer>(undefined);

  const spawn = useCallback(() => {
    const options = availablePowerUps(
      latest.current.boostsAvailable,
      MAX_BOOSTS,
    );
    const { type } = choosePowerUp(options, Math.random());

    setFalling((current) => [
      ...current,
      {
        id: nextId.current++,
        type,
        fall: Math.random() < 0.5 ? "falling" : "falling-reverse",
        side: Math.random() < 0.5 ? "left" : "right",
        xRand: Math.random(),
      },
    ]);
  }, []);

  const waitForNext = useCallback(() => {
    clock.cancel(timer.current);

    timer.current = clock.after(
      () => {
        timer.current = undefined;
        if (!latest.current.isGameOver) spawn();
      },
      Math.random() * (MAX_WAIT - MIN_WAIT) + MIN_WAIT,
    );
  }, [clock, spawn]);

  useEffect(() => {
    if (!ready) return;
    waitForNext();
    return () => clock.cancel(timer.current);
  }, [clock, waitForNext, ready]);

  useGameEvent("restarted", () => {
    setFalling([]);
    waitForNext();
  });

  const remove = (id: number) =>
    setFalling((current) => current.filter((item) => item.id !== id));

  return {
    falling,

    collect(collected: Falling, rect: DOMRect) {
      remove(collected.id);
      actions.collectPowerUp(collected.type);
      actions.emit({
        type: "powerUpPicked",
        powerUp: collected.type,
      });
      actions.emit({
        type: "smoke",
        x: rect.left + 20,
        y: rect.top + 30,
      });
      waitForNext();
    },

    miss(missed: Falling) {
      remove(missed.id);
      waitForNext();
    },
  };
}

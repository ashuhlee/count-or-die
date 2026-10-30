import { useEffect, useRef, useState } from "react";

import { MAX_BOOSTS } from "../../../game/gameReducer.ts";
import { useTimeouts } from "../../../hooks/useTimeouts.ts";
import { useGame } from "../../../provider/useGame.ts";
import { useGameEvent } from "../../../provider/useGameEvent.ts";

// how long between each heart coming back from a power-up
const RESTORE_STAGGER = 150;

// where the smoke puff goes relative to a heart that just came back
const RESTORE_SMOKE_OFFSET = { x: -30, y: -36 };

type Slots = { used: boolean[]; restoring: boolean[] };

// the hearts on the right are the first to go
function slotsFor(boostsAvailable: number): Slots {
  return {
    used: Array.from({ length: MAX_BOOSTS }, (_, i) => i >= boostsAvailable),
    restoring: Array.from({ length: MAX_BOOSTS }, () => false),
  };
}

// What each heart looks like: gone, coming back, or there. A heart goes when
// a boost is used and comes back with a power-up (one after the other), both
// with a puff of smoke.
export function useHeartSlots() {
  const { state, actions } = useGame();
  const boosts = state.boostsAvailable;

  const [slots, setSlots] = useState(() => slotsFor(boosts));

  const later = useTimeouts();
  const slotElements = useRef<(HTMLDivElement | null)[]>([]);
  const previous = useRef(boosts);

  const smokeAt = (index: number, offset = { x: 0, y: 0 }) => {
    const rect = slotElements.current[index]?.getBoundingClientRect();
    if (!rect) return;

    actions.emit({
      type: "smoke",
      kind: "heart",
      x: rect.left + offset.x,
      y: rect.top + offset.y,
    });
  };

  // the puff goes where the heart is now: once the last boost is used, the "no
  // boosts left!" text pushes the hearts down
  useGameEvent("boostNotification", () => smokeAt(previous.current - 1));

  useEffect(() => {
    const before = previous.current;
    previous.current = boosts;

    // a boost was used: its heart goes
    if (boosts < before) {
      setSlots((current) => ({ ...current, used: slotsFor(boosts).used }));
      return;
    }

    // a power-up: the missing hearts come back one after the other
    for (let index = before; index < boosts; index++) {
      const delay = (index - before) * RESTORE_STAGGER;

      later(() => {
        // a boost used since then keeps its heart gone
        if (index >= previous.current) return;

        setSlots((current) => ({
          used: current.used.map((used, i) => (i === index ? false : used)),
          restoring: current.restoring.map((r, i) => (i === index ? true : r)),
        }));
        smokeAt(index, RESTORE_SMOKE_OFFSET);
      }, delay);
    }
    // smokeAt only reads refs and emits events
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [boosts]);

  return {
    slots,
    // so a heart can be asked where it is on screen
    slotRef: (index: number) => (element: HTMLDivElement | null) => {
      slotElements.current[index] = element;
    },
    // the "coming back" animation is over
    finishRestoring: (index: number) =>
      setSlots((current) => ({
        ...current,
        restoring: current.restoring.map((r, i) => (i === index ? false : r)),
      })),
  };
}

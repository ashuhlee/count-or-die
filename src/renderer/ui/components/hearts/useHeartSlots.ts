import { useEffect, useRef, useState } from "react";

import { MAX_BOOSTS } from "../../../game/gameReducer.ts";
import { useTimeouts } from "../../../hooks/useTimeouts.ts";
import { useGame } from "../../../provider/useGame.ts";
import { useGameEvent } from "../../../provider/useGameEvent.ts";

// how long between each heart coming back from a power-up
const RESTORE_STAGGER = 150;

type Slots = { used: boolean[]; restoring: boolean[] };

function slotsFor(boostsAvailable: number): Slots {
  return {
    used: Array.from({ length: MAX_BOOSTS }, (_, i) => i >= boostsAvailable),
    restoring: Array.from({ length: MAX_BOOSTS }, () => false),
  };
}

export function liveSlots(boosts: number, slots: Slots): Slots {
  const used = slots.used.map((isUsed, index) => isUsed || index >= boosts);
  return {
    used,
    restoring: slots.restoring.map((r, index) => r && !used[index]),
  };
}

export function useHeartSlots() {
  const { state, actions } = useGame();
  const boosts = state.boostsAvailable;

  const [slots, setSlots] = useState(() => slotsFor(boosts));

  const later = useTimeouts();
  const slotElements = useRef<(HTMLDivElement | null)[]>([]);
  const previous = useRef(boosts);

  useGameEvent("boostNotification", () => {
    const rect =
      slotElements.current[previous.current - 1]?.getBoundingClientRect();
    if (rect) actions.emit({ type: "smoke", x: rect.left, y: rect.top });
  });

  useEffect(() => {
    const before = previous.current;
    previous.current = boosts;
    if (boosts < before) {
      setSlots((current) => {
        const { used } = slotsFor(boosts);
        return {
          used,
          restoring: current.restoring.map((r, i) => r && !used[i]),
        };
      });
      return;
    }

    // a power-up: the missing hearts come back one after the other
    for (let index = before; index < boosts; index++) {
      const delay = (index - before) * RESTORE_STAGGER;

      later(() => {
        if (index >= previous.current) return;

        setSlots((current) => ({
          used: current.used.map((used, i) => (i === index ? false : used)),
          restoring: current.restoring.map((r, i) => (i === index ? true : r)),
        }));
      }, delay);
    }
  }, [boosts]);

  return {
    slots: liveSlots(boosts, slots),
    slotRef: (index: number) => (element: HTMLDivElement | null) => {
      slotElements.current[index] = element;
    },
    finishRestoring: (index: number) =>
      setSlots((current) => ({
        ...current,
        restoring: current.restoring.map((r, i) => (i === index ? false : r)),
      })),
  };
}

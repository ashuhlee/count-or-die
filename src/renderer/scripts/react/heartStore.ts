import smokeGif from "@assets/ui/deco/smoke.gif";

import { cycleThemeColor } from "./goalStore.ts";

export const HEART_COUNT = 4;

const RESTORE_STAGGER = 150;
const SMOKE_DURATION = 3000;

type HeartSlot = { used: boolean; restoring: boolean };
type HeartsState = { slots: HeartSlot[]; noBoosts: boolean };

const listeners = new Set<() => void>();
let state = createInitialState();

function createInitialState(): HeartsState {
  return {
    slots: Array.from({ length: HEART_COUNT }, () => ({
      used: false,
      restoring: false,
    })),
    noBoosts: false,
  };
}

function setState(next: Partial<HeartsState>): void {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function setSlot(index: number, next: Partial<HeartSlot>): void {
  setState({
    slots: state.slots.map((slot, i) =>
      i === index ? { ...slot, ...next } : slot,
    ),
  });
}

// React side: read the state
export const heartStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => state,
  endRestore(index: number) {
    if (state.slots[index]?.restoring) setSlot(index, { restoring: false });
  },
  reset() {
    state = createInitialState();
    listeners.forEach((listener) => listener());
  },
};

// the smoke popup is a shared element (also used by powerUps), so it is still
// positioned by hand over the heart's on-screen rect
function addUseEffect(boostsLeft: number, powerUp = false): void {
  const target = document.getElementById(`boost-${boostsLeft + 1}`);
  const popupElement = document.getElementById(
    "popupElement",
  ) as HTMLImageElement;

  const rect = target.getBoundingClientRect();

  const smokeWidth = 70;
  const smokeHeight = 70;

  const xOffset = -30;
  const yOffset = -36;

  popupElement.style.left = `${powerUp ? rect.left + xOffset : rect.left}px`;
  popupElement.style.top = `${powerUp ? rect.top + yOffset : rect.top}px`;

  popupElement.style.width = `${smokeWidth}px`;
  popupElement.style.height = `${smokeHeight}px`;

  // display smoke effect
  popupElement.src = "";
  popupElement.src = `${smokeGif}?t=${Date.now()}`;

  popupElement.style.display = "block";
  popupElement.style.zIndex = `2`;

  setTimeout(() => {
    popupElement.style.display = "none";
  }, SMOKE_DURATION);
}

// vanilla side: same functions the game code already calls
export function removeHeart(boostsLeft: number): void {
  const index = boostsLeft;
  if (!state.slots[index]) return;

  setSlot(index, { used: true });
  addUseEffect(boostsLeft);

  if (boostsLeft === 0) {
    setState({ noBoosts: true });
    // the shake letters used to advance the shared color cycle too
    cycleThemeColor();
  }
}

export function replenishHearts(boostsLeft: number, powerUpType: string): void {
  let restoreCount = 0;

  for (let i = 1; i <= boostsLeft; i++) {
    if (!state.slots[i - 1]?.used) continue;

    const delay =
      powerUpType === "replenish_boosts" && restoreCount > 0
        ? restoreCount * RESTORE_STAGGER
        : 0;
    restoreCount++;

    setTimeout(() => {
      setSlot(i - 1, { used: false, restoring: true });
      addUseEffect(i - 1, true);
    }, delay);
  }

  if (boostsLeft > 0) setState({ noBoosts: false });
}

export function resetHearts(): void {
  setState({
    slots: state.slots.map((slot) => ({ ...slot, used: false })),
    noBoosts: false,
  });
}

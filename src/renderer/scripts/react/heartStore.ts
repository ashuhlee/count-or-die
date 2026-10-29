import { cycleThemeColor } from "./goalStore.ts";
import { showSmoke } from "./smokeStore.ts";

export const HEART_COUNT = 4;

const RESTORE_STAGGER = 150;

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

// puff of smoke over the heart's on-screen position
function addUseEffect(boostsLeft: number, powerUp = false): void {
  const target = document.getElementById(`boost-${boostsLeft + 1}`);
  const rect = target.getBoundingClientRect();

  const xOffset = -30;
  const yOffset = -36;

  showSmoke(
    "popupElement",
    powerUp ? rect.left + xOffset : rect.left,
    powerUp ? rect.top + yOffset : rect.top,
  );
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

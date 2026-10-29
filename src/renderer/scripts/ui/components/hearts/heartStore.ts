import { createStore } from "../../createStore.ts";

import { cycleThemeColor } from "../goal/goalStore.ts";
import { showSmoke } from "../smoke/smokeStore.ts";

const HEART_COUNT = 4;

const RESTORE_STAGGER = 150;

type HeartSlot = { used: boolean; restoring: boolean };
type HeartsState = { slots: HeartSlot[]; noBoosts: boolean };

const store = createStore(createInitialState());

function createInitialState(): HeartsState {
  return {
    slots: Array.from({ length: HEART_COUNT }, () => ({
      used: false,
      restoring: false,
    })),
    noBoosts: false,
  };
}

function setSlot(index: number, next: Partial<HeartSlot>): void {
  store.patch({
    slots: store
      .getSnapshot()
      .slots.map((slot, i) => (i === index ? { ...slot, ...next } : slot)),
  });
}

// For the components: the state
export const heartStore = {
  subscribe: store.subscribe,
  getSnapshot: store.getSnapshot,
  endRestore(index: number) {
    if (store.getSnapshot().slots[index]?.restoring)
      setSlot(index, { restoring: false });
  },
  reset() {
    store.set(createInitialState());
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

// For the game code: use up, restore and reset the hearts
export function removeHeart(boostsLeft: number): void {
  const index = boostsLeft;
  if (!store.getSnapshot().slots[index]) return;

  setSlot(index, { used: true });
  addUseEffect(boostsLeft);

  if (boostsLeft === 0) {
    store.patch({ noBoosts: true });
    // the shake letters used to advance the shared color cycle too
    cycleThemeColor();
  }
}

export function replenishHearts(boostsLeft: number, powerUpType: string): void {
  let restoreCount = 0;

  for (let i = 1; i <= boostsLeft; i++) {
    if (!store.getSnapshot().slots[i - 1]?.used) continue;

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

  if (boostsLeft > 0) store.patch({ noBoosts: false });
}

export function resetHearts(): void {
  store.patch({
    slots: store.getSnapshot().slots.map((slot) => ({ ...slot, used: false })),
    noBoosts: false,
  });
}

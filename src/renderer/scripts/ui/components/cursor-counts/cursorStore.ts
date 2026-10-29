import { createStore } from "../../createStore.ts";

const COLORS = ["#E8E3F8", "#83d0ff", "#ae9eff", "#FF98E1"];
const PLAIN_COLOR = "#FFFFFF";

export type CursorCount = {
  id: number;
  value: number;
  x: number;
  y: number;
  color: string;
  isBoosted: boolean;
  xPos: number;
  rotateDeg: number;
};

const store = createStore<CursorCount[]>([]);
let nextId = 0;
let boostIndex = 0;

function cycleColor(isBoosted: boolean): string {
  if (!isBoosted) return PLAIN_COLOR;

  const color = COLORS[boostIndex];
  boostIndex = (boostIndex + 1) % COLORS.length;
  return color;
}

// For the components: the floating counts, and removing one once it finishes
export const cursorStore = {
  subscribe: store.subscribe,
  getSnapshot: store.getSnapshot,
  remove(id: number) {
    store.set(store.getSnapshot().filter((count) => count.id !== id));
  },
};

// For the game code: float a +N where the player clicked
export function displayCursorCount(
  value: number,
  event?: MouseEvent,
  isBoosted = false,
): void {
  store.set([
    ...store.getSnapshot(),
    {
      id: nextId++,
      value,
      x: event.clientX,
      y: event.clientY,
      color: cycleColor(isBoosted),
      isBoosted,
      xPos: (Math.random() - 0.5) * 70,
      rotateDeg: (Math.random() - 0.5) * 50,
    },
  ]);
}

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

const listeners = new Set<() => void>();
let counts: CursorCount[] = [];
let nextId = 0;
let boostIndex = 0;

function setCounts(next: CursorCount[]): void {
  counts = next;
  listeners.forEach((listener) => listener());
}

function cycleColor(isBoosted: boolean): string {
  if (!isBoosted) return PLAIN_COLOR;

  const color = COLORS[boostIndex];
  boostIndex = (boostIndex + 1) % COLORS.length;
  return color;
}

// React side: read the floating counts and remove them once they finish
export const cursorStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => counts,
  remove(id: number) {
    setCounts(counts.filter((count) => count.id !== id));
  },
};

// vanilla side: same function the game code already calls
export function displayCursorCount(
  value: number,
  event?: MouseEvent,
  isBoosted = false,
): void {
  setCounts([
    ...counts,
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

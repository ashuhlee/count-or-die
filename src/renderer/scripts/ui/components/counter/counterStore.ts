import { playAnimation } from "../../../anim/animations.ts";

type CounterElements = {
  text: SVGElement | null;
  outer: SVGElement | null;
  shine: SVGElement | null;
};

const listeners = new Set<() => void>();
let value = 0;
let elements: CounterElements = { text: null, outer: null, shine: null };

export function formatCounter(counter: number): string {
  const absValue = Math.abs(counter).toString().padStart(2, "0");
  return counter < 0 ? `-${absValue}` : absValue;
}

// React side: read the value and hand over the elements to animate
export const counterStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => value,
  register(next: CounterElements) {
    elements = next;
  },
};

// vanilla side: same update/animate API the game code already calls
export const counter = {
  update(next: number): void {
    value = next;
    listeners.forEach((listener) => listener());
  },

  animate(className: string): void {
    Object.values(elements).forEach((element) => {
      if (element) playAnimation(element, className);
    });
  },
};

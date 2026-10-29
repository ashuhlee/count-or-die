import { createStore } from "../../createStore.ts";
import { playAnimation } from "../../../anim/animations.ts";

type CounterElements = {
  text: SVGElement | null;
  outer: SVGElement | null;
  shine: SVGElement | null;
};

const store = createStore(0);
let elements: CounterElements = { text: null, outer: null, shine: null };

export function formatCounter(counter: number): string {
  const absValue = Math.abs(counter).toString().padStart(2, "0");
  return counter < 0 ? `-${absValue}` : absValue;
}

// For the components: the value to show, and the elements to animate
export const counterStore = {
  subscribe: store.subscribe,
  getSnapshot: store.getSnapshot,
  register(next: CounterElements) {
    elements = next;
  },
};

// For the game code: change the value and play the counter's animations
export const counter = {
  update(next: number): void {
    store.set(next);
  },

  animate(className: string): void {
    Object.values(elements).forEach((element) => {
      if (element) playAnimation(element, className);
    });
  },
};

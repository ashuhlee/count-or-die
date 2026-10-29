import {
  act,
  createElement,
  type ComponentType,
  type ReactElement,
} from "react";
import { createRoot } from "react-dom/client";

export type Rendered = {
  container: HTMLDivElement;
  unmount: () => void;
};

// renders a component (or element) into a fresh div on the page
export function renderInto(component: ReactElement | ComponentType): Rendered {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);
  const node =
    typeof component === "function" ? createElement(component) : component;
  act(() => root.render(node));

  return {
    container,
    unmount() {
      act(() => root.unmount());
      container.remove();
    },
  };
}

// jsdom has no AnimationEvent, so React listens for the prefixed event name
const ANIMATION_END =
  "AnimationEvent" in window ? "animationend" : "webkitAnimationEnd";

// pretends an element's CSS animation just finished
export function fireAnimationEnd(element: Element): void {
  act(() => {
    element.dispatchEvent(new Event(ANIMATION_END, { bubbles: true }));
  });
}

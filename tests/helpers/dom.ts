import { vi } from "vite-plus/test";
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

const ANIMATION_END =
  "AnimationEvent" in window ? "animationend" : "webkitAnimationEnd";

export function fireAnimationEnd(
  element: Element,
  animationName?: string,
): void {
  const end = new Event(ANIMATION_END, { bubbles: true });
  if (animationName) Object.assign(end, { animationName });
  act(() => {
    element.dispatchEvent(end);
  });
}

export function stubWebAnimations() {
  const pending: Array<() => void> = [];
  const animate = vi.fn(() => ({
    addEventListener: (type: string, callback: () => void) => {
      if (type === "finish") pending.push(callback);
    },
    removeEventListener: () => {},
    cancel: () => {},
  }));

  Element.prototype.animate =
    animate as unknown as typeof Element.prototype.animate;

  return {
    animate,
    finishAll() {
      act(() => {
        pending.splice(0).forEach((finish) => finish());
      });
    },
    restore() {
      delete (Element.prototype as { animate?: unknown }).animate;
    },
  };
}

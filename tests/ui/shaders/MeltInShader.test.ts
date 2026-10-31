import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import MeltInShader from "../../../src/renderer/ui/shaders/melt-in-shader/MeltInShader.tsx";

// the setup file swaps this component for a plain image; these tests want the
// real one, and ask for reduced motion because jsdom has no WebGL, so it goes
// straight to its end state, the way it does for anyone who asks for that
vi.unmock("../../../src/renderer/ui/shaders/melt-in-shader/MeltInShader.tsx");

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  window.matchMedia = vi.fn(() => ({ matches: true })) as never;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const render = (props: { active: boolean; mode?: "in" | "out" }) =>
  act(() =>
    root.render(
      createElement(MeltInShader, { src: "title.gif", alt: "title", ...props }),
    ),
  );

// the plain image is wrapped in a div that hides it, and the glitch effect
// on the hearts adds its copies inside that div
const shown = () => {
  const plain = container.querySelector<HTMLElement>(".melt-in-shader > div");
  return plain.style.opacity === "1";
};

describe("melting in", () => {
  test("shows nothing until it is active, then the image", () => {
    render({ active: false });
    expect(shown()).toBe(false);

    render({ active: true });
    expect(shown()).toBe(true);
  });

  test("goes away again when it stops being active", () => {
    render({ active: true });
    render({ active: false });

    expect(shown()).toBe(false);
  });
});

describe("melting out", () => {
  test("shows the image until it is active, then it is gone", () => {
    render({ active: false, mode: "out" });
    expect(shown()).toBe(true);

    render({ active: true, mode: "out" });
    expect(shown()).toBe(false);
  });

  test("comes back when it stops being active", () => {
    render({ active: false, mode: "out" });
    render({ active: true, mode: "out" });
    render({ active: false, mode: "out" });

    expect(shown()).toBe(true);
  });

  test("is already gone if it first shows up active", () => {
    render({ active: true, mode: "out" });

    expect(shown()).toBe(false);
    expect(container.querySelector("canvas").style.display).toBe("none");
  });
});

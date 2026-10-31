import { afterEach, describe, expect, test } from "vite-plus/test";
import { createElement } from "react";

import { renderInto } from "../../helpers/dom.ts";

import PixelPanel from "../../../src/renderer/ui/components/pixel-panel/PixelPanel.tsx";

describe("PixelPanel", () => {
  let unmount: () => void;
  afterEach(() => unmount());

  const panel = (props: Record<string, unknown> = {}) => {
    const rendered = renderInto(
      createElement(PixelPanel, { border: "#bfb3ff", ...props }, "hi"),
    );
    unmount = rendered.unmount;
    return rendered.container.firstElementChild as HTMLElement;
  };

  test("renders the border color and leaves the opacities to the stylesheet", () => {
    const element = panel();
    expect(element.classList.contains("pixel-panel")).toBe(true);
    expect(element.style.getPropertyValue("--panel-border")).toBe("#bfb3ff");
    expect(element.style.getPropertyValue("--panel-accent")).toBe("");
    expect(element.style.getPropertyValue("--panel-dot-opacity")).toBe("");
    expect(element.style.getPropertyValue("--panel-shade")).toBe("");
    expect(element.style.getPropertyValue("--panel-shadow-height")).toBe("");
  });

  test("the dots and the inner shadow take their own opacity", () => {
    const element = panel({ dotOpacity: 0.6, shadowOpacity: 0.2 });
    expect(element.style.getPropertyValue("--panel-dot-opacity")).toBe("60%");
    expect(element.style.getPropertyValue("--panel-shade")).toBe("20%");
  });

  test("the dots and the inner shadow can have a color of their own", () => {
    const element = panel({ accent: "#bcbcd6" });
    expect(element.style.getPropertyValue("--panel-border")).toBe("#bfb3ff");
    expect(element.style.getPropertyValue("--panel-accent")).toBe("#bcbcd6");
  });

  test("the shadow's height is a share of the panel's height", () => {
    const element = panel({ shadowHeight: 0.25 });
    expect(element.style.getPropertyValue("--panel-shadow-height")).toBe("25%");
  });

  test("an opacity of 0 is honoured, and other props pass through", () => {
    const element = panel({
      as: "h2",
      id: "x",
      className: "mine",
      dotOpacity: 0,
    });
    expect(element.tagName).toBe("H2");
    expect(element.id).toBe("x");
    expect(element.className).toBe("pixel-panel mine");
    expect(element.style.getPropertyValue("--panel-dot-opacity")).toBe("0%");
  });
});

import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { createElement } from "react";

import { act } from "react";
import { renderInto } from "../../helpers/dom.ts";

import PixelButton from "../../../src/renderer/ui/components/pixel-button/PixelButton.tsx";

describe("PixelButton", () => {
  let unmount: () => void;
  afterEach(() => unmount());

  const button = (props: Record<string, unknown> = {}, text = "Play") => {
    const rendered = renderInto(
      createElement(PixelButton, { color: "#e8c0ff", ...props }, text),
    );
    unmount = rendered.unmount;
    return rendered.container.querySelector("button") as HTMLButtonElement;
  };

  test("is a button with its text in a label", () => {
    const element = button({}, "Report a bug");

    expect(element.type).toBe("button");
    expect(element.classList.contains("pixel-btn")).toBe(true);
    expect(element.querySelector(".pixel-btn-label").textContent).toBe(
      "Report a bug",
    );
  });

  test("takes the fill as its color and makes the rest from it", () => {
    const element = button();

    expect(element.style.getPropertyValue("--btn-fill")).toBe("#e8c0ff");
    for (const name of [
      "--px",
      "--btn-pad-y",
      "--btn-shade-rows",
      "--btn-outline",
      "--btn-highlight",
      "--btn-shade",
      "--btn-text-shadow",
    ]) {
      expect(element.style.getPropertyValue(name)).toBe("");
    }
  });

  test("can be given a size and colors of its own for each part", () => {
    const element = button({
      pixelSize: 6,
      paddingY: 2,
      shadeRows: 4,
      outline: "#111111",
      highlight: "#222222",
      shade: "#333333",
      textShadow: "#444444",
    });

    expect(element.style.getPropertyValue("--px")).toBe("6px");
    expect(element.style.getPropertyValue("--btn-pad-y")).toBe("2");
    expect(element.style.getPropertyValue("--btn-shade-rows")).toBe("4");
    expect(element.style.getPropertyValue("--btn-outline")).toBe("#111111");
    expect(element.style.getPropertyValue("--btn-highlight")).toBe("#222222");
    expect(element.style.getPropertyValue("--btn-shade")).toBe("#333333");
    expect(element.style.getPropertyValue("--btn-text-shadow")).toBe("#444444");
  });

  test("passes its other props on, and keeps its class next to yours", () => {
    const onClick = vi.fn();
    const element = button({ id: "go", className: "mine", onClick });

    expect(element.id).toBe("go");
    expect(element.className).toBe("pixel-btn mine");
    act(() => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

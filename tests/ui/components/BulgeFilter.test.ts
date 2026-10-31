import { afterEach, describe, expect, test } from "vite-plus/test";
import { createElement } from "react";

import { renderInto } from "../../helpers/dom.ts";

import BulgeFilter from "../../../src/renderer/ui/components/bulge/BulgeFilter.tsx";

describe("BulgeFilter", () => {
  let unmount: () => void;
  afterEach(() => unmount());

  const mount = (strength: number, area = 2) => {
    const rendered = renderInto(
      createElement(BulgeFilter, { id: "bulge-test", strength, area }),
    );
    unmount = rendered.unmount;
    return rendered.container;
  };

  test("defines a filter with the id it is given", () => {
    const container = mount(5);
    expect(container.querySelector("filter#bulge-test")).not.toBeNull();
  });

  test("bends the picture with a displacement map", () => {
    const container = mount(5);
    const map = container.querySelector("feImage");
    expect(map?.getAttribute("href")).toMatch(/^data:image\/png/);
    expect(map?.getAttribute("preserveAspectRatio")).toBe("none");

    const displace = container.querySelector("feDisplacementMap");
    expect(displace?.getAttribute("xChannelSelector")).toBe("R");
    expect(displace?.getAttribute("yChannelSelector")).toBe("G");
  });

  test("bends further the stronger it is", () => {
    const scale = (strength: number) => {
      const container = mount(strength);
      const value = container
        .querySelector("feDisplacementMap")
        ?.getAttribute("scale");
      unmount();
      return Number(value);
    };

    expect(scale(5)).toBeGreaterThan(scale(2));
    expect(scale(0)).toBe(0);
  });

  test("makes the lens as big as it is asked, centered on what it bends", () => {
    const filter = mount(5, 3).querySelector("filter");
    expect(filter?.getAttribute("x")).toBe("-100%");
    expect(filter?.getAttribute("y")).toBe("-100%");
    expect(filter?.getAttribute("width")).toBe("300%");
    expect(filter?.getAttribute("height")).toBe("300%");
  });

  test("a lens the size of what it bends adds nothing around it", () => {
    const filter = mount(5, 1).querySelector("filter");
    expect(filter?.getAttribute("x")).toBe("0%");
    expect(filter?.getAttribute("width")).toBe("100%");
  });

  test("reads the map as colors, not as light", () => {
    const container = mount(5);
    expect(
      container
        .querySelector("filter")
        ?.getAttribute("color-interpolation-filters"),
    ).toBe("sRGB");
  });
});

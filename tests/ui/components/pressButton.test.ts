import {
  afterEach,
  beforeEach,
  expect,
  describe,
  test,
  vi,
} from "vite-plus/test";
import {
  act,
  createElement,
  type ComponentType,
  type ReactElement,
} from "react";

import { renderInto } from "../../helpers/dom.ts";

import PressButton from "../../../src/renderer/scripts/ui/components/buttons/PressButton.tsx";
import {
  animateBtn,
  buttonStore,
} from "../../../src/renderer/scripts/ui/components/buttons/buttonStore.ts";

const makeOnClick = () => vi.fn<(event: MouseEvent) => void>();

describe("PressButton", () => {
  let container: HTMLDivElement;
  let unmount: () => void;
  const mount = (component: ReactElement | ComponentType) =>
    ({ container, unmount } = renderInto(component));
  let animate: ReturnType<typeof vi.fn>;
  let cancel: ReturnType<typeof vi.fn>;
  let onClick: ReturnType<typeof makeOnClick>;

  beforeEach(() => {
    vi.useFakeTimers();
    buttonStore.reset();
    cancel = vi.fn();
    animate = vi.fn(() => ({ cancel }));
    // jsdom has no Web Animations API
    Element.prototype.animate =
      animate as unknown as typeof Element.prototype.animate;
    onClick = makeOnClick();
    mount(
      createElement(PressButton, {
        type: "decrease",
        id: "decrease-img",
        alt: "boost-reg",
        normal: "normal.png",
        pressed: "pressed.png",
        onClick,
      }),
    );
  });

  afterEach(() => {
    unmount();
    delete (Element.prototype as { animate?: unknown }).animate;
    vi.useRealTimers();
  });

  const img = () => container.querySelector<HTMLImageElement>("#decrease-img");

  test("shows the normal image and forwards clicks", () => {
    expect(img().getAttribute("src")).toBe("normal.png");

    act(() => {
      img().dispatchEvent(
        new MouseEvent("click", { bubbles: true, clientX: 9 }),
      );
    });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect((onClick.mock.calls[0][0] as MouseEvent).clientX).toBe(9);
  });

  test("shows the pressed image for 100ms", () => {
    act(() => animateBtn("decrease"));
    expect(img().getAttribute("src")).toBe("pressed.png");

    act(() => vi.advanceTimersByTime(99));
    expect(img().getAttribute("src")).toBe("pressed.png");

    act(() => vi.advanceTimersByTime(1));
    expect(img().getAttribute("src")).toBe("normal.png");
  });

  test("a second press restarts the 100ms", () => {
    act(() => animateBtn("decrease"));
    act(() => vi.advanceTimersByTime(80));
    act(() => animateBtn("decrease"));
    act(() => vi.advanceTimersByTime(80));

    expect(img().getAttribute("src")).toBe("pressed.png");
    act(() => vi.advanceTimersByTime(20));
    expect(img().getAttribute("src")).toBe("normal.png");
  });

  test("only reacts to its own button", () => {
    act(() => animateBtn("increase"));
    expect(img().getAttribute("src")).toBe("normal.png");
  });

  test("a normal press does not shake", () => {
    act(() => animateBtn("decrease", false));

    expect(img().classList.contains("no-boosts-shake")).toBe(false);
    expect(animate).not.toHaveBeenCalled();
  });

  test("a disabled press shakes, flashes red and replays each time", () => {
    act(() => animateBtn("decrease", true));
    const first = img();

    expect(first.classList.contains("no-boosts-shake")).toBe(true);
    expect(animate).toHaveBeenCalledTimes(1);
    expect(animate.mock.calls[0][1]).toMatchObject({
      duration: 800,
      fill: "forwards",
    });

    act(() => animateBtn("decrease", true));
    expect(img()).not.toBe(first);
    expect(animate).toHaveBeenCalledTimes(2);
    expect(cancel).toHaveBeenCalledTimes(1);
  });
});

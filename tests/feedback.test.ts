import {
  afterEach,
  beforeEach,
  expect,
  describe,
  test,
  vi,
} from "vite-plus/test";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import PressButton from "../src/renderer/scripts/ui/buttons/PressButton.tsx";
import SmokePopups from "../src/renderer/scripts/ui/smoke/SmokePopups.tsx";
import {
  animateBtn,
  buttonStore,
} from "../src/renderer/scripts/ui/buttons/buttonStore.ts";
import {
  showSmoke,
  smokeStore,
} from "../src/renderer/scripts/ui/smoke/smokeStore.ts";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function mount(node: ReturnType<typeof createElement>) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(node));
}

function unmount() {
  act(() => root.unmount());
  container.remove();
}

const makeOnClick = () => vi.fn<(event: MouseEvent) => void>();

describe("PressButton", () => {
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

describe("SmokePopups", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    smokeStore.reset();
    mount(createElement(SmokePopups));
  });

  afterEach(() => {
    unmount();
    vi.useRealTimers();
  });

  const popup = (id: string) =>
    container.querySelector<HTMLImageElement>(`#${id}`);

  test("renders both popups hidden", () => {
    expect(popup("popupElement")).not.toBeNull();
    expect(popup("powerUpUsedElement")).not.toBeNull();
    expect(popup("popupElement").style.display).toBe("");
  });

  test("shows a 70px smoke puff at the position, then hides after 3s", () => {
    act(() => showSmoke("popupElement", 120, 340));

    const el = popup("popupElement");
    expect(el.style.display).toBe("block");
    expect(el.style.left).toBe("120px");
    expect(el.style.top).toBe("340px");
    expect(el.style.width).toBe("70px");
    expect(el.style.height).toBe("70px");
    expect(el.getAttribute("src")).toContain("smoke");
    expect(popup("powerUpUsedElement").style.display).toBe("");

    act(() => vi.advanceTimersByTime(2999));
    expect(el.style.display).toBe("block");
    act(() => vi.advanceTimersByTime(1));
    expect(el.style.display).toBe("");
  });

  test("a new puff restarts the gif and the 3s", () => {
    act(() => showSmoke("popupElement", 1, 1));
    const firstSrc = popup("popupElement").getAttribute("src");

    act(() => vi.advanceTimersByTime(2000));
    vi.setSystemTime(Date.now() + 2000);
    act(() => showSmoke("popupElement", 5, 6));

    expect(popup("popupElement").getAttribute("src")).not.toBe(firstSrc);
    expect(popup("popupElement").style.left).toBe("5px");

    // the first puff's timer would have fired here
    act(() => vi.advanceTimersByTime(1500));
    expect(popup("popupElement").style.display).toBe("block");
    act(() => vi.advanceTimersByTime(1500));
    expect(popup("popupElement").style.display).toBe("");
  });
});

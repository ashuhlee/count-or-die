import { useRef, useState } from "react";

import smokeGif from "@assets/ui/deco/smoke.gif";

import { useGameEvent } from "../../../provider/useGameEvent.ts";
import { useTimeouts } from "../../../hooks/useTimeouts.ts";

const SMOKE_SIZE = 70;
const SMOKE_DURATION = 3000;

const POPUPS = {
  heart: "popupElement",
  powerUp: "powerUpUsedElement",
} as const;

type Kind = keyof typeof POPUPS;
type Popup = { src: string | null; x: number; y: number; visible: boolean };

const HIDDEN: Popup = { src: null, x: 0, y: 0, visible: false };

export default function SmokePopups() {
  const [popups, setPopups] = useState<Record<Kind, Popup>>({
    heart: HIDDEN,
    powerUp: HIDDEN,
  });

  const later = useTimeouts();
  const hideTimers = useRef<
    Partial<Record<Kind, ReturnType<typeof setTimeout>>>
  >({});

  useGameEvent("smoke", ({ kind, x, y }) => {
    clearTimeout(hideTimers.current[kind]);

    setPopups((current) => ({
      ...current,
      [kind]: { src: `${smokeGif}?t=${Date.now()}`, x, y, visible: true },
    }));

    hideTimers.current[kind] = later(
      () =>
        setPopups((current) => ({
          ...current,
          [kind]: { ...current[kind], visible: false },
        })),
      SMOKE_DURATION,
    );
  });

  return (
    <>
      {(Object.keys(POPUPS) as Kind[]).map((kind) => {
        const { src, x, y, visible } = popups[kind];

        return (
          <img
            key={kind}
            id={POPUPS[kind]}
            alt="smoke"
            src={src ?? undefined}
            style={{
              filter: "brightness(1.03) saturate(110%)",
              left: `${x}px`,
              top: `${y}px`,
              width: `${SMOKE_SIZE}px`,
              height: `${SMOKE_SIZE}px`,
              display: visible ? "block" : undefined,
              zIndex: 2,
            }}
          />
        );
      })}
    </>
  );
}

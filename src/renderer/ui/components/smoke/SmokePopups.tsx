import { useRef, useState } from "react";

import smokeGif from "@assets/ui/deco/smoke.gif";

import { useGameEvent } from "../../../provider/useGameEvent.ts";
import { useTimeouts } from "../../../hooks/useTimeouts.ts";

const SMOKE_DURATION = 3000;

type Puff = { id: number; src: string; x: number; y: number };

export default function SmokePopups() {
  const [puffs, setPuffs] = useState<Puff[]>([]);
  const nextId = useRef(0);
  const later = useTimeouts();

  useGameEvent("smoke", ({ x, y }) => {
    const id = nextId.current++;

    const src = `${smokeGif}?puff=${Date.now()}-${id}`;
    setPuffs((current) => [...current, { id, src, x, y }]);
    later(
      () => setPuffs((current) => current.filter((puff) => puff.id !== id)),
      SMOKE_DURATION,
    );
  });

  return puffs.map(({ id, src, x, y }) => (
    <img
      key={id}
      className="smoke-puff"
      alt="smoke"
      src={src}
      style={{ left: `${x}px`, top: `${y}px` }}
    />
  ));
}

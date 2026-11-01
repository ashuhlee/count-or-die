import { useEffect, useRef, useState } from "react";

import clock from "@assets/ui/deco/clock_grey.svg";

import { useGameEvent } from "../../../provider/useGameEvent.ts";
import GameNotification from "../game-notification/GameNotification.tsx";

const BORDER = "#a6d7ff";
const ZERO_LINGER = 500;
// how long it takes to slide away
const EXIT = 200;

type Active = { id: number; endsAt: number };

export default function PowerUpTimer() {
  const [active, setActive] = useState<Active | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const nextId = useRef(0);

  useGameEvent("powerUpStarted", ({ duration }) => {
    setNow(Date.now());
    setActive({
      id: nextId.current++,
      endsAt: Date.now() + duration,
    });
  });
  useGameEvent("restarted", () => setActive(null));
  useGameEvent("gameOver", () => setActive(null));

  useEffect(() => {
    if (!active) return;

    const timer = setInterval(() => {
      const time = Date.now();
      if (time - active.endsAt > ZERO_LINGER + EXIT) setActive(null);
      else setNow(time);
    }, 100);
    return () => clearInterval(timer);
  }, [active]);

  if (!active) return null;

  const seconds = Math.max(0, Math.ceil((active.endsAt - now) / 1000));
  const leaving = now - active.endsAt > ZERO_LINGER;

  return (
    <div className="notices">
      <GameNotification
        key={active.id}
        icon={clock}
        iconAlt="clock"
        text={String(seconds)}
        unit="s"
        still
        leaving={leaving}
        border={BORDER}
        id="power-up-timer"
      />
    </div>
  );
}

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { candy, donut, badDonut, star, superstar } from "@assets/ui/power-ups";

import { MAX_BOOSTS } from "../../../game/gameReducer.ts";
import {
  availablePowerUps,
  choosePowerUp,
  type PowerUpType,
} from "../../../game/powerUps.ts";
import { useGame } from "../../provider/GameProvider.tsx";
import { useGameEvent } from "../../provider/useGameEvent.ts";

const ICONS: Record<PowerUpType, string> = {
  double_click: candy,
  four_click: donut,
  minus_25: badDonut,
  extra_boost: star,
  replenish_boosts: superstar,
};

// a new power-up falls every few seconds, once the last one is gone
const MIN_WAIT = 6000;
const MAX_WAIT = 12000;

// on wide screens the icon is nudged in from the edge by a random amount
const WIDE_SCREEN = 600;
const MAX_NUDGE = 150;

type Falling = {
  id: number;
  type: PowerUpType;
  side: "left" | "right";
  fall: "falling" | "falling-reverse";
  // 0-1, scaled to the spawn area's width once it is on screen
  xRand: number;
};

function FallingPowerUp({
  falling,
  onCollect,
  onMiss,
}: {
  falling: Falling;
  onCollect: (falling: Falling, rect: DOMRect) => void;
  onMiss: (falling: Falling) => void;
}) {
  const { type, side, fall, xRand } = falling;
  const areaRef = useRef<HTMLDivElement>(null);
  const [nudge, setNudge] = useState<number | null>(null);

  useLayoutEffect(() => {
    const width = areaRef.current.offsetWidth;
    if (width > WIDE_SCREEN) {
      setNudge(Math.floor(xRand * (Math.min(width / 3, MAX_NUDGE) + 1)));
    }
  }, [xRand]);

  const style: CSSProperties = {
    animation: `${fall} 2.8s linear forwards`,
    ...(nudge !== null && { [side]: `${nudge}px` }),
  };

  return (
    <div className="spawn-area" ref={areaRef}>
      <img
        className={`power-up-img spawn-area--${side}`}
        src={ICONS[type]}
        data-power-up-type={type}
        style={style}
        onClick={(event) =>
          onCollect(falling, event.currentTarget.getBoundingClientRect())
        }
        onAnimationEnd={() => onMiss(falling)}
      />
    </div>
  );
}

// Power-ups that fall down the screen. Clicking one collects it; letting it
// fall off the bottom just starts the wait for the next.
export default function PowerUps() {
  const { state, actions } = useGame();
  const [falling, setFalling] = useState<Falling[]>([]);

  // the timer reads these when it fires, not when it was started
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
  });

  const nextId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const spawn = useCallback(() => {
    const options = availablePowerUps(
      latest.current.boostsAvailable,
      MAX_BOOSTS,
    );
    const { type } = choosePowerUp(options, Math.random());

    setFalling((current) => [
      ...current,
      {
        id: nextId.current++,
        type,
        fall: Math.random() < 0.5 ? "falling" : "falling-reverse",
        side: Math.random() < 0.5 ? "left" : "right",
        xRand: Math.random(),
      },
    ]);
  }, []);

  // (whether the game is still on is checked when the wait is over: right
  // after a restart this component has not seen the new state yet)
  const waitForNext = useCallback(() => {
    clearTimeout(timer.current);

    timer.current = setTimeout(
      () => {
        timer.current = undefined;
        if (!latest.current.isGameOver) spawn();
      },
      Math.random() * (MAX_WAIT - MIN_WAIT) + MIN_WAIT,
    );
  }, [spawn]);

  // the first one, and stopping when the game goes away
  useEffect(() => {
    waitForNext();
    return () => clearTimeout(timer.current);
  }, [waitForNext]);

  // a new game starts with a clean screen and a fresh wait
  useGameEvent("restarted", () => {
    setFalling([]);
    waitForNext();
  });

  const remove = (id: number) =>
    setFalling((current) => current.filter((item) => item.id !== id));

  return (
    <>
      {falling.map((item) => (
        <FallingPowerUp
          key={item.id}
          falling={item}
          onCollect={(collected, rect) => {
            remove(collected.id);
            actions.collectPowerUp(collected.type);
            // a puff of smoke next to where it was
            actions.emit({
              type: "smoke",
              kind: "powerUp",
              x: rect.left + 20,
              y: rect.top + 30,
            });
            waitForNext();
          }}
          onMiss={(missed) => {
            remove(missed.id);
            waitForNext();
          }}
        />
      ))}
    </>
  );
}

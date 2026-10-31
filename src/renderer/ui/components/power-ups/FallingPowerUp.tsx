import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import { candy, donut, badDonut, star, superstar } from "@assets/ui/power-ups";

import type { PowerUpType } from "../../../game/powerUps.ts";

const ICONS: Record<PowerUpType, string> = {
  double_click: candy,
  four_click: donut,
  minus_25: badDonut,
  extra_boost: star,
  replenish_boosts: superstar,
};

// on wide screens the icon is nudged in from the edge by a random amount
const WIDE_SCREEN = 600;
const MAX_NUDGE = 150;

export type Falling = {
  id: number;
  type: PowerUpType;
  side: "left" | "right";
  fall: "falling" | "falling-reverse";
  xRand: number;
};

type FallingPowerUpProps = {
  falling: Falling;
  onCollect: (falling: Falling, rect: DOMRect) => void;
  onMiss: (falling: Falling) => void;
};

// one power-up on its way down the screen
export default function FallingPowerUp({
  falling,
  onCollect,
  onMiss,
}: FallingPowerUpProps) {
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

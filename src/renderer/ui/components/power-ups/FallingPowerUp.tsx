import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import { candy, donut, badDonut, star, superstar } from "@assets/ui/power-ups";

import type { PowerUpType } from "../../../game/powerUps.ts";
import MeltInShader from "../../shaders/melt-in-shader/MeltInShader.tsx";

const ICONS: Record<PowerUpType, string> = {
  double_click: candy,
  four_click: donut,
  minus_25: badDonut,
  extra_boost: star,
  replenish_boosts: superstar,
};

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
  gameOver: boolean;
  onCollect: (falling: Falling, rect: DOMRect) => void;
  onMiss: (falling: Falling) => void;
};

// one power-up on its way down the screen
export default function FallingPowerUp({
  falling,
  gameOver,
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
    animationPlayState: gameOver ? "paused" : "running",
    pointerEvents: gameOver ? "none" : undefined,
    ...(nudge !== null && { [side]: `${nudge}px` }),
  };

  return (
    <div className="spawn-area" ref={areaRef}>
      <div
        className={`power-up-img spawn-area--${side}`}
        data-power-up-type={type}
        style={style}
        onClick={(event) =>
          gameOver ||
          onCollect(falling, event.currentTarget.getBoundingClientRect())
        }
        onAnimationEnd={() => onMiss(falling)}
      >
        <MeltInShader
          src={ICONS[type]}
          alt={type}
          className="power-up-melt"
          active={gameOver}
          mode="out"
          duration={900}
          pixelScale={0.5}
          shadow={false}
          settledBrightness={1}
        />
      </div>
    </div>
  );
}

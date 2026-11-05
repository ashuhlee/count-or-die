import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import { isRare, type PowerUpType } from "../../../../game/powerUps.ts";
import MeltInShader from "../../../shaders/melt-in-shader/MeltInShader.tsx";
import { POWER_UP_ICONS } from "./powerUpIcons.ts";

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
        onAnimationEnd={(event) =>
          event.target === event.currentTarget && onMiss(falling)
        }
      >
        <div className="power-up-art">
          <MeltInShader
            src={POWER_UP_ICONS[type]}
            alt={type}
            className="power-up-melt"
            active={gameOver}
            mode="out"
            duration={700}
            pixelScale={3}
            shadow={false}
            settledBrightness={1}
          />
          {isRare(type) && !gameOver && (
            <div
              className="power-up-shine shine"
              aria-hidden="true"
              style={
                {
                  "--power-up-mask": `url("${POWER_UP_ICONS[type]}")`,
                } as CSSProperties
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";

import type { CounterAnimation } from "../../../game/events.ts";
import { formatCounter } from "../../../utils/formatCounter.ts";
import { useGame } from "../../../provider/useGame.ts";
import { useGameEvent } from "../../../provider/useGameEvent.ts";

const TEXT_PROPS = {
  x: "50%",
  y: "50%",
  textAnchor: "middle",
  dominantBaseline: "middle",
} as const;

export default function Counter() {
  const { state } = useGame();
  const display = formatCounter(state.counter);

  // the number pops, shakes... whenever the game says so; a new key remounts
  // the text, which replays the CSS animation
  const [animation, setAnimation] = useState<{
    name: CounterAnimation;
    id: number;
  } | null>(null);

  useGameEvent("counterAnimation", ({ name }) =>
    setAnimation((current) => ({ name, id: (current?.id ?? 0) + 1 })),
  );

  const key = animation?.id ?? 0;
  const className = animation?.name;

  return (
    <svg viewBox="0 0 300 140" className="counter-svg">
      <defs>
        <clipPath id="shine-effect">
          <text
            {...TEXT_PROPS}
            id="counter-shine"
            key={key}
            className={className}
          >
            {display}
          </text>
        </clipPath>
        <linearGradient id="default-color" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="5%" stopColor="#FFE3F9" />
          <stop offset="30%" stopColor="#F69DE2" />
          <stop offset="100%" stopColor="#DD77C6" />
        </linearGradient>
      </defs>
      {/* outer stroke */}
      <text
        {...TEXT_PROPS}
        stroke="#6a376b"
        strokeWidth="12.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
        paintOrder="stroke"
        id="counter-outer"
        key={`outer-${key}`}
        className={className}
      >
        {display}
      </text>
      {/* inner stroke */}
      <text
        {...TEXT_PROPS}
        stroke="#FFF4F7"
        strokeWidth="8"
        strokeLinejoin="round"
        strokeLinecap="round"
        paintOrder="stroke fill"
        id="counter"
        key={`inner-${key}`}
        className={className}
      >
        {display}
      </text>
      {/* shine effect */}
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        clipPath="url(#shine-effect)"
        className="shine-rect"
      />
    </svg>
  );
}

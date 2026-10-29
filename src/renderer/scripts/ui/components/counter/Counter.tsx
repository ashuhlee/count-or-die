import { useEffect, useRef, useSyncExternalStore } from "react";

import { counterStore, formatCounter } from "./counterStore.ts";

const TEXT_PROPS = {
  x: "50%",
  y: "50%",
  textAnchor: "middle",
  dominantBaseline: "middle",
} as const;

export default function Counter() {
  const value = useSyncExternalStore(
    counterStore.subscribe,
    counterStore.getSnapshot,
  );
  const display = formatCounter(value);

  const textRef = useRef<SVGTextElement>(null);
  const outerRef = useRef<SVGTextElement>(null);
  const shineRef = useRef<SVGTextElement>(null);

  // the animation helpers add/remove classes on these nodes directly, so none
  // of them get a className prop (React would otherwise overwrite it)
  useEffect(() => {
    counterStore.register({
      text: textRef.current,
      outer: outerRef.current,
      shine: shineRef.current,
    });
    return () => {
      counterStore.register({ text: null, outer: null, shine: null });
    };
  }, []);

  return (
    <svg viewBox="0 0 300 140" className="counter-svg">
      <defs>
        <clipPath id="shine-effect">
          <text {...TEXT_PROPS} id="counter-shine" ref={shineRef}>
            {display}
          </text>
        </clipPath>
        <linearGradient
          id="gradient-counter"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" style={{ stopColor: "#FFACAD" }} />
          <stop offset="14.28%" style={{ stopColor: "#FFD5A5" }} />
          <stop offset="28.57%" style={{ stopColor: "#FDFFB6" }} />
          <stop offset="42.85%" style={{ stopColor: "#CBFFBF" }} />
          <stop offset="57.14%" style={{ stopColor: "#9BF6FF" }} />
          <stop offset="85.71%" style={{ stopColor: "#BDB2FF" }} />
          <stop offset="100%" style={{ stopColor: "#ffb7fe" }} />
        </linearGradient>
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
        ref={outerRef}
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
        ref={textRef}
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

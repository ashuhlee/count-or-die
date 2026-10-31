import { useState, type CSSProperties } from "react";

import { useGame } from "../../../provider/useGame.ts";
import { useGameEvent } from "../../../provider/useGameEvent.ts";
import PixelPanel from "../pixel-panel/PixelPanel.tsx";
import ChatTip from "./ChatTip.tsx";

const SHAKE = { step: 0.3, duration: 3 };

const THEME_COLORS = ["#ff80ea", "#A193FF", "#9ad9ff", "#BEB9DC"];

const FRAME = 5;
const TIP_OVERLAP = 5;

const CYCLE_BORDER_COLOR = false;
const BORDER_COLOR = "#e4e4ed";

const PANEL_ACCENT = "#e4e4ed";
const PANEL_DOTS = 1;
const PANEL_SHADOW = 0.2;

type Theme = {
  next: number;
  border: string;
  letterColor: string | null;
};

const INITIAL_THEME: Theme = {
  next: 1,
  border: THEME_COLORS[0],
  letterColor: null,
};

function pickColor(theme: Theme, forLetters: boolean): Theme {
  const color = THEME_COLORS[theme.next];

  return {
    next: (theme.next + 1) % THEME_COLORS.length,
    border: color,
    letterColor: forLetters ? color : theme.letterColor,
  };
}

export default function GoalBox() {
  const { state } = useGame();
  const text = `next: ${state.currentGoal}`;

  const [theme, setTheme] = useState(INITIAL_THEME);
  const [letters, setLetters] = useState<{
    id: number;
    direction: "forward" | "reverse";
  } | null>(null);
  const [swing, setSwing] = useState<{
    id: number;
    className: string | null;
  }>({ id: 0, className: null });

  useGameEvent("goalChanged", ({ direction }) => {
    setTheme((current) => pickColor(current, true));
    setLetters((current) => ({ id: (current?.id ?? 0) + 1, direction }));
    setSwing((current) => ({
      id: current.id + 1,
      className: direction === "forward" ? "new-goal" : "new-goal-reverse",
    }));
  });

  useGameEvent("noBoostsLeft", () =>
    setTheme((current) => pickColor(current, false)),
  );

  const border = CYCLE_BORDER_COLOR ? theme.border : BORDER_COLOR;

  return (
    <div
      className="goal-bubble"
      style={
        {
          "--goal-border": border,
          "--goal-accent": PANEL_ACCENT,
          "--panel-shade": `${PANEL_SHADOW * 100}%`,
        } as CSSProperties
      }
    >
      <PixelPanel
        key={swing.id}
        border={border}
        accent={PANEL_ACCENT}
        dotOpacity={PANEL_DOTS}
        shadowOpacity={PANEL_SHADOW}
        className={[
          "next-goal animate__animated animate__fast",
          swing.className,
        ]
          .filter(Boolean)
          .join(" ")}
        id="next-goal"
      >
        <span className={`goal-text${letters ? " fade-up-text" : ""}`}>
          {text.split("").map((char, index) => {
            const delayIndex =
              letters?.direction === "reverse"
                ? text.length - 1 - index
                : index;

            return (
              <span
                key={`${letters?.id ?? 0}-${index}`}
                style={
                  {
                    "--delay": `${delayIndex * 0.05}s`,
                    "--wave-delay": `${index * SHAKE.step}s`,
                    "--wave-duration": `${SHAKE.duration}s`,
                    color: theme.letterColor,
                  } as CSSProperties
                }
              >
                <span>{char === " " ? "\u00a0" : char}</span>
              </span>
            );
          })}
        </span>
      </PixelPanel>
      <ChatTip border={FRAME} overlap={TIP_OVERLAP} />
    </div>
  );
}

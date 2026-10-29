import { useState, type CSSProperties } from "react";

import { useGame } from "../../../provider/useGame.ts";
import { useGameEvent } from "../../../provider/useGameEvent.ts";

// each letter animation picks the next of these; the box's top border wears
// the color picked last
const THEME_COLORS = ["#ff80ea", "#A193FF", "#9ad9ff", "#BEB9DC"];

type Theme = {
  // the color the next animation will use
  next: number;
  border: string;
  letterColor: string | null;
};

// the title's entrance used the first color
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
  // set after the goal changes: the text animates in letter by letter
  const [letters, setLetters] = useState<{
    id: number;
    direction: "forward" | "reverse";
  } | null>(null);
  // the box swings; a new key remounts it to replay the swing
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

  // the "no boosts left!" text also moves the color cycle along
  useGameEvent("noBoostsLeft", () =>
    setTheme((current) => pickColor(current, false)),
  );

  return (
    <div
      key={swing.id}
      className={["next-goal animate__animated animate__fast", swing.className]
        .filter(Boolean)
        .join(" ")}
      id="next-goal"
      style={{ borderTop: `3px solid ${theme.border}` }}
    >
      <span className="goal-text fade-up-text">
        {letters
          ? text.split("").map((char, index) => {
              const delayIndex =
                letters.direction === "reverse"
                  ? text.length - 1 - index
                  : index;

              return (
                <span
                  key={`${letters.id}-${index}`}
                  style={
                    {
                      "--delay": `${delayIndex * 0.05}s`,
                      color: theme.letterColor,
                    } as CSSProperties
                  }
                >
                  {char === " " ? " " : char}
                </span>
              );
            })
          : text}
      </span>
    </div>
  );
}

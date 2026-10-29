import { useSyncExternalStore, type CSSProperties } from "react";

import { goalStore } from "./goalStore.ts";

export default function GoalBox() {
  const {
    text,
    letters,
    letterColor,
    updateId,
    borderColor,
    effect,
    effectId,
    textEffect,
  } = useSyncExternalStore(goalStore.subscribe, goalStore.getSnapshot);

  return (
    <div
      // a new key remounts the box, which replays the swing animation
      key={effectId}
      className={["next-goal animate__animated animate__fast", effect]
        .filter(Boolean)
        .join(" ")}
      id="next-goal"
      style={
        borderColor ? { borderTop: `3px solid ${borderColor}` } : undefined
      }
    >
      <span
        className={`goal-text fade-up-text${textEffect ? " new-goal-text" : ""}`}
      >
        {letters
          ? letters.map(({ char, delay }, index) => (
              <span
                key={`${updateId}-${index}`}
                style={
                  { "--delay": delay, color: letterColor } as CSSProperties
                }
              >
                {char}
              </span>
            ))
          : text}
      </span>
    </div>
  );
}

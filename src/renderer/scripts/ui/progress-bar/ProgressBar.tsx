import { useSyncExternalStore } from "react";

import {
  barColors,
  progressBarStore,
  type BarPhase,
} from "./progressBarStore.ts";

const BLINK_SLOW = "blink 0.8s linear infinite";
const BLINK_FAST = "blink 0.5s linear infinite";

function getBackground(phase: BarPhase): string {
  switch (phase) {
    case "criticalFast":
    case "criticalSlow":
      return barColors.critical;
    case "warning":
      return barColors.warning;
    case "highScore":
      return barColors.highScore;
    default:
      return barColors.primary;
  }
}

function getAnimation(phase: BarPhase, duration: number): string {
  const countdown = `progress-anim ${duration}s linear infinite`;

  if (phase === "criticalFast") return `${BLINK_FAST}, ${countdown}`;
  if (phase === "criticalSlow") return `${BLINK_SLOW}, ${countdown}`;
  return countdown;
}

export default function ProgressBar() {
  const { phase, duration, running, resetCount } = useSyncExternalStore(
    progressBarStore.subscribe,
    progressBarStore.getSnapshot,
  );

  return (
    <>
      <div className="pg-lines"></div>
      <div
        // a new key remounts the bar, which restarts its CSS animation
        key={resetCount}
        className="progress-bar"
        id="progress-bar"
        style={{
          height: "13px",
          gridArea: "1 / 1",
          animation: running ? getAnimation(phase, duration) : "none",
          transformOrigin: "left",
          width: "140px",
          background: getBackground(phase),
        }}
      ></div>
      <div className="progress-bg"></div>
    </>
  );
}

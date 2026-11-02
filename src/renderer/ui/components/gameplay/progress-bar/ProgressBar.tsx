import { useRef } from "react";

import { useGame, type BarStage } from "../../../../provider/useGame.ts";
import { useProgressSparkles } from "./useProgressSparkles.ts";

const COLORS = {
  highScore: "var(--rainbow-gradient-bar)",
  primary: "#AD9EFF",
  warning: "#ffb199",
  critical: "#f7628b",
};

const BLINK_SLOW = "blink 0.8s linear infinite";
const BLINK_FAST = "blink 0.5s linear infinite";

function getBackground(stage: BarStage, isHighScore: boolean): string {
  if (stage === 0) return isHighScore ? COLORS.highScore : COLORS.primary;
  if (stage === 1) return COLORS.warning;
  return COLORS.critical;
}

function getAnimation(
  stage: BarStage,
  seconds: number,
  countdownName = "progress-anim",
): string {
  const countdown = `${countdownName} ${seconds}s linear infinite`;

  if (stage === 3) return `${BLINK_FAST}, ${countdown}`;
  if (stage === 2) return `${BLINK_SLOW}, ${countdown}`;
  return countdown;
}

export default function ProgressBar() {
  const { state, barStage, ready, paused } = useGame();

  const fill = useRef<HTMLDivElement>(null);
  const sparkles = useRef<HTMLDivElement>(null);
  useProgressSparkles(
    fill,
    sparkles,
    state.isHighScore &&
      barStage === 0 &&
      !state.isGameOver &&
      ready &&
      !paused,
  );

  return (
    <>
      <div
        key={`stripes-${state.round}`}
        className="pg-lines"
        style={{
          visibility: state.isGameOver ? "hidden" : "visible",
          animation: state.isGameOver
            ? "none"
            : getAnimation(barStage, state.roundSeconds, "progress-clip"),
          animationPlayState: ready ? "running" : "paused",
        }}
      >
        <div className="pg-stripes"></div>
      </div>
      <div
        key={`fill-${state.round}`}
        ref={fill}
        className="progress-bar"
        id="progress-bar"
        style={{
          height: "13px",
          gridArea: "1 / 1",
          animation: state.isGameOver
            ? "none"
            : getAnimation(barStage, state.roundSeconds),
          animationPlayState: ready ? "running" : "paused",
          transformOrigin: "left",
          width: "140px",
          background: getBackground(barStage, state.isHighScore),
        }}
      ></div>
      <div className="progress-bg"></div>
      <div
        ref={sparkles}
        className="pg-sparkles"
        style={{ opacity: barStage === 0 ? 1 : 0 }}
      ></div>
    </>
  );
}

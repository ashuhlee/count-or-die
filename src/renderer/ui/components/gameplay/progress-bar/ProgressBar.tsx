import { useEffect, useRef } from "react";

import { useGame, type BarStage } from "../../../../provider/useGame.ts";
import { useProgressSparkles } from "./useProgressSparkles.ts";

const COLORS = {
  rainbow: "var(--rainbow-gradient-bar)",
  primary: "#AD9EFF",
  warning: "#ffb199",
  critical: "#f7628b",
};

// how much faster the stripes slide on a rainbow bar
const RAINBOW_STRIPE_SPEED = 3;

const BLINK_SLOW = "blink 0.8s linear infinite";
const BLINK_FAST = "blink 0.4s linear infinite";

// the rainbow lasts through the warning, and goes away in critical
const isRainbowStage = (stage: BarStage) => stage <= 1;

function getBackground(stage: BarStage, rainbow: boolean): string {
  if (rainbow && isRainbowStage(stage)) return COLORS.rainbow;
  if (stage === 0) return COLORS.primary;
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
  // a power-up that is running makes the bar rainbow
  const rainbow = state.countIncrement > 1;
  useProgressSparkles(
    fill,
    sparkles,
    rainbow && !state.isGameOver && ready && !paused,
  );

  const lines = useRef<HTMLDivElement>(null);
  const rainbowBar = rainbow && isRainbowStage(barStage);
  useEffect(() => {
    const animations = lines.current?.getAnimations?.({ subtree: true }) ?? [];
    for (const animation of animations) {
      if ((animation as CSSAnimation).animationName === "slide-stripes") {
        animation.playbackRate = rainbowBar ? RAINBOW_STRIPE_SPEED : 1;
      }
    }
  }, [rainbowBar, state.round]);

  return (
    <>
      <div
        key={`stripes-${state.round}`}
        ref={lines}
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
          background: getBackground(barStage, rainbow),
        }}
      ></div>
      <div className="progress-bg"></div>
      <div ref={sparkles} className="pg-sparkles"></div>
    </>
  );
}

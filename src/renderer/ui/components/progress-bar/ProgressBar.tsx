import { useGame, type BarStage } from "../../../provider/useGame.ts";

const COLORS = {
  highScore: "var(--rainbow-gradient-bar)",
  primary: "#B4A6FF",
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
  const { state, barStage } = useGame();

  return (
    <>
      <div
        key={state.round}
        className="pg-lines"
        style={{
          visibility: state.isGameOver ? "hidden" : "visible",
          animation: state.isGameOver
            ? "none"
            : getAnimation(barStage, state.roundSeconds, "progress-clip"),
        }}
      >
        <div className="pg-stripes"></div>
      </div>
      <div
        key={state.round}
        className="progress-bar"
        id="progress-bar"
        style={{
          height: "13px",
          gridArea: "1 / 1",
          animation: state.isGameOver
            ? "none"
            : getAnimation(barStage, state.roundSeconds),
          transformOrigin: "left",
          width: "140px",
          background: getBackground(barStage, state.isHighScore),
        }}
      ></div>
      <div className="progress-bg"></div>
    </>
  );
}

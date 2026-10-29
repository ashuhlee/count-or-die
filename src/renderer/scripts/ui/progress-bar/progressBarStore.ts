export const barColors = {
  highScore: "var(--rainbow-gradient-bar)",
  primary: "#B4A6FF",
  warning: "#ffb199",
  critical: "#f7628b",
};

const DEFAULT_DURATION = 20;

export type BarPhase =
  | "primary"
  | "highScore"
  | "warning"
  | "criticalSlow"
  | "criticalFast";

type ProgressBarState = {
  phase: BarPhase;
  duration: number;
  running: boolean;
  resetCount: number;
};

const listeners = new Set<() => void>();
let state: ProgressBarState = {
  phase: "primary",
  duration: DEFAULT_DURATION,
  running: true,
  resetCount: 0,
};

// the CSS animation drives the bar's width; this clock mirrors it so the game
// knows when to change color and when time has run out
let animStartTime: number | null = null;

function setState(next: Partial<ProgressBarState>): void {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function getPhase(percentage: number, highScoreReached: boolean): BarPhase {
  if (percentage <= 15) return "criticalFast";
  if (percentage <= 30) return "criticalSlow";
  if (percentage <= 50) return "warning";
  return highScoreReached ? "highScore" : "primary";
}

// React side: read the state
export const progressBarStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => state,
};

// vanilla side: the game code drives the bar through these
export const progressBar = {
  // restart the countdown at a new speed if the round got faster
  reset(speed: number = DEFAULT_DURATION): void {
    animStartTime = Date.now();
    setState({
      phase: "primary",
      duration: speed,
      running: true,
      resetCount: state.resetCount + 1,
    });
  },

  // called every frame: pick the bar's color and announce when it runs out
  tick(highScoreReached = false): void {
    if (animStartTime === null) return;

    // track how much time has passed
    const elapsed = (Date.now() - animStartTime) / 1000; // ms to seconds
    const cycle = (elapsed % state.duration) / state.duration;
    const percentage = Math.round((1 - cycle) * 100);

    if (percentage < 0.1) {
      document.dispatchEvent(new CustomEvent("progressBarExp"));
      return;
    }

    const phase = getPhase(percentage, highScoreReached);
    if (phase !== state.phase) setState({ phase });
  },

  // freeze the bar (game over)
  stop(): void {
    setState({ running: false });
  },
};

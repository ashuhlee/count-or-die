export type FlashKind = "flash" | "flash-penalty";

type GameOverState = {
  visible: boolean;
  // the red overlay that fades in and out; game over waits for it to finish
  flash: FlashKind | null;
  showAfterFlash: boolean;
  phrase: string;
  rainbow: boolean;
  deathCount: number;
  scoreText: string;
};

const DEATH_COUNT_KEY = "deathCount";

const listeners = new Set<() => void>();
let state = createInitialState();

function readDeathCount(): number {
  const parsed = Number.parseInt(
    localStorage.getItem(DEATH_COUNT_KEY) ?? "",
    10,
  );
  return Number.isNaN(parsed) ? 0 : parsed;
}

function createInitialState(): GameOverState {
  return {
    visible: false,
    flash: null,
    showAfterFlash: false,
    phrase: "you died lolz",
    rainbow: false,
    deathCount: readDeathCount(),
    scoreText: "score: 0",
  };
}

function setState(next: Partial<GameOverState>): void {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

// React side: read the state, and report when the flash animation ends
export const gameOverStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => state,

  endFlash() {
    if (state.flash === null) return;

    setState({
      flash: null,
      visible: state.visible || state.showAfterFlash,
      showAfterFlash: false,
    });
  },

  reset() {
    state = createInitialState();
    listeners.forEach((listener) => listener());
  },
};

// vanilla side: the game code drives the screen through these
export const gameOverScreen = {
  show(phrase: string, highScoreReached: boolean): void {
    setState({
      phrase,
      rainbow: state.rainbow || highScoreReached,
      flash: "flash",
      showAfterFlash: true,
    });
  },

  hide(phrase: string): void {
    setState({ phrase, rainbow: false, visible: false, showAfterFlash: false });
  },

  setDeathCount(deathCount: number): void {
    setState({ deathCount });
  },

  setScoreText(scoreText: string): void {
    setState({ scoreText });
  },
};

export function flashScreen(kind: FlashKind): void {
  setState({ flash: kind });
}

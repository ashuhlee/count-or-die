import { createStore } from "../../createStore.ts";

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

const store = createStore(createInitialState());

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

// For the components: the state, and when the flash animation ends
export const gameOverStore = {
  subscribe: store.subscribe,
  getSnapshot: store.getSnapshot,

  endFlash() {
    if (store.getSnapshot().flash === null) return;

    store.patch({
      flash: null,
      visible:
        store.getSnapshot().visible || store.getSnapshot().showAfterFlash,
      showAfterFlash: false,
    });
  },

  reset() {
    store.set(createInitialState());
  },
};

// For the game code: show and hide the screen, set the score and death count
export const gameOverScreen = {
  show(phrase: string, highScoreReached: boolean): void {
    store.patch({
      phrase,
      rainbow: store.getSnapshot().rainbow || highScoreReached,
      flash: "flash",
      showAfterFlash: true,
    });
  },

  hide(phrase: string): void {
    store.patch({
      phrase,
      rainbow: false,
      visible: false,
      showAfterFlash: false,
    });
  },

  setDeathCount(deathCount: number): void {
    store.patch({ deathCount });
  },

  setScoreText(scoreText: string): void {
    store.patch({ scoreText });
  },
};

export function flashScreen(kind: FlashKind): void {
  store.patch({ flash: kind });
}

import { createStore } from "../../createStore.ts";

type HighScoreState = { score: number; isNew: boolean };

const store = createStore<HighScoreState>({ score: 0, isNew: false });

// For the components: the state
export const highScoreStore = {
  subscribe: store.subscribe,
  getSnapshot: store.getSnapshot,
};

// For the game code: update the score and its highlight
export const highScore = {
  update(score: number): void {
    store.patch({ score });
  },
  addNewScoreEffect(): void {
    store.patch({ isNew: true });
  },
  removeNewScoreEffect(): void {
    store.patch({ isNew: false });
  },
};

type HighScoreState = { score: number; isNew: boolean };

const listeners = new Set<() => void>();
let state: HighScoreState = { score: 0, isNew: false };

function setState(next: Partial<HighScoreState>): void {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

// React side: read the state
export const highScoreStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => state,
};

// vanilla side: same API the game code already calls
export const highScore = {
  update(score: number): void {
    setState({ score });
  },
  addNewScoreEffect(): void {
    setState({ isNew: true });
  },
  removeNewScoreEffect(): void {
    setState({ isNew: false });
  },
};

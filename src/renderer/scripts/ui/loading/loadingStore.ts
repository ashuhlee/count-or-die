const HIDE_DELAY = 600;

type LoadingState = { mounted: boolean; visible: boolean; hiding: boolean };

const listeners = new Set<() => void>();
let state: LoadingState = { mounted: false, visible: false, hiding: false };
let hideTimer: ReturnType<typeof setTimeout> | undefined;

function setState(next: Partial<LoadingState>): void {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

// React side: read the state
export const loadingStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => state,
};

// vanilla side: same functions the game code already calls
export function showLoadingScreen(): void {
  clearTimeout(hideTimer);
  setState({ mounted: true, visible: false, hiding: false });

  // add "visible" a frame after mounting so the CSS transition runs
  requestAnimationFrame(() => {
    if (state.mounted) setState({ visible: true });
  });
}

export function hideLoadingScreen(): void {
  if (!state.mounted) return;

  setState({ hiding: true });
  hideTimer = setTimeout(() => {
    setState({ mounted: false, visible: false, hiding: false });
  }, HIDE_DELAY);
}

import { createStore } from "../../createStore.ts";

const HIDE_DELAY = 600;

type LoadingState = { mounted: boolean; visible: boolean; hiding: boolean };

const store = createStore<LoadingState>({
  mounted: false,
  visible: false,
  hiding: false,
});
let hideTimer: ReturnType<typeof setTimeout> | undefined;

// For the components: the state
export const loadingStore = {
  subscribe: store.subscribe,
  getSnapshot: store.getSnapshot,
};

// For the game code: show and hide the loading screen
export function showLoadingScreen(): void {
  clearTimeout(hideTimer);
  store.patch({ mounted: true, visible: false, hiding: false });

  // add "visible" a frame after mounting so the CSS transition runs
  requestAnimationFrame(() => {
    if (store.getSnapshot().mounted) store.patch({ visible: true });
  });
}

export function hideLoadingScreen(): void {
  if (!store.getSnapshot().mounted) return;

  store.patch({ hiding: true });
  hideTimer = setTimeout(() => {
    store.patch({ mounted: false, visible: false, hiding: false });
  }, HIDE_DELAY);
}

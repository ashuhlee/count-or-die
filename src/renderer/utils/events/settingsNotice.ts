const SETTINGS_REQUESTED = "settings-requested";

export function requestSettings(): void {
  window.dispatchEvent(new Event(SETTINGS_REQUESTED));
}

export function onSettingsRequested(handler: () => void): () => void {
  window.addEventListener(SETTINGS_REQUESTED, handler);
  return () => window.removeEventListener(SETTINGS_REQUESTED, handler);
}

import { requestSettings } from "../utils/events/settingsNotice.ts";

type KeyBinds = {
  onIncrease: () => void;
  onBoost: () => void;
};

export function handleKeydown(event: KeyboardEvent, handlers: KeyBinds): void {
  if (event.repeat && !import.meta.env.DEV) return;

  if (event.key === "Escape") {
    requestSettings();
    return;
  }
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
    return;
  }
  switch (event.key) {
    case "ArrowUp":
    case "ArrowRight":
    case "W":
    case "w":
    case "D":
    case "d":
      handlers.onIncrease();
      break;

    case " ":
      handlers.onBoost();
      break;
  }
}

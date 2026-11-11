import { requestChallenges, requestHelp } from "../events/dialogRequests.ts";
import { resetProgress } from "../storage/resetProgress.ts";
import { toggleMuteSound, toggleMusicSound } from "./soundState.ts";

export type MenuAction =
  | "open-challenges"
  | "open-help"
  | "mute-sound"
  | "toggle-music"
  | "reset-progress";

export function handleMenuAction(action: MenuAction): void {
  switch (action) {
    case "open-challenges":
      requestChallenges();
      break;
    case "open-help":
      requestHelp();
      break;
    case "mute-sound":
      toggleMuteSound();
      break;
    case "toggle-music":
      toggleMusicSound();
      break;
    case "reset-progress":
      resetProgress();
      window.location.reload();
      break;
  }
}

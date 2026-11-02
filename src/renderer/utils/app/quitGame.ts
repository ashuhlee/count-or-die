import { playSound } from "./sounds.ts";

const QUIT_DELAY = 400;

export function quitGame(): void {
  playSound("buttonClick");

  if (window.electron) {
    setTimeout(window.electron.quitApp, QUIT_DELAY);
  } else {
    alert("Thank you for playing!");
  }
}

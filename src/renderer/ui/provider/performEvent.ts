import { pauseSound, playSound } from "../../audio/sounds.ts";
import type { GameEvent } from "../../game/events.ts";
import { playConfetti } from "../../utils/confetti.ts";
import { updateDiscordPresence } from "../../utils/discordPresence.ts";
import { formatCounter } from "../../utils/formatCounter.ts";
import { saveDeathCount, saveHighScore } from "../../utils/savedGame.ts";
import { youDiedConsole } from "../../utils/youDiedConsole.ts";
import type { EventBus } from "./eventBus.ts";
import type { Later } from "../hooks/useTimeouts.ts";
import type { Pointer } from "./useGame.ts";

const GAME_OVER_MUSIC_DELAY = 1000;

type Around = {
  bus: EventBus;
  later: Later;
  deathCount: number;
  pointer?: Pointer;
};

// Everything the game does for one thing the rules report, other than showing
// it: play the sound, save the score, tell Discord. Then the components get to
// hear about it too.
export function performEvent(
  event: GameEvent,
  { bus, later, deathCount, pointer }: Around,
): void {
  switch (event.type) {
    case "sound":
      playSound(event.name);
      break;

    case "stopSound":
      pauseSound(event.name);
      break;

    case "confetti":
      playConfetti();
      break;

    case "highScore":
      saveHighScore(event.score);
      updateDiscordPresence({ highScoreRPC: event.score });
      break;

    case "gameOver":
      saveDeathCount(deathCount);
      later(() => playSound("gameOverMusic"), GAME_OVER_MUSIC_DELAY);
      updateDiscordPresence({ gameStatusRPC: "game-over" });
      if (!window.electron) youDiedConsole(formatCounter(event.score));
      break;

    case "restarted":
      updateDiscordPresence({ gameStatusRPC: "in-game" });
      break;
  }

  // a floating +N needs to know where to appear; without a click, it doesn't
  if (event.type === "cursorCount") {
    if (pointer) bus.emit({ ...event, x: pointer.x, y: pointer.y });
  } else {
    bus.emit(event);
  }
}

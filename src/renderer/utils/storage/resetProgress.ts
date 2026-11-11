import { CELEBRATED_KEY, DAILY_CHALLENGES_KEY } from "./dailyChallenges.ts";
import { DEATH_COUNT_KEY, HIGH_SCORE_KEY } from "./savedGame.ts";

const PROGRESS_KEYS = [
  HIGH_SCORE_KEY,
  DEATH_COUNT_KEY,
  DAILY_CHALLENGES_KEY,
  CELEBRATED_KEY,
];

export function resetProgress(): void {
  for (const key of PROGRESS_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
}

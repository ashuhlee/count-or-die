// the daily challenges the game remembers between sessions
import {
  dateKey,
  isChallengeId,
  newDay,
  type DailyState,
} from "../../game/challenges.ts";

const KEY = "dailyChallenges";

const isCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

export function loadDailyChallenges(now = new Date()): DailyState {
  const today = dateKey(now);

  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");

    const valid =
      saved?.date === today &&
      Array.isArray(saved.ids) &&
      saved.ids.length > 0 &&
      saved.ids.every(isChallengeId) &&
      Array.isArray(saved.done) &&
      saved.done.every(isChallengeId) &&
      isCount(saved.totals?.bestScore) &&
      isCount(saved.totals?.bestPowerUps) &&
      isCount(saved.totals?.runs);

    if (valid) return saved as DailyState;
  } catch {}
  return newDay(today);
}

export function saveDailyChallenges(state: DailyState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

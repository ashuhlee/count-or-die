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

    // a save from before these were counted has none: they start at 0
    if (valid) {
      const { bestScoreNoBoosts = 0, bestBoosts = 0 } = saved.totals;
      if (isCount(bestScoreNoBoosts) && isCount(bestBoosts)) {
        return {
          ...saved,
          totals: { ...saved.totals, bestScoreNoBoosts, bestBoosts },
        } as DailyState;
      }
    }
  } catch {}
  return newDay(today);
}

export function saveDailyChallenges(state: DailyState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

const CELEBRATED_KEY = "dailyChallengesCelebrated";

export function takeCelebration(now = new Date()): boolean {
  const today = dateKey(now);
  try {
    if (localStorage.getItem(CELEBRATED_KEY) === today) return false;
    localStorage.setItem(CELEBRATED_KEY, today);
  } catch {}
  return true;
}

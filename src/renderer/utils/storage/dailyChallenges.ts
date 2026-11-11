// the daily challenges the game remembers between sessions
import {
  dateKey,
  isChallengeId,
  newDay,
  type DailyState,
} from "../../game/challenges.ts";

export const DAILY_CHALLENGES_KEY = "dailyChallenges";

const isCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

export function loadDailyChallenges(now = new Date()): DailyState {
  const today = dateKey(now);

  try {
    const saved = JSON.parse(
      localStorage.getItem(DAILY_CHALLENGES_KEY) ?? "null",
    );

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
  localStorage.setItem(DAILY_CHALLENGES_KEY, JSON.stringify(state));
}

export const CELEBRATED_KEY = "dailyChallengesCelebrated";

export function takeCelebration(now = new Date()): boolean {
  const today = dateKey(now);
  try {
    if (localStorage.getItem(CELEBRATED_KEY) === today) return false;
    localStorage.setItem(CELEBRATED_KEY, today);
  } catch {}
  return true;
}

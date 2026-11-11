import { beforeEach, describe, expect, test } from "vite-plus/test";

import { loadDailyChallenges } from "../../../src/renderer/utils/storage/dailyChallenges.ts";

const today = new Date(2026, 10, 5);

beforeEach(() => localStorage.clear());

describe("loading the daily challenges", () => {
  test("keeps the progress saved before goals and boosts were counted", () => {
    const saved = {
      date: "2026-11-05",
      ids: ["score-300", "runs-10", "power-ups-5"],
      done: ["runs-10"],
      totals: { bestScore: 120, bestPowerUps: 2, runs: 10 },
    };
    localStorage.setItem("dailyChallenges", JSON.stringify(saved));

    const day = loadDailyChallenges(today);

    expect(day.ids).toEqual(saved.ids);
    expect(day.done).toEqual(["runs-10"]);
    expect(day.totals).toEqual({
      bestScore: 120,
      bestPowerUps: 2,
      bestScoreNoBoosts: 0,
      bestBoosts: 0,
      runs: 10,
    });
  });

  test("starts a new day when the save is from another day", () => {
    localStorage.setItem(
      "dailyChallenges",
      JSON.stringify({ date: "2026-11-04", ids: ["runs-5"], done: [] }),
    );

    const day = loadDailyChallenges(today);

    expect(day.date).toBe("2026-11-05");
    expect(day.totals.runs).toBe(0);
  });
});

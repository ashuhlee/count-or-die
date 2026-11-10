import { expect, describe, test } from "vite-plus/test";

import {
  CHALLENGES,
  DAILY_COUNT,
  dateKey,
  newDay,
  pickDaily,
  recordRun,
  type ChallengeId,
  type DailyState,
} from "../../src/renderer/game/challenges.ts";

// a day with these three, so that what a run does to them can be followed
const dayWith = (...ids: ChallengeId[]): DailyState => ({
  ...newDay("2026-11-05"),
  ids,
});

describe("the daily challenges", () => {
  test("the same few are picked all day, and other days pick others", () => {
    const today = pickDaily("2026-11-05");

    expect(today).toEqual(pickDaily("2026-11-05"));
    expect(today).toHaveLength(DAILY_COUNT);
    expect(new Set(today).size).toBe(DAILY_COUNT);

    // the days of a month do not all get the same ones
    const days = Array.from({ length: 30 }, (_, day) =>
      pickDaily(`2026-11-${String(day + 1).padStart(2, "0")}`).join(),
    );
    expect(new Set(days).size).toBeGreaterThan(1);
    for (const id of today) {
      expect(CHALLENGES.some((challenge) => challenge.id === id)).toBe(true);
    }

    // a day is told in the player's own time
    expect(dateKey(new Date(2026, 10, 5, 23, 59))).toBe("2026-11-05");
  });

  test("a run completes a challenge once, by its best run or by the runs of the day", () => {
    let day = dayWith("score-300", "power-ups-5", "runs-10");

    // a run that gets to 300 and 5 power-ups completes both, and counts as one run
    let update = recordRun(day, {
      peakScore: 300,
      powerUps: 5,
      boosts: 0,
    });
    expect(update.completed).toEqual([
      "Reach a score of 300",
      "Collect 5 powerups in one run",
    ]);
    day = update.state;

    // the same again tells nothing new
    update = recordRun(day, {
      peakScore: 400,
      powerUps: 9,
      boosts: 0,
    });
    expect(update.completed).toEqual([]);
    day = update.state;

    // the runs add up: 2 so far, and the 10th completes the last one
    for (let run = 3; run < 10; run++) {
      day = recordRun(day, {
        peakScore: 0,
        powerUps: 0,
        boosts: 0,
      }).state;
    }
    update = recordRun(day, { peakScore: 0, powerUps: 0, boosts: 0 });
    expect(update.completed).toEqual(["Complete 10 runs"]);
    expect(update.state.done).toHaveLength(3);
  });

  test("the easier challenges complete at their own targets", () => {
    const day = dayWith("score-200", "power-ups-3", "runs-5");

    // 200 points and 3 power-ups in one run, but only the first run of 5
    let update = recordRun(day, {
      peakScore: 200,
      powerUps: 3,
      boosts: 0,
    });
    expect(update.completed).toEqual([
      "Reach a score of 200",
      "Collect 3 powerups in one run",
    ]);

    // the 5th run completes the last one
    let state = update.state;
    for (let run = 2; run < 5; run++) {
      state = recordRun(state, {
        peakScore: 0,
        powerUps: 0,
        boosts: 0,
      }).state;
    }
    update = recordRun(state, {
      peakScore: 0,
      powerUps: 0,
      boosts: 0,
    });
    expect(update.completed).toEqual(["Complete 5 runs"]);
  });

  test("the boosts used, and the score of a run without any, are told by the best run", () => {
    const day = dayWith("score-200-no-boosts", "boosts-4");

    // 250 points, but with a boost: it only counts for the boosts
    let update = recordRun(day, { peakScore: 250, powerUps: 0, boosts: 3 });
    expect(update.completed).toEqual([]);

    // 200 points without a boost
    update = recordRun(update.state, {
      peakScore: 200,
      powerUps: 0,
      boosts: 0,
    });
    expect(update.completed).toEqual(["Reach a score of 200 without boosts"]);

    // using all the boosts is a run of its own
    update = recordRun(update.state, { peakScore: 0, powerUps: 0, boosts: 4 });
    expect(update.completed).toEqual(["Use all 4 boosts in one run"]);
  });
});

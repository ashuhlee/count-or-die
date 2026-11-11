import { beforeEach, describe, expect, test } from "vite-plus/test";

import { resetProgress } from "../../../src/renderer/utils/storage/resetProgress.ts";

describe("resetProgress", () => {
  beforeEach(() => localStorage.clear());

  test("forgets the scores and challenges but keeps the settings", () => {
    localStorage.setItem("highScore", "250");
    localStorage.setItem("deathCount", "12");
    localStorage.setItem("dailyChallenges", "{}");
    localStorage.setItem("dailyChallengesCelebrated", "2026-11-10");
    localStorage.setItem("soundState", "2");
    localStorage.setItem("betaNoticeSeen", "1");

    resetProgress();

    expect(localStorage.getItem("highScore")).toBeNull();
    expect(localStorage.getItem("deathCount")).toBeNull();
    expect(localStorage.getItem("dailyChallenges")).toBeNull();
    expect(localStorage.getItem("dailyChallengesCelebrated")).toBeNull();
    expect(localStorage.getItem("soundState")).toBe("2");
    expect(localStorage.getItem("betaNoticeSeen")).toBe("1");
  });
});

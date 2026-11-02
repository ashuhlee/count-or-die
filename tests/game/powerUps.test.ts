import { expect, describe, test } from "vite-plus/test";

import {
  availablePowerUps,
  choosePowerUp,
  getPowerUp,
  POWER_UPS,
} from "../../src/renderer/game/powerUps.ts";
import { pickGameOverPhrase } from "../../src/renderer/game/phrases.ts";

describe("power-up definitions", () => {
  test("looks one up by type", () => {
    expect(getPowerUp("minus_25").effect).toBe("bad");
    expect(getPowerUp("double_click").duration).toBe(3000);
    expect(getPowerUp("extra_boost").duration).toBeNull();
  });

  test("every boost is available while some are missing", () => {
    expect(availablePowerUps(3, 4)).toEqual(POWER_UPS);
  });

  test("no boost power-ups while every boost is still there", () => {
    const types = availablePowerUps(4, 4).map((p) => p.type);

    expect(types).not.toContain("extra_boost");
    expect(types).not.toContain("replenish_boosts");
    expect(types).toContain("double_click");
  });
});

describe("choosePowerUp", () => {
  test("a low random number picks the first", () => {
    expect(choosePowerUp(POWER_UPS, 0).type).toBe("double_click");
  });

  test("picks by weight", () => {
    expect(choosePowerUp(POWER_UPS, 0.3).type).toBe("double_click");
    expect(choosePowerUp(POWER_UPS, 0.5).type).toBe("four_click");
    expect(choosePowerUp(POWER_UPS, 0.7).type).toBe("minus_25");
    expect(choosePowerUp(POWER_UPS, 0.85).type).toBe("extra_boost");
    expect(choosePowerUp(POWER_UPS, 0.99).type).toBe("replenish_boosts");
  });

  test("only picks from the options it is given", () => {
    const options = availablePowerUps(4, 4);

    for (const random of [0, 0.25, 0.5, 0.75, 0.999]) {
      expect(options).toContain(choosePowerUp(options, random));
    }
  });

  test("the highest possible number picks the last one", () => {
    expect(choosePowerUp(POWER_UPS, 1).type).toBe("replenish_boosts");
  });
});

describe("game over phrases", () => {
  test("a regular game over", () => {
    expect(pickGameOverPhrase(false, 0)).toBe("You died lolz");

    const last = pickGameOverPhrase(false, 0.99);
    expect(last).toBeTruthy();
    expect(last).not.toBe("You died lolz");
  });

  test("every roll gets a regular phrase, and several are in use", () => {
    const phrases = new Set<string>();
    for (let random = 0; random < 1; random += 0.01) {
      const phrase = pickGameOverPhrase(false, random);
      expect(phrase).toBeTruthy();
      phrases.add(phrase);
    }
    expect(phrases.size).toBeGreaterThan(5);
  });
});

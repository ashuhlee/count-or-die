import { expect, describe, test } from "vite-plus/test";

import {
  availablePowerUps,
  choosePowerUp,
  getPowerUp,
  POWER_UPS,
} from "../../src/renderer/scripts/game/powerUps.ts";
import { pickGameOverPhrase } from "../../src/renderer/scripts/game/phrases.ts";

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
    // the weights add up to 98: candy 0-40, 4x 40-60, penalty 60-80,
    // extra boost 80-90, superstar 90-98
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
    expect(pickGameOverPhrase(false, 0)).toBe("you died lolz");
    expect(pickGameOverPhrase(false, 0.99)).toBe("give it another go!");
  });

  test("a new high score gets its own phrases", () => {
    expect(pickGameOverPhrase(true, 0)).toBe("new high score!");
    expect(pickGameOverPhrase(true, 0.99)).toBe("oooh, a new record!");
  });
});

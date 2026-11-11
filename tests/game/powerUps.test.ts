import { expect, describe, test } from "vite-plus/test";

import {
  availablePowerUps,
  choosePowerUp,
  POWER_UPS,
} from "../../src/renderer/game/powerUps.ts";

describe("power-up definitions", () => {
  test("no boost power-ups while every boost is still there", () => {
    const types = availablePowerUps(4, 4).map((p) => p.type);

    expect(types).not.toContain("extra_boost");
    expect(types).not.toContain("replenish_boosts");
    expect(types).toContain("double_click");
  });
});

describe("choosePowerUp", () => {
  test("picks by weight", () => {
    expect(choosePowerUp(POWER_UPS, 0.2).type).toBe("double_click");
    expect(choosePowerUp(POWER_UPS, 0.3).type).toBe("four_click");
    expect(choosePowerUp(POWER_UPS, 0.4).type).toBe("combo");
    expect(choosePowerUp(POWER_UPS, 0.5).type).toBe("time_freeze");
    expect(choosePowerUp(POWER_UPS, 0.6).type).toBe("plus_25");
    expect(choosePowerUp(POWER_UPS, 0.7).type).toBe("time_rush");
    expect(choosePowerUp(POWER_UPS, 0.8).type).toBe("minus_25");
    expect(choosePowerUp(POWER_UPS, 0.92).type).toBe("extra_boost");
    expect(choosePowerUp(POWER_UPS, 0.99).type).toBe("replenish_boosts");
  });
});

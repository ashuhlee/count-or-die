import { describe, expect, test } from "vitest";

import { getRank } from "../../src/shared/ranks.ts";

describe("ranks", () => {
  test("everyone starts as a rookie, without a badge", () => {
    expect(getRank(0)).toEqual({ min: 0, name: "Rookie" });
    expect(getRank(99).name).toBe("Rookie");
  });

  test("each rank starts at its score", () => {
    expect(getRank(100).name).toBe("Slow Fingers");
    expect(getRank(199).name).toBe("Slow Fingers");
    expect(getRank(200).name).toBe("Finger Breaker");
    expect(getRank(300).name).toBe("Speed Demon");
    expect(getRank(400).name).toBe("Legend");
  });

  test("the top rank has no end", () => {
    expect(getRank(5000).name).toBe("Legend");
    expect(getRank(5000).badge).toBe("tier_four");
  });
});

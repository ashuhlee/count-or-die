import { describe, expect, test } from "vitest";

import { getRank } from "../../src/shared/ranks.ts";

describe("ranks", () => {
  test("each rank starts at its score", () => {
    expect(getRank(100).name).toBe("Slow Fingers");
    expect(getRank(199).name).toBe("Slow Fingers");
    expect(getRank(200).name).toBe("Finger Breaker");
    expect(getRank(300).name).toBe("Speed Demon");
    expect(getRank(400).name).toBe("Legend");
  });
});

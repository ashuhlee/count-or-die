import { MAX_BOOSTS, PENALTY_POINTS } from "../../../game/gameReducer.ts";
import type { PowerUpType } from "../../../game/powerUps.ts";

export const POWER_UP_LABELS: Record<PowerUpType, string> = {
  double_click: "X2 Mult!",
  four_click: "X4 Mult!",
  minus_25: `-${PENALTY_POINTS} Count`,
  extra_boost: "+1 Boost",
  replenish_boosts: `+${MAX_BOOSTS} Boosts!`,
};

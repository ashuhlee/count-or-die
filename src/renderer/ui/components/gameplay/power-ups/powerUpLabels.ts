import {
  BONUS_POINTS,
  MAX_BOOSTS,
  PENALTY_POINTS,
} from "../../../../game/gameLogic.ts";
import type { PowerUpType } from "../../../../game/powerUps.ts";

export const POWER_UP_LABELS: Record<PowerUpType, string> = {
  double_click: "X2 Mult!",
  four_click: "X4 Mult!",
  combo: "Combo!",
  plus_25: `+${BONUS_POINTS}\nCount!`,
  minus_25: `-${PENALTY_POINTS}\nCount!`,
  extra_boost: "+1 Boost",
  replenish_boosts: `+${MAX_BOOSTS}\nBoosts!`,
};

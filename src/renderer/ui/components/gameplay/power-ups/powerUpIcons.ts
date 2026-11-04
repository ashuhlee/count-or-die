import {
  candyBlue,
  candyPink,
  candyPurple,
  donutPink,
  popsiclePink,
  popsicleBlue,
  donutBrown,
  star,
  superstar,
} from "@assets/ui/power-ups";

import type { PowerUpType } from "../../../../game/powerUps.ts";

export const POWER_UP_ICONS: Record<PowerUpType, string> = {
  double_click: candyPurple,
  four_click: candyBlue,
  combo: candyPink,
  time_freeze: popsiclePink,
  time_rush: popsicleBlue,
  plus_25: donutPink,
  minus_25: donutBrown,
  extra_boost: star,
  replenish_boosts: superstar,
};

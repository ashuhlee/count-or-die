import {
  candyBlue,
  candyPink,
  candyPurple,
  donut,
  badDonut,
  star,
  superstar,
} from "@assets/ui/power-ups";

import type { PowerUpType } from "../../../../game/powerUps.ts";

export const POWER_UP_ICONS: Record<PowerUpType, string> = {
  double_click: candyPurple,
  four_click: candyBlue,
  combo: candyPink,
  plus_25: donut,
  minus_25: badDonut,
  extra_boost: star,
  replenish_boosts: superstar,
};

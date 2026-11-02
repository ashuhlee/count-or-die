import { candy, donut, badDonut, star, superstar } from "@assets/ui/power-ups";

import type { PowerUpType } from "../../../../game/powerUps.ts";

export const POWER_UP_ICONS: Record<PowerUpType, string> = {
  double_click: candy,
  four_click: donut,
  minus_25: badDonut,
  extra_boost: star,
  replenish_boosts: superstar,
};

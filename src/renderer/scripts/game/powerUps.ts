import type { SoundName } from "./events.ts";

export type PowerUpType =
  | "double_click"
  | "four_click"
  | "minus_25"
  | "extra_boost"
  | "replenish_boosts";

export type PowerUpDefinition = {
  type: PowerUpType;
  // how likely it is to appear, relative to the others
  weight: number;
  // how long a timed effect lasts; null for instant ones
  duration: number | null;
  sound: SoundName;
  effect: "good" | "bad";
  description: string;
};

export const POWER_UPS: PowerUpDefinition[] = [
  {
    type: "double_click",
    weight: 40,
    duration: 3000,
    sound: "powerUp",
    effect: "good",
    description: "2x counter!",
  },
  {
    type: "four_click",
    weight: 20,
    duration: 3000,
    sound: "powerUp",
    effect: "good",
    description: "4x counter!",
  },
  {
    type: "minus_25",
    weight: 20,
    duration: null,
    sound: "penalty",
    effect: "bad",
    description: "-25 penalty!",
  },
  {
    type: "extra_boost",
    weight: 10,
    duration: null,
    sound: "boostPowerUp",
    effect: "good",
    description: "extra boost!",
  },
  {
    type: "replenish_boosts",
    weight: 8,
    duration: null,
    sound: "boostPowerUp",
    effect: "good",
    description: "superstar!",
  },
];

const BOOST_TYPES = new Set<PowerUpType>(["extra_boost", "replenish_boosts"]);

export function getPowerUp(type: PowerUpType): PowerUpDefinition {
  return POWER_UPS.find((powerUp) => powerUp.type === type);
}

// boost power-ups are pointless while every boost is still there
export function availablePowerUps(
  boostsAvailable: number,
  maxBoosts: number,
): PowerUpDefinition[] {
  const options =
    boostsAvailable >= maxBoosts
      ? POWER_UPS.filter((powerUp) => !BOOST_TYPES.has(powerUp.type))
      : POWER_UPS;

  return options.length > 0 ? options : POWER_UPS;
}

// picks one by weight; `random` is a number from 0 up to (not including) 1
export function choosePowerUp(
  options: PowerUpDefinition[],
  random: number,
): PowerUpDefinition {
  const totalWeight = options.reduce((sum, item) => sum + item.weight, 0);
  let pick = random * totalWeight;

  for (const option of options) {
    pick -= option.weight;
    if (pick <= 0) return option;
  }
  return options[0];
}

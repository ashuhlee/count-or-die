import { flashScreen } from "../react/gameOverStore.ts";
import { replenishHearts } from "../react/heartStore.ts";
import { powerUps } from "../react/powerUpStore.ts";
import { showSmoke } from "../react/smokeStore.ts";
import { playAudio, audioConfig } from "../controls/audioHandler.ts";
import { playAnimation, resetHeartEffect } from "../anim/animations.ts";

import GameState from "./gameState.ts";
import type { counter as counterDisplay } from "../react/counterStore.ts";

import { candy, donut, badDonut, star, superstar } from "@assets/ui/power-ups";

type PowerUpType =
  | "double_click"
  | "four_click"
  | "minus_25"
  | "extra_boost"
  | "replenish_boosts";

type PowerUp = {
  type: PowerUpType;
  icon: string;
  duration: number | null;
  weight: number;
  sfx: HTMLAudioElement;
  desc: string;
  effect: "good" | "bad";
};

type PowerUpSystem = {
  spawnCooldown: () => void;
  clearPowerUps: () => void;
};

type PowerUpArgs = {
  counter: typeof counterDisplay;
  state: GameState;
};

export default function setPowerUps({
  counter,
  state,
}: PowerUpArgs): PowerUpSystem {
  const POWER_UPS: PowerUp[] = [
    {
      type: "double_click",
      icon: candy,
      duration: 3000,
      weight: 40,
      sfx: audioConfig.powerUp.audio,
      desc: "2x counter!",
      effect: "good",
    },
    {
      type: "four_click",
      icon: donut,
      duration: 3000,
      weight: 20,
      sfx: audioConfig.powerUp.audio,
      desc: "4x counter!",
      effect: "good",
    },
    {
      type: "minus_25",
      icon: badDonut,
      duration: null,
      weight: 20,
      sfx: audioConfig.penalty.audio,
      desc: "-25 penalty!",
      effect: "bad",
    },
    {
      type: "extra_boost",
      icon: star,
      duration: null,
      weight: 10,
      sfx: audioConfig.boostPowerUp.audio,
      desc: "extra boost!",
      effect: "good",
    },
    {
      type: "replenish_boosts",
      icon: superstar,
      duration: null,
      weight: 8,
      sfx: audioConfig.boostPowerUp.audio,
      desc: "superstar!",
      effect: "good",
    },
  ];

  let spawnTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const resetCountIncrement = () => {
    state.countIncrement = 1;
    state.goalIncRandomizer = [10, 15, 20, 25, 30];
  };

  // applies and resets power-ups
  function addTimedEffect(
    apply: () => void,
    reverse: () => void,
    duration: number,
  ): void {
    apply();
    setTimeout(reverse, duration);
  }

  function choosePowerUp(items: PowerUp[]): PowerUp {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0); // calculate total weight sum
    let pick = Math.random() * totalWeight; // chooses random number

    // iterate and find selected item
    for (const i of items) {
      pick -= i.weight;
      if (pick <= 0) return i;
    }
    return items[0]; // fallback: double_click
  }

  // applies selected power-up effect to GameState
  function applyPowerUp(powerUp: PowerUp): void {
    switch (powerUp.type) {
      // instant effects
      case "extra_boost":
        state.boostsAvailable = Math.min(state.boostsAvailable + 1, 4);
        replenishHearts(state.boostsAvailable, "extra_boost");
        resetHeartEffect();
        break;

      case "replenish_boosts":
        state.boostsAvailable = 4;
        replenishHearts(state.boostsAvailable, "replenish_boosts");
        resetHeartEffect();
        break;

      case "minus_25":
        state.counter -= 25;
        counter.update(state.counter);
        break;

      // timed effects
      case "double_click":
        addTimedEffect(
          () => {
            state.countIncrement = 2;
            state.goalIncRandomizer = [15, 20, 25, 30];
          },
          resetCountIncrement,
          powerUp.duration!,
        );
        break;

      case "four_click":
        addTimedEffect(
          () => {
            state.countIncrement = 4;
            state.goalIncRandomizer = [20, 25, 30];
          },
          resetCountIncrement,
          powerUp.duration!,
        );
        break;
    }
  }

  // puts a falling power-up on screen; collecting or missing it restarts the
  // spawn timer
  function spawnPowerUp(): void {
    const boostsFull: boolean = state.boostsAvailable >= 4;

    const boostTypes: Set<string> = new Set([
      "extra_boost",
      "replenish_boosts",
    ]);
    const options: PowerUp[] = boostsFull
      ? POWER_UPS.filter((p) => !boostTypes.has(p.type))
      : POWER_UPS;

    const powerUp: PowerUp = choosePowerUp(
      options.length > 0 ? options : POWER_UPS,
    );

    powerUps.spawn({
      type: powerUp.type,
      icon: powerUp.icon,
      fall: Math.random() < 0.5 ? "falling" : "falling-reverse",
      side: Math.random() < 0.5 ? "left" : "right",
      xRand: Math.random(),

      onCollect: (rect) => {
        applyPowerUp(powerUp);
        playAudio(powerUp.sfx);

        // puff of smoke next to where the power-up was
        showSmoke("powerUpUsedElement", rect.left + 20, rect.top + 30);

        if (powerUp.effect === "bad") {
          const container = document.getElementById("game-container");
          playAnimation(container, "penalty-shake");
          counter.animate("pop-min");

          flashScreen("flash-penalty");
        } else {
          counter.animate("pop");
        }

        if (!state.isGameOver) spawnCooldown();
      },

      onMiss: () => {
        if (!state.isGameOver) spawnCooldown();
      },
    });
  }

  // cancels the pending spawn timeout - prevents overlaps
  function clearSpawnTimer(): void {
    if (spawnTimeoutId != null) {
      clearTimeout(spawnTimeoutId);
      spawnTimeoutId = null;
    }
  }

  // applies cooldown timer after each power-up spawn
  function spawnCooldown(enabled: boolean = true): void {
    clearSpawnTimer();
    if (!enabled || state.isGameOver) return;

    const minInterval = 6000;
    const maxInterval = 12000;

    const randomInterval =
      Math.random() * (maxInterval - minInterval) + minInterval;

    spawnTimeoutId = setTimeout(() => {
      spawnTimeoutId = null;
      if (!state.isGameOver) {
        spawnPowerUp();
      }
    }, randomInterval);
  }

  // stops all power-up activity: cancels spawn timer + clears screen
  function clearPowerUps(): void {
    clearSpawnTimer();
    powerUps.clear();
  }

  return { spawnCooldown, clearPowerUps };
}

import type { CounterAnimation, GameEvent } from "./events.ts";
import { getRank } from "../../shared/ranks.ts";
import { getPowerUp, type PowerUpType } from "./powerUps.ts";

export const MAX_BOOSTS = 4;
const FIRST_GOAL = 30;
const ROUND_SECONDS = 20;
export const PENALTY_POINTS = 25;

export const DEFAULT_GOAL_STEPS = [10, 15, 20, 25, 30];

export type GameState = {
  counter: number;
  boostsAvailable: number;
  countIncrement: number;
  currentGoal: number;
  goalSteps: number[];
  trueGoalsReached: number;

  highScore: number;
  highScoreAtStart: number;
  isHighScore: boolean;
  highScoreFxPlayed: boolean;
  confettiPlayed: boolean;

  isGameOver: boolean;
  deathCount: number;

  round: number;
  roundSeconds: number;
};

export type GameAction =
  | { type: "increase"; random: number }
  | { type: "boost"; random: number }
  | { type: "restart"; music?: boolean }
  | { type: "timerExpired" }
  | { type: "collectPowerUp"; powerUp: PowerUpType }
  | { type: "powerUpEnded" };

type Update = { state: GameState; events: GameEvent[] };

export function createInitialState(
  saved: { highScore?: number; deathCount?: number } = {},
): GameState {
  return {
    counter: 0,
    boostsAvailable: MAX_BOOSTS,
    countIncrement: 1,
    currentGoal: FIRST_GOAL,
    goalSteps: DEFAULT_GOAL_STEPS,
    trueGoalsReached: 0,

    highScore: saved.highScore ?? 0,
    highScoreAtStart: saved.highScore ?? 0,
    isHighScore: false,
    highScoreFxPlayed: false,
    confettiPlayed: false,

    isGameOver: false,
    deathCount: saved.deathCount ?? 0,

    round: 0,
    roundSeconds: ROUND_SECONDS,
  };
}

// every goal reached makes the countdown 1.2x faster
export function roundSecondsFor(trueGoalsReached: number): number {
  return ROUND_SECONDS / Math.pow(1.2, trueGoalsReached);
}

function pickGoalStep(steps: number[], random: number): number {
  return steps[Math.floor(random * steps.length)];
}

function scoreAndGoal(
  state: GameState,
  animation: CounterAnimation,
  boosted: boolean,
  random: number,
  events: GameEvent[],
): GameState {
  let next = state;
  let counterAnimation = animation;

  if (next.counter > next.highScore) {
    next = { ...next, highScore: next.counter, isHighScore: true };
    events.push({ type: "highScore", score: next.highScore });

    if (!next.highScoreFxPlayed) {
      if (!boosted) counterAnimation = "pop-right";
      events.push({ type: "sound", name: "highScore" });
      next = { ...next, highScoreFxPlayed: true };
    }
    if (!next.confettiPlayed) {
      events.push({ type: "confetti" });
      next = { ...next, confettiPlayed: true };
    }
  }

  if (next.counter >= next.currentGoal) {
    if (!boosted) events.push({ type: "sound", name: "goalReached" });

    const trueGoalsReached = boosted
      ? next.trueGoalsReached
      : next.trueGoalsReached + 1;

    next = {
      ...next,
      currentGoal: next.currentGoal + pickGoalStep(next.goalSteps, random),
      trueGoalsReached,
      round: next.round + 1,
      roundSeconds: roundSecondsFor(trueGoalsReached),
    };
    events.push({ type: "goalChanged", direction: "forward" });
  }

  events.push({ type: "counterAnimation", name: counterAnimation });
  return next;
}

function increase(state: GameState, random: number): Update {
  if (state.isGameOver) return { state, events: [] };

  const events: GameEvent[] = [
    { type: "pressed", button: "increase", disabled: false },
    { type: "sound", name: "buttonInc" },
    { type: "cursorCount", value: state.countIncrement, boosted: false },
  ];

  const next = scoreAndGoal(
    { ...state, counter: state.counter + state.countIncrement },
    "pop",
    false,
    random,
    events,
  );
  return { state: next, events };
}

function boost(state: GameState, random: number): Update {
  if (state.isGameOver) return { state, events: [] };

  if (state.boostsAvailable <= 0) {
    return {
      state,
      events: [
        { type: "pressed", button: "decrease", disabled: true },
        { type: "noBoostsFlash" },
        { type: "sound", name: "noBoosts" },
      ],
    };
  }

  const pointsAdded = state.currentGoal - state.counter;
  const boostsAvailable = state.boostsAvailable - 1;

  const events: GameEvent[] = [
    { type: "pressed", button: "decrease", disabled: false },
    { type: "boostNotification" },
    { type: "sound", name: "useBoost" },
  ];
  if (boostsAvailable === 0) events.push({ type: "noBoostsLeft" });
  events.push({ type: "cursorCount", value: pointsAdded, boosted: true });

  const next = scoreAndGoal(
    { ...state, counter: state.currentGoal, boostsAvailable },
    "pop-dec",
    true,
    random,
    events,
  );
  return { state: next, events };
}

function restart(state: GameState, music = true): Update {
  return {
    state: {
      ...state,
      counter: 0,
      boostsAvailable: MAX_BOOSTS,
      currentGoal: FIRST_GOAL,
      trueGoalsReached: 0,
      highScoreAtStart: state.highScore,
      isHighScore: false,
      highScoreFxPlayed: false,
      confettiPlayed: false,
      isGameOver: false,
      round: state.round + 1,
      roundSeconds: ROUND_SECONDS,
    },
    events: [
      { type: "restarted" },
      ...(music ? [{ type: "sound", name: "bgMusic" } as const] : []),
      { type: "counterAnimation", name: "reset-shake" },
      { type: "goalChanged", direction: "reverse" },
    ],
  };
}

function timerExpired(state: GameState): Update {
  // reaching the goal at the last moment beats the timer
  if (state.counter >= state.currentGoal || state.isGameOver) {
    return { state, events: [] };
  }

  return {
    state: {
      ...state,
      isGameOver: true,
      deathCount: state.deathCount + 1,
    },
    events: [
      { type: "sound", name: "gameOver" },
      { type: "stopSound", name: "bgMusic" },
      {
        type: "gameOver",
        isHighScore: state.isHighScore,
        score: state.counter,
        newRank:
          getRank(state.highScore).min > getRank(state.highScoreAtStart).min
            ? getRank(state.highScore).name
            : undefined,
      },
    ],
  };
}

function collectPowerUp(state: GameState, type: PowerUpType): Update {
  const powerUp = getPowerUp(type);
  let next = state;

  switch (type) {
    case "extra_boost":
      next = {
        ...next,
        boostsAvailable: Math.min(next.boostsAvailable + 1, MAX_BOOSTS),
      };
      break;
    case "replenish_boosts":
      next = { ...next, boostsAvailable: MAX_BOOSTS };
      break;
    case "minus_25":
      next = { ...next, counter: next.counter - PENALTY_POINTS };
      break;
    case "double_click":
      next = { ...next, countIncrement: 2, goalSteps: [15, 20, 25, 30] };
      break;
    case "four_click":
      next = { ...next, countIncrement: 4, goalSteps: [20, 25, 30] };
      break;
  }

  const events: GameEvent[] = [{ type: "sound", name: powerUp.sound }];
  if (powerUp.effect === "bad") {
    events.push({ type: "penalty" });
    events.push({ type: "counterAnimation", name: "pop-min" });
  } else {
    events.push({ type: "counterAnimation", name: "pop" });
  }

  return { state: next, events };
}

function powerUpEnded(state: GameState): Update {
  return {
    state: { ...state, countIncrement: 1, goalSteps: DEFAULT_GOAL_STEPS },
    events: [],
  };
}

export function reduce(state: GameState, action: GameAction): Update {
  switch (action.type) {
    case "increase":
      return increase(state, action.random);
    case "boost":
      return boost(state, action.random);
    case "restart":
      return restart(state, action.music);
    case "timerExpired":
      return timerExpired(state);
    case "collectPowerUp":
      return collectPowerUp(state, action.powerUp);
    case "powerUpEnded":
      return powerUpEnded(state);
  }
}

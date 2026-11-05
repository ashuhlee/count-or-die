import { expect, describe, test } from "vite-plus/test";

import {
  createInitialState,
  DEFAULT_GOAL_STEPS,
  reduce,
  type GameAction,
  type GameState,
} from "../../src/renderer/game/gameLogic.ts";
import type { GameEvent } from "../../src/renderer/game/events.ts";

// runs a list of actions in order, collecting everything that was reported
function play(state: GameState, ...actions: GameAction[]) {
  const events: GameEvent[] = [];
  for (const action of actions) {
    const update = reduce(state, action);
    state = update.state;
    events.push(...update.events);
  }
  return { state, events };
}

const increase = (random = 0): GameAction => ({ type: "increase", random });
const boost = (random = 0): GameAction => ({ type: "boost", random });

const types = (events: GameEvent[]) => events.map((event) => event.type);
const has = (events: GameEvent[], expected: Partial<GameEvent>) =>
  events.some((event) =>
    Object.entries(expected).every(
      ([key, value]) => (event as Record<string, unknown>)[key] === value,
    ),
  );

describe("starting a game", () => {
  test("starts at zero with every boost and the first goal", () => {
    const state = createInitialState();

    expect(state.counter).toBe(0);
    expect(state.boostsAvailable).toBe(4);
    expect(state.currentGoal).toBe(30);
    expect(state.countIncrement).toBe(1);
    expect(state.isGameOver).toBe(false);
    expect(state.roundSeconds).toBe(20);
  });
});

describe("clicking", () => {
  test("adds one point", () => {
    const { state } = play(createInitialState(), increase(), increase());
    expect(state.counter).toBe(2);
  });

  test("adds as many points as the power-up allows", () => {
    const start = { ...createInitialState(), countIncrement: 4 };
    const { state, events } = play(start, increase());

    expect(state.counter).toBe(4);
    expect(has(events, { type: "cursorCount", value: 4 })).toBe(true);
  });

  test("does nothing once the game is over", () => {
    const over = { ...createInitialState(), isGameOver: true };
    const { state, events } = play(over, increase(), boost());

    expect(state).toBe(over);
    expect(events).toEqual([]);
  });
});

describe("high scores", () => {
  test("beating the high score updates it and celebrates once", () => {
    const start = createInitialState({ highScore: 1 });
    const { state, events } = play(start, increase(), increase(), increase());

    expect(state.highScore).toBe(3);
    expect(state.isHighScore).toBe(true);
    // each new best is reported so it can be saved...
    expect(events.filter((e) => e.type === "highScore")).toHaveLength(2);
    // ...but the fanfare and confetti happen once per game
    expect(events.filter((e) => e.type === "confetti")).toHaveLength(1);
    expect(events.filter((e) => e.type === "newBest")).toHaveLength(1);
    expect(has(events, { type: "newBest", boosted: false })).toBe(true);
    expect(
      events.filter((e) => e.type === "sound" && e.name === "highScore"),
    ).toHaveLength(1);
  });

  test("the very first run has no record to celebrate, but saves its score", () => {
    const { state, events } = play(
      createInitialState(),
      increase(),
      increase(),
    );

    expect(state.highScore).toBe(2);
    expect(types(events).filter((type) => type === "highScore")).toHaveLength(
      2,
    );
    expect(state.isHighScore).toBe(false);
    expect(types(events)).not.toContain("confetti");
    expect(types(events)).not.toContain("newBest");
    expect(has(events, { type: "sound", name: "highScore" })).toBe(false);
    expect(has(events, { type: "counterAnimation", name: "pop-right" })).toBe(
      false,
    );
  });
});

describe("goals", () => {
  const nearGoal = () => ({
    ...createInitialState({ highScore: 999 }),
    counter: 29,
  });

  test("reaching the goal raises it by one of the steps", () => {
    // random 0 picks the first step: 10
    const { state, events } = play(nearGoal(), increase(0));

    expect(state.currentGoal).toBe(40);
    expect(has(events, { type: "goalChanged", direction: "forward" })).toBe(
      true,
    );
    expect(has(events, { type: "sound", name: "goalReached" })).toBe(true);
  });

  test("the countdown restarts, faster each goal", () => {
    const first = play(nearGoal(), increase()).state;

    expect(first.round).toBe(1);
    expect(first.roundSeconds).toBeCloseTo(20 / 1.2);
    expect(first.trueGoalsReached).toBe(1);

    const second = play(
      { ...first, counter: first.currentGoal - 1 },
      increase(),
    ).state;
    expect(second.roundSeconds).toBeCloseTo(20 / 1.2 / 1.2);
  });
});

describe("boosting", () => {
  test("jumps to the goal and uses a boost", () => {
    const { state, events } = play(createInitialState(), increase(), boost());

    expect(state.boostsAvailable).toBe(3);
    // the goal was reached, so it moved on (random 0 adds 10)
    expect(state.currentGoal).toBe(40);
    expect(state.counter).toBe(30);
    // the boost notice says how much it added, so nothing floats at the cursor:
    // the only count is the one of the click before it
    expect(events.filter((e) => e.type === "cursorCount")).toHaveLength(1);
  });

  test("with none left it only complains", () => {
    const empty = { ...createInitialState(), boostsAvailable: 0 };
    const { state, events } = play(empty, boost());

    expect(state).toBe(empty);
    expect(events).toEqual([
      { type: "pressed", button: "decrease", disabled: true },
      { type: "noBoostsFlash" },
      { type: "sound", name: "noBoosts" },
    ]);
  });
});

describe("restarting", () => {
  const messy = (): GameState => ({
    ...createInitialState({ highScore: 80, deathCount: 3 }),
    counter: 55,
    boostsAvailable: 1,
    currentGoal: 75,
    trueGoalsReached: 4,
    isHighScore: true,
    highScoreFxPlayed: true,
    confettiPlayed: true,
    isGameOver: true,
    round: 6,
    roundSeconds: 9,
    countIncrement: 2,
  });

  test("goes back to the start but keeps the high score and deaths", () => {
    const { state } = play(messy(), { type: "restart" });

    expect(state).toMatchObject({
      counter: 0,
      boostsAvailable: 4,
      currentGoal: 30,
      trueGoalsReached: 0,
      isHighScore: false,
      highScoreFxPlayed: false,
      confettiPlayed: false,
      isGameOver: false,
      roundSeconds: 20,
      highScore: 80,
      deathCount: 3,
    });
  });
});

describe("running out of time", () => {
  test("ends the game and counts the death", () => {
    const start = { ...createInitialState({ deathCount: 2 }), counter: 12 };
    const { state, events } = play(start, { type: "timerExpired" });

    expect(state.isGameOver).toBe(true);
    expect(state.deathCount).toBe(3);
    expect(events).toEqual([
      { type: "sound", name: "gameOver" },
      { type: "stopSound", name: "bgMusic" },
      { type: "gameOver", isHighScore: false, score: 12 },
    ]);
  });

  test("does nothing if the goal was reached in time", () => {
    const reached = { ...createInitialState(), counter: 30 };
    const { state, events } = play(reached, { type: "timerExpired" });

    expect(state).toBe(reached);
    expect(events).toEqual([]);
  });
});

describe("power-ups", () => {
  const collect = (powerUp: GameAction & { type: "collectPowerUp" }) => powerUp;
  const take = (
    state: GameState,
    powerUp: Parameters<typeof collect>[0]["powerUp"],
  ) => play(state, { type: "collectPowerUp", powerUp });

  test("2x doubles clicks and nudges goals up, until it ends", () => {
    const { state } = take(createInitialState(), "double_click");

    expect(state.countIncrement).toBe(2);
    expect(state.goalSteps).toEqual([15, 20, 25, 30]);

    const ended = play(state, { type: "powerUpEnded" }).state;
    expect(ended.countIncrement).toBe(1);
    expect(ended.goalSteps).toEqual(DEFAULT_GOAL_STEPS);
  });

  test("a time freeze freezes time, until it ends", () => {
    const { state } = take(createInitialState(), "time_freeze");
    expect(state.timeFrozen).toBe(true);

    expect(play(state, { type: "powerUpEnded" }).state.timeFrozen).toBe(false);
  });

  test("the penalty takes 25 points and may go below zero", () => {
    const { state, events } = take(
      { ...createInitialState(), counter: 10 },
      "minus_25",
    );

    expect(state.counter).toBe(-15);
    expect(types(events)).toContain("penalty");
    expect(has(events, { type: "sound", name: "penalty" })).toBe(true);
    expect(has(events, { type: "counterAnimation", name: "pop-min" })).toBe(
      true,
    );
  });

  test("an extra boost adds one, up to the maximum", () => {
    const some = { ...createInitialState(), boostsAvailable: 2 };
    expect(take(some, "extra_boost").state.boostsAvailable).toBe(3);

    expect(
      take(createInitialState(), "extra_boost").state.boostsAvailable,
    ).toBe(4);
    expect(
      has(take(some, "extra_boost").events, {
        type: "sound",
        name: "boostPowerUp",
      }),
    ).toBe(true);
  });
});

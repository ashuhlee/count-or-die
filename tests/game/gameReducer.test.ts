import { expect, describe, test } from "vite-plus/test";

import {
  createInitialState,
  DEFAULT_GOAL_STEPS,
  reduce,
  roundSecondsFor,
  type GameAction,
  type GameState,
} from "../../src/renderer/scripts/game/gameReducer.ts";
import type { GameEvent } from "../../src/renderer/scripts/game/events.ts";

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

  test("starts from the saved high score and death count", () => {
    const state = createInitialState({ highScore: 70, deathCount: 5 });

    expect(state.highScore).toBe(70);
    expect(state.deathCount).toBe(5);
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

  test("reports the press, the sound, the +N and the animation", () => {
    // a high score of 99 keeps this click from being a new best
    const { events } = play(createInitialState({ highScore: 99 }), increase());

    expect(events).toEqual([
      { type: "pressed", button: "increase", disabled: false },
      { type: "sound", name: "buttonInc" },
      { type: "cursorCount", value: 1, boosted: false },
      { type: "counterAnimation", name: "pop" },
    ]);
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
    expect(
      events.filter((e) => e.type === "sound" && e.name === "highScore"),
    ).toHaveLength(1);
  });

  test("a click that sets a high score pops to the right", () => {
    const { events } = play(createInitialState(), increase());
    expect(has(events, { type: "counterAnimation", name: "pop-right" })).toBe(
      true,
    );
  });

  test("tying the high score does not count", () => {
    const start = createInitialState({ highScore: 1 });
    const { state } = play(start, increase());

    expect(state.highScore).toBe(1);
    expect(state.isHighScore).toBe(false);
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

  test("the random number picks which step", () => {
    const steps = DEFAULT_GOAL_STEPS;
    expect(play(nearGoal(), increase(0)).state.currentGoal).toBe(30 + steps[0]);
    expect(play(nearGoal(), increase(0.99)).state.currentGoal).toBe(
      30 + steps[steps.length - 1],
    );
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

  test("an ordinary click that falls short leaves the goal alone", () => {
    const { state, events } = play(createInitialState(), increase());

    expect(state.currentGoal).toBe(30);
    expect(state.round).toBe(0);
    expect(types(events)).not.toContain("goalChanged");
  });

  test("roundSecondsFor speeds up by 1.2x per goal", () => {
    expect(roundSecondsFor(0)).toBe(20);
    expect(roundSecondsFor(2)).toBeCloseTo(20 / 1.44);
  });
});

describe("boosting", () => {
  test("jumps to the goal and uses a boost", () => {
    const { state, events } = play(createInitialState(), increase(), boost());

    expect(state.boostsAvailable).toBe(3);
    // the goal was reached, so it moved on (random 0 adds 10)
    expect(state.currentGoal).toBe(40);
    expect(state.counter).toBe(30);
    expect(has(events, { type: "cursorCount", value: 29, boosted: true })).toBe(
      true,
    );
  });

  test("a boosted goal does not count towards the faster countdown", () => {
    const { state } = play(createInitialState(), boost());

    expect(state.trueGoalsReached).toBe(0);
    expect(state.round).toBe(1);
    expect(state.roundSeconds).toBe(20);
  });

  test("is quiet about reaching the goal, but not about the boost", () => {
    const { events } = play(createInitialState(), boost());

    expect(has(events, { type: "sound", name: "goalReached" })).toBe(false);
    expect(has(events, { type: "sound", name: "useBoost" })).toBe(true);
    expect(types(events)).toContain("boostNotification");
    expect(has(events, { type: "counterAnimation", name: "pop-dec" })).toBe(
      true,
    );
  });

  test("a boost that sets a high score keeps its own animation", () => {
    const { events } = play(createInitialState(), boost());
    expect(has(events, { type: "counterAnimation", name: "pop-right" })).toBe(
      false,
    );
    expect(types(events)).toContain("highScore");
  });

  test("using the last boost says so", () => {
    const start = { ...createInitialState(), boostsAvailable: 1 };
    const { state, events } = play(start, boost());

    expect(state.boostsAvailable).toBe(0);
    expect(types(events)).toContain("noBoostsLeft");

    const earlier = play(createInitialState(), boost()).events;
    expect(types(earlier)).not.toContain("noBoostsLeft");
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

  test("restarts the countdown", () => {
    expect(play(messy(), { type: "restart" }).state.round).toBe(7);
  });

  test("an active power-up carries on", () => {
    expect(play(messy(), { type: "restart" }).state.countIncrement).toBe(2);
  });

  test("reports it so the screen can reset too", () => {
    const { events } = play(messy(), { type: "restart" });

    expect(types(events)).toContain("restarted");
    expect(has(events, { type: "sound", name: "bgMusic" })).toBe(true);
    expect(has(events, { type: "counterAnimation", name: "reset-shake" })).toBe(
      true,
    );
    expect(has(events, { type: "goalChanged", direction: "reverse" })).toBe(
      true,
    );
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

  test("tells whether it was a new high score", () => {
    const { events } = play(createInitialState(), increase(), {
      type: "timerExpired",
    });

    expect(has(events, { type: "gameOver", isHighScore: true, score: 1 })).toBe(
      true,
    );
  });

  test("does nothing if the game is already over", () => {
    const over = { ...createInitialState(), isGameOver: true };
    const { state, events } = play(over, { type: "timerExpired" });

    expect(state).toBe(over);
    expect(events).toEqual([]);
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

  test("4x quadruples clicks", () => {
    const { state } = take(createInitialState(), "four_click");

    expect(state.countIncrement).toBe(4);
    expect(state.goalSteps).toEqual([20, 25, 30]);
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

  test("good ones pop the counter and do not flash the screen", () => {
    const { events } = take(createInitialState(), "double_click");

    expect(types(events)).not.toContain("penalty");
    expect(has(events, { type: "counterAnimation", name: "pop" })).toBe(true);
    expect(has(events, { type: "sound", name: "powerUp" })).toBe(true);
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

  test("the superstar refills every boost", () => {
    const none = { ...createInitialState(), boostsAvailable: 0 };
    expect(take(none, "replenish_boosts").state.boostsAvailable).toBe(4);
  });
});

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { pauseSound, playSound } from "../../audio/sounds.ts";
import { playConfetti } from "../../utils/confetti.ts";
import { youDiedConsole } from "../../utils/youDiedConsole.ts";

import type { GameEvent } from "../../game/events.ts";
import {
  createInitialState,
  reduce,
  type GameAction,
  type GameState,
} from "../../game/gameReducer.ts";
import { getPowerUp, type PowerUpType } from "../../game/powerUps.ts";

import { createEventBus, EventBusContext, type AppEvent } from "./eventBus.ts";
import { formatCounter } from "../../utils/formatCounter.ts";

// how far into a round the countdown bar changes color, and when time is up,
// as a fraction of the round (the bar rounds to whole percents, so these sit
// half a percent before the round numbers)
const STAGE_AT = [0.495, 0.695, 0.845];
const EXPIRES_AT = 0.995;

// the countdown bar's color: 0 healthy, 1 warning, 2 critical, 3 critical fast
export type BarStage = 0 | 1 | 2 | 3;

const GAME_OVER_MUSIC_DELAY = 1000;
const RESTART_LOAD_DELAY = 530;
const LOADING_HIDE_DELAY = 600;

export type Pointer = { x: number; y: number };

export type LoadingScreenState = {
  mounted: boolean;
  visible: boolean;
  hiding: boolean;
};

const NOT_LOADING: LoadingScreenState = {
  mounted: false,
  visible: false,
  hiding: false,
};

export type GameActions = {
  increase: (pointer?: Pointer) => void;
  boost: (pointer?: Pointer) => void;
  // the reset button: start over right now
  reset: () => void;
  // the game over screen's button: start over behind the loading screen
  restartFromGameOver: () => void;
  collectPowerUp: (type: PowerUpType) => void;
  emit: (event: AppEvent) => void;
};

type GameContextValue = {
  state: GameState;
  barStage: BarStage;
  loading: LoadingScreenState;
  actions: GameActions;
};

const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const game = useContext(GameContext);
  if (!game) throw new Error("useGame needs a <GameProvider> above it");
  return game;
}

type GameProviderProps = {
  children: ReactNode;
  // for tests: where the game starts, and what "random" gives
  initialState?: GameState;
  random?: () => number;
};

function readSavedNumber(key: string): number {
  return Number.parseInt(localStorage.getItem(key) ?? "", 10) || 0;
}

function sendToDiscord(
  presence: Parameters<NonNullable<Window["electron"]>["setDiscordStatus"]>[0],
) {
  void window.electron?.setDiscordStatus(presence);
}

export function GameProvider({
  children,
  initialState,
  random = () => Math.random(),
}: GameProviderProps) {
  const [bus] = useState(() => createEventBus());

  const [state, setState] = useState<GameState>(
    () =>
      initialState ??
      createInitialState({
        highScore: readSavedNumber("highScore"),
        deathCount: readSavedNumber("deathCount"),
      }),
  );
  // the latest state, readable straight away (before React re-renders)
  const stateRef = useRef(state);

  const randomRef = useRef(random);
  useEffect(() => {
    randomRef.current = random;
  });

  // timers started by the game; all cleared when the game unmounts
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const later = useCallback((callback: () => void, ms: number) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      callback();
    }, ms);
    timers.current.add(id);
    return id;
  }, []);

  // what the game does besides changing state, for each thing that happens
  const perform = useCallback(
    (event: GameEvent, pointer?: Pointer) => {
      switch (event.type) {
        case "sound":
          playSound(event.name);
          break;
        case "stopSound":
          pauseSound(event.name);
          break;
        case "confetti":
          playConfetti();
          break;
        case "highScore":
          localStorage.setItem("highScore", String(event.score));
          sendToDiscord({ highScoreRPC: event.score });
          break;
        case "gameOver":
          localStorage.setItem(
            "deathCount",
            String(stateRef.current.deathCount),
          );
          later(() => playSound("gameOverMusic"), GAME_OVER_MUSIC_DELAY);
          sendToDiscord({ gameStatusRPC: "game-over" });
          if (!window.electron) youDiedConsole(formatCounter(event.score));
          break;
        case "restarted":
          sendToDiscord({ gameStatusRPC: "in-game" });
          break;
      }

      // let the components react too
      if (event.type === "cursorCount") {
        if (pointer) bus.emit({ ...event, x: pointer.x, y: pointer.y });
      } else {
        bus.emit(event);
      }
    },
    [bus, later],
  );

  const dispatch = useCallback(
    (action: GameAction, pointer?: Pointer) => {
      const update = reduce(stateRef.current, action);

      stateRef.current = update.state;
      setState(update.state);
      update.events.forEach((event) => perform(event, pointer));
    },
    [perform],
  );

  // the countdown: the bar changes color along the way, and time runs out
  const { round, roundSeconds, isGameOver } = state;
  const [stageOfRound, setStageOfRound] = useState({ round: 0, stage: 0 });

  useEffect(() => {
    if (isGameOver) return;

    const ms = roundSeconds * 1000;
    const ids = STAGE_AT.map((at, index) =>
      setTimeout(() => setStageOfRound({ round, stage: index + 1 }), at * ms),
    );
    ids.push(
      setTimeout(() => dispatch({ type: "timerExpired" }), EXPIRES_AT * ms),
    );

    return () => ids.forEach(clearTimeout);
  }, [round, roundSeconds, isGameOver, dispatch]);

  const barStage = (
    stageOfRound.round === round ? stageOfRound.stage : 0
  ) as BarStage;

  // the loading screen between game over and a fresh game
  const [loading, setLoading] = useState(NOT_LOADING);
  const frame = useRef<number>(0);

  const restartFromGameOver = useCallback(() => {
    playSound("buttonClick");
    pauseSound("gameOverMusic");

    setLoading({ mounted: true, visible: false, hiding: false });
    // "visible" arrives a frame after mounting so its CSS transition runs
    frame.current = requestAnimationFrame(() =>
      setLoading((current) =>
        current.mounted ? { ...current, visible: true } : current,
      ),
    );

    later(() => {
      dispatch({ type: "restart" });
      setLoading((current) => ({ ...current, hiding: true }));
      later(() => setLoading(NOT_LOADING), LOADING_HIDE_DELAY);
    }, RESTART_LOAD_DELAY);
  }, [dispatch, later]);

  const actions = useMemo<GameActions>(
    () => ({
      increase: (pointer) =>
        dispatch({ type: "increase", random: randomRef.current() }, pointer),

      boost: (pointer) =>
        dispatch({ type: "boost", random: randomRef.current() }, pointer),

      reset() {
        dispatch({ type: "restart" });
        playSound("mouseClick");
      },

      restartFromGameOver,

      collectPowerUp(type) {
        dispatch({ type: "collectPowerUp", powerUp: type });

        const { duration } = getPowerUp(type);
        if (duration !== null) {
          later(() => dispatch({ type: "powerUpEnded" }), duration);
        }
      },

      emit: bus.emit,
    }),
    [bus, dispatch, later, restartFromGameOver],
  );

  // background music, and cleaning up after ourselves
  useEffect(() => {
    playSound("bgMusic");

    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
      cancelAnimationFrame(frame.current);
    };
  }, []);

  const value = useMemo(
    () => ({ state, barStage, loading, actions }),
    [state, barStage, loading, actions],
  );

  return (
    <EventBusContext.Provider value={bus}>
      <GameContext.Provider value={value}>{children}</GameContext.Provider>
    </EventBusContext.Provider>
  );
}

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { pauseSound, playSound } from "../utils/app/sounds.ts";
import {
  createInitialState,
  reduce,
  RUSH_RATE,
  type GameAction,
  type GameState,
} from "../game/gameLogic.ts";
import { createGameClock, type ClockTimer } from "../game/gameClock.ts";
import { getPowerUp } from "../game/powerUps.ts";
import { loadSavedGame } from "../utils/storage/savedGame.ts";
import { quitGame } from "../utils/app/quitGame.ts";
import { reportBug } from "../utils/app/reportBug.ts";
import { useTimeouts } from "../hooks/useTimeouts.ts";
import { useStartupDone } from "./useStartupDone.ts";
import { createEventBus, EventBusContext } from "./eventBus.ts";
import { performEvent } from "./performEvent.ts";
import { useCountdown } from "./useCountdown.ts";
import {
  GameContext,
  type GameActions,
  type GameContextValue,
  type Pointer,
  type Screen,
} from "./useGame.ts";
import { useLoadingScreen } from "./useLoadingScreen.ts";

type GameProviderProps = {
  children: ReactNode;
  initialState?: GameState;
  random?: () => number;
  startOnMenu?: boolean;
  startedFromGame?: boolean;
};

export default function GameProvider({
  children,
  initialState,
  random = () => Math.random(),
  startOnMenu = false,
  startedFromGame = false,
}: GameProviderProps) {
  const [bus] = useState(() => createEventBus());
  const later = useTimeouts();

  const [state, setState] = useState<GameState>(
    () => initialState ?? createInitialState(loadSavedGame()),
  );

  const [screen, setScreen] = useState<Screen>(startOnMenu ? "menu" : "game");
  const [cameFromGame, setCameFromGame] = useState(startedFromGame);

  const stateRef = useRef(state);

  const [clock] = useState(() => createGameClock());
  useEffect(() => () => clock.clear(), [clock]);

  const [countdownClock] = useState(() => createGameClock());
  useEffect(() => () => countdownClock.clear(), [countdownClock]);

  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-paused", paused);
    return () => document.documentElement.removeAttribute("data-paused");
  }, [paused]);

  const powerUpEnd = useRef<ClockTimer>(undefined);
  useEffect(() => {
    if (state.isGameOver) clock.cancel(powerUpEnd.current);
  }, [state.isGameOver, clock]);

  // time is frozen: the countdown + bar stop
  const frozenRef = useRef(false);
  useEffect(() => {
    frozenRef.current = state.timeFrozen;
    document.documentElement.toggleAttribute("data-frozen", state.timeFrozen);

    if (state.timeFrozen) countdownClock.pause();
    else if (!pausedRef.current) countdownClock.resume();
  }, [state.timeFrozen, countdownClock]);
  useEffect(
    () => () => document.documentElement.removeAttribute("data-frozen"),
    [],
  );

  // time rushes: the countdown and the bar run twice as fast
  useEffect(() => {
    countdownClock.setRate(state.timeRush ? RUSH_RATE : 1);
  }, [state.timeRush, countdownClock]);

  const randomRef = useRef(random);
  useEffect(() => {
    randomRef.current = random;
  });

  const dispatch = useCallback(
    (action: GameAction, pointer?: Pointer) => {
      const update = reduce(stateRef.current, action);
      if (action.type === "restart") clock.cancel(powerUpEnd.current);

      stateRef.current = update.state;
      setState(update.state);

      const { deathCount } = update.state;
      update.events.forEach((event) =>
        performEvent(event, { bus, later, deathCount, pointer }),
      );
    },
    [bus, clock, later],
  );

  const ready = useStartupDone();

  const barStage = useCountdown(
    state,
    () => dispatch({ type: "timerExpired" }),
    countdownClock,
    ready && screen === "game",
  );
  const { loading, cover } = useLoadingScreen(later);

  const actions = useMemo<GameActions>(
    () => ({
      increase: (pointer) =>
        pausedRef.current ||
        dispatch({ type: "increase", random: randomRef.current() }, pointer),

      boost: (pointer) =>
        pausedRef.current ||
        dispatch({ type: "boost", random: randomRef.current() }, pointer),

      endRun() {
        if (stateRef.current.isGameOver) return;
        dispatch({ type: "endRun" });
      },

      restartFromGameOver() {
        cover(() => {
          dispatch({ type: "restart" });
          bus.emit({ type: "pageReset" });
        });
        pauseSound("gameOverMusic");
      },

      play() {
        cover(() => setScreen("game"));
        pauseSound("menuMusic");
      },

      backToMenu() {
        cover(() => {
          dispatch({ type: "restart", music: false });
          bus.emit({ type: "pageReset" });
          setScreen("menu");
          setCameFromGame(true);
        });
        pauseSound("gameOverMusic");
        pauseSound("bgMusic");
      },

      quit: quitGame,

      reportBug,

      collectPowerUp(type) {
        dispatch({
          type: "collectPowerUp",
          powerUp: type,
          random: randomRef.current(),
        });

        const { duration } = getPowerUp(type);
        if (duration !== null) {
          clock.cancel(powerUpEnd.current);
          powerUpEnd.current = clock.after(
            () => dispatch({ type: "powerUpEnded" }),
            duration,
          );
        }
      },

      pause() {
        pausedRef.current = true;
        setPaused(true);
        clock.pause();
        countdownClock.pause();
      },

      resume() {
        pausedRef.current = false;
        setPaused(false);
        clock.resume();
        if (!frozenRef.current) countdownClock.resume();
      },

      emit: bus.emit,
    }),
    [bus, clock, countdownClock, cover, dispatch],
  );

  useEffect(() => {
    void window.electron?.setDiscordStatus({
      gameStatusRPC: screen === "menu" ? "menu" : "in-game",
    });
  }, [screen]);

  useEffect(() => {
    if (!ready) return;

    if (screen === "menu") {
      playSound("menuMusic");
    } else {
      pauseSound("menuMusic");
      playSound("bgMusic");
    }
  }, [ready, screen]);

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      barStage,
      loading,
      actions,
      ready,
      paused,
      clock,
      screen,
      cameFromGame,
    }),
    [
      state,
      barStage,
      loading,
      actions,
      ready,
      paused,
      clock,
      screen,
      cameFromGame,
    ],
  );

  return (
    <EventBusContext.Provider value={bus}>
      <GameContext.Provider value={value}>{children}</GameContext.Provider>
    </EventBusContext.Provider>
  );
}

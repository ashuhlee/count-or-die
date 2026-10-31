import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { pauseSound, playSound } from "../utils/sounds.ts";
import {
  createInitialState,
  reduce,
  type GameAction,
  type GameState,
} from "../game/gameReducer.ts";
import { getPowerUp } from "../game/powerUps.ts";
import { loadSavedGame } from "../utils/savedGame.ts";
import { quitGame } from "../utils/quitGame.ts";
import { reportBug } from "../utils/reportBug.ts";
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
  // open on the menu instead of straight into a game
  startOnMenu?: boolean;
};

export default function GameProvider({
  children,
  initialState,
  random = () => Math.random(),
  startOnMenu = false,
}: GameProviderProps) {
  const [bus] = useState(() => createEventBus());
  const later = useTimeouts();

  const [state, setState] = useState<GameState>(
    () => initialState ?? createInitialState(loadSavedGame()),
  );

  const [screen, setScreen] = useState<Screen>(startOnMenu ? "menu" : "game");

  const stateRef = useRef(state);

  const randomRef = useRef(random);
  useEffect(() => {
    randomRef.current = random;
  });

  const dispatch = useCallback(
    (action: GameAction, pointer?: Pointer) => {
      const update = reduce(stateRef.current, action);

      stateRef.current = update.state;
      setState(update.state);

      const { deathCount } = update.state;
      update.events.forEach((event) =>
        performEvent(event, { bus, later, deathCount, pointer }),
      );
    },
    [bus, later],
  );

  const ready = useStartupDone();

  const barStage = useCountdown(
    state,
    () => dispatch({ type: "timerExpired" }),
    ready && screen === "game",
  );
  const { loading, cover } = useLoadingScreen(later);

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

      restartFromGameOver() {
        playSound("buttonClick");
        pauseSound("gameOverMusic");
        cover(() => {
          dispatch({ type: "restart" });
          bus.emit({ type: "pageReset" });
        });
      },

      play() {
        playSound("buttonClick");
        cover(() => setScreen("game"));
      },

      backToMenu() {
        playSound("buttonClick");
        pauseSound("gameOverMusic");
        cover(() => {
          dispatch({ type: "restart" });
          bus.emit({ type: "pageReset" });
          setScreen("menu");
        });
      },

      quit: quitGame,

      reportBug,

      collectPowerUp(type) {
        dispatch({ type: "collectPowerUp", powerUp: type });

        const { duration } = getPowerUp(type);
        if (duration !== null) {
          later(() => dispatch({ type: "powerUpEnded" }), duration);
        }
      },

      emit: bus.emit,
    }),
    [bus, cover, dispatch, later],
  );

  useEffect(() => {
    if (ready) playSound("bgMusic");
  }, [ready]);

  const value = useMemo<GameContextValue>(
    () => ({ state, barStage, loading, actions, ready, screen }),
    [state, barStage, loading, actions, ready, screen],
  );

  return (
    <EventBusContext.Provider value={bus}>
      <GameContext.Provider value={value}>{children}</GameContext.Provider>
    </EventBusContext.Provider>
  );
}

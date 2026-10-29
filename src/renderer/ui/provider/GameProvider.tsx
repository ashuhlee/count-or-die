import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { pauseSound, playSound } from "../../audio/sounds.ts";
import {
  createInitialState,
  reduce,
  type GameAction,
  type GameState,
} from "../../game/gameReducer.ts";
import { getPowerUp } from "../../game/powerUps.ts";
import { loadSavedGame } from "../../utils/savedGame.ts";
import { useTimeouts } from "../hooks/useTimeouts.ts";
import { createEventBus, EventBusContext } from "./eventBus.ts";
import { performEvent } from "./performEvent.ts";
import { useCountdown } from "./useCountdown.ts";
import {
  GameContext,
  type GameActions,
  type GameContextValue,
  type Pointer,
} from "./useGame.ts";
import { useLoadingScreen } from "./useLoadingScreen.ts";

type GameProviderProps = {
  children: ReactNode;
  // for tests: where the game starts, and what "random" gives
  initialState?: GameState;
  random?: () => number;
};

// Runs the game. The rules (game/) say what happens; this keeps the state,
// does everything else that goes with it (sound, saving, timers) and hands the
// result to the components through useGame().
export default function GameProvider({
  children,
  initialState,
  random = () => Math.random(),
}: GameProviderProps) {
  const [bus] = useState(() => createEventBus());
  const later = useTimeouts();

  const [state, setState] = useState<GameState>(
    () => initialState ?? createInitialState(loadSavedGame()),
  );
  // the latest state, readable straight away (before React re-renders)
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

  const barStage = useCountdown(state, () =>
    dispatch({ type: "timerExpired" }),
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
        cover(() => dispatch({ type: "restart" }));
      },

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

  useEffect(() => playSound("bgMusic"), []);

  const value = useMemo<GameContextValue>(
    () => ({ state, barStage, loading, actions }),
    [state, barStage, loading, actions],
  );

  return (
    <EventBusContext.Provider value={bus}>
      <GameContext.Provider value={value}>{children}</GameContext.Provider>
    </EventBusContext.Provider>
  );
}

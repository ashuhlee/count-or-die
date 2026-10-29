import { useCallback, useEffect, useRef, useState } from "react";

import type { Later } from "../hooks/useTimeouts.ts";
import type { LoadingScreenState } from "./useGame.ts";

const NOT_LOADING: LoadingScreenState = {
  mounted: false,
  visible: false,
  hiding: false,
};

// how long until the screen has covered the game, and how long it takes to go
const COVER_TIME = 530;
const HIDE_TIME = 600;

// The loading screen that hides a restart. `cover` brings it in, calls
// `whileCovered` once it is in the way, then lets it go again.
export function useLoadingScreen(later: Later) {
  const [loading, setLoading] = useState(NOT_LOADING);
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const cover = useCallback(
    (whileCovered: () => void) => {
      setLoading({ mounted: true, visible: false, hiding: false });

      // "visible" arrives a frame after mounting so its CSS transition runs
      frame.current = requestAnimationFrame(() =>
        setLoading((current) =>
          current.mounted ? { ...current, visible: true } : current,
        ),
      );

      later(() => {
        whileCovered();
        setLoading((current) => ({ ...current, hiding: true }));
        later(() => setLoading(NOT_LOADING), HIDE_TIME);
      }, COVER_TIME);
    },
    [later],
  );

  return { loading, cover };
}

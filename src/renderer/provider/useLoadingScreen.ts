import { useCallback, useEffect, useRef, useState } from "react";

import type { Later } from "../hooks/useTimeouts.ts";
import { playSound } from "../utils/app/sounds.ts";
import type { LoadingScreenState } from "./useGame.ts";

const NOT_LOADING: LoadingScreenState = {
  mounted: false,
  visible: false,
  hiding: false,
};

const COVER_TIME = 530;
const HIDE_TIME = 600;

export function useLoadingScreen(later: Later) {
  const [loading, setLoading] = useState(NOT_LOADING);
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const cover = useCallback(
    (whileCovered: () => void) => {
      playSound("loading");
      setLoading({ mounted: true, visible: false, hiding: false });

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

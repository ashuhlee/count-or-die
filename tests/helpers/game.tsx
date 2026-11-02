import { vi } from "vite-plus/test";
import { act, type ComponentType } from "react";

import {
  createInitialState,
  type GameState,
} from "../../src/renderer/game/gameLogic.ts";
import Game from "../../src/renderer/ui/Game.tsx";
import GameProvider from "../../src/renderer/provider/GameProvider.tsx";
import { renderInto } from "./dom.ts";

type RenderGameOptions = {
  state?: Partial<GameState>;
  random?: () => number;
  ui?: ComponentType;
  startOnMenu?: boolean;
};

export function renderGame({
  state,
  random = () => 0,
  ui: Ui = Game,
  startOnMenu = false,
}: RenderGameOptions = {}) {
  const rendered = renderInto(
    <GameProvider
      initialState={state ? { ...createInitialState(), ...state } : undefined}
      random={random}
      startOnMenu={startOnMenu}
    >
      <Ui />
    </GameProvider>,
  );
  const { container } = rendered;

  const $ = <El extends Element = HTMLElement>(selector: string) =>
    container.querySelector<El>(selector);
  const $$ = <El extends Element = HTMLElement>(selector: string) =>
    Array.from(container.querySelectorAll<El>(selector));

  return {
    ...rendered,
    $,
    $$,

    click(selector: string, init: MouseEventInit = {}) {
      act(() => {
        $(selector).dispatchEvent(
          new MouseEvent("click", { bubbles: true, ...init }),
        );
      });
    },

    press(key: string, init: KeyboardEventInit = {}) {
      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key, ...init }));
      });
    },
    wait(ms: number) {
      act(() => {
        vi.advanceTimersByTime(ms);
      });
    },

    // the score as the player reads it
    counter: () => $("#counter").textContent,
  };
}

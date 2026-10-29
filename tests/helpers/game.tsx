import { vi } from "vite-plus/test";
import { act, type ComponentType } from "react";

import {
  createInitialState,
  type GameState,
} from "../../src/renderer/game/gameReducer.ts";
import { Game } from "../../src/renderer/App.tsx";
import { GameProvider } from "../../src/renderer/ui/provider/GameProvider.tsx";
import { renderInto } from "./dom.ts";

type RenderGameOptions = {
  // what the game starts with, on top of a fresh game
  state?: Partial<GameState>;
  // what "random" gives the game rules (0 picks the first goal step)
  random?: () => number;
  // what to show inside the game; the whole game by default
  ui?: ComponentType;
};

// renders the game and gives helpers to play it like a person would
export function renderGame({
  state,
  random = () => 0,
  ui: Ui = Game,
}: RenderGameOptions = {}) {
  const rendered = renderInto(
    <GameProvider
      initialState={state ? { ...createInitialState(), ...state } : undefined}
      random={random}
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

    // moves the fake clock forward, letting React update along the way
    wait(ms: number) {
      act(() => {
        vi.advanceTimersByTime(ms);
      });
    },

    // the score as the player reads it
    counter: () => $("#counter").textContent,
  };
}

import GameState from "./core/gameState.ts";
import {
  counter as counterDisplay,
  formatCounter,
} from "./react/counterStore.ts";
import { mountReact } from "./react/main.tsx";

import checkHardwareAcceleration from "./utils/hardwareAcceleration.ts";

import renderGame from "./containers/gameContainer.ts";
import renderMain from "./containers/mainContainer.ts";

import setGameActions from "./core/gameActions.ts";
import setPowerUps from "./core/powerUps.ts";

import { toggleGameOver, youDiedConsole } from "./core/gameOver.ts";

import { keyboardControls } from "./controls/keyHandler.ts";
import { playAudio, pauseAudio, audioConfig } from "./controls/audioHandler.ts";

import { splitLetters } from "./anim/animations.ts";
import { heartGlitch } from "./anim/glitchEffect.ts";

import { highScore as highScoreDisplay } from "./react/highScoreStore.ts";
import {
  goal as goalDisplay,
  goalText as goalTextDisplay,
} from "./react/goalStore.ts";
import { progressBar as progressBarDisplay } from "./react/progressBarStore.ts";

import { hideLoadingScreen, showLoadingScreen } from "./react/loadingStore.ts";

type DomReference = ReturnType<typeof createDomRefs>;
type GameContext = ReturnType<typeof createGameCtx>;

const DEATH_COUNT_KEY = "deathCount";

const GLITCH_INTERVAL = 6000;
const GAME_OVER_MUSIC_DELAY = 1000;
const RESTART_LOAD_DELAY = 530;
const QUIT_DELAY = 400;

document.addEventListener("DOMContentLoaded", () => {
  void createGame();
});

async function createGame(): Promise<void> {
  await alertHardwareAcceleration();

  playAudio(audioConfig.bgMusic.audio);
  renderContent();

  const ui = createDomRefs();
  const ctx = createGameCtx();

  initUserInterface(ctx);
  bindUIEvents(ctx, ui);
  startGameLoops(ctx);
}

async function alertHardwareAcceleration(): Promise<void> {
  if (!checkHardwareAcceleration()) {
    if (window.electron) {
      await window.electron.showGpuWarning();
    } else {
      alert(
        "Graphic hardware acceleration is disabled. The game requires it for proper performance!",
      );
    }
  }
}

function renderContent(): void {
  renderMain();
  renderGame();
  mountReact();
}

function createDomRefs() {
  return {
    increaseBtn: document.getElementById("increase-img"),
    boostBtn: document.getElementById("decrease-img"),
    resetBtn: document.getElementById("reset-img"),

    gameOverBtn: document.getElementById("game-over-btn"),
    menuBtn: document.getElementById("menu-btn"),
    quitBtn: document.getElementById("quit-btn"),

    deathTracker: document.getElementById("death-tracker"),
    scoreText: document.querySelector<HTMLElement>(".score-text"),
  };
}

function createGameCtx() {
  const progressBar = progressBarDisplay;
  progressBar.reset();
  const state = new GameState();

  const counter = counterDisplay;

  const highScore = highScoreDisplay;
  const goal = goalDisplay;
  const goalText = goalTextDisplay;

  const actions = setGameActions({
    state,
    counter,
    highScore,
    goal,
    goalText,
    bar: progressBar,
    sounds: audioConfig,
  });

  const powerUps = setPowerUps({ counter, state });

  return {
    state,
    actions,
    counter,
    highScore,
    goal,
    goalText,
    progressBar,
    powerUps,
  };
}

function initUserInterface(ctx: GameContext): void {
  splitLetters(".game-name", "wavy");
  heartGlitch();

  ctx.highScore.update(ctx.state.highScore);
  ctx.counter.update(ctx.state.counter);
  ctx.goal.update(ctx.state.currentGoal, false);
}

function bindUIEvents(ctx: GameContext, ui: DomReference): void {
  ui.increaseBtn.addEventListener("click", (e) => onIncrease(ctx, e));
  ui.boostBtn.addEventListener("click", (e) => onBoost(ctx, e));
  ui.resetBtn.addEventListener("click", () => onReset(ctx));

  ui.gameOverBtn.addEventListener("click", () => onGameOverRestart(ctx));
  ui.menuBtn.addEventListener("click", onMenuClick);
  ui.quitBtn.addEventListener("click", onQuitClick);

  keyboardControls({
    onIncrease: ctx.actions.increase,
    onBoost: ctx.actions.jumpToGoal,
    disabled: () => ctx.state.isGameOver,
  });

  document.addEventListener("progressBarExp", () => {
    onTimerExpired(ctx, ui);
  });
}

function startGameLoops(ctx: GameContext): void {
  startGlitchEffectLoop();
  startFrameLoop(ctx);
  ctx.powerUps.spawnCooldown();
}

function startGlitchEffectLoop(): void {
  setInterval(heartGlitch, GLITCH_INTERVAL);
}

function startFrameLoop(ctx: GameContext): void {
  function frame() {
    if (!ctx.state.isGameOver) {
      if (ctx.state.updateHighScore()) {
        ctx.state.isHighScore = true;
      }
      ctx.progressBar.tick(ctx.state.isHighScore);
    }
    requestAnimationFrame(frame);
  }
  frame();
}

function onIncrease(ctx: GameContext, event?: MouseEvent): void {
  if (ctx.state.isGameOver) return;
  ctx.actions.increase(event);
}

function onBoost(ctx: GameContext, event?: MouseEvent): void {
  if (ctx.state.isGameOver) return;
  ctx.actions.jumpToGoal(event);
}

function onReset(ctx: GameContext): void {
  ctx.actions.restartGame();
  playAudio(audioConfig.mouseClick.audio);
  resetPowerUps(ctx);
}

async function onGameOverRestart(ctx: GameContext): Promise<void> {
  playAudio(audioConfig.buttonClick.audio);
  pauseAudio(audioConfig.gameOverMusic.audio);

  showLoadingScreen();
  await delay(RESTART_LOAD_DELAY);

  ctx.actions.restartGame();

  hideLoadingScreen();
  resetPowerUps(ctx);
}

function onMenuClick(): void {
  playAudio(audioConfig.buttonClick.audio);
  setTimeout(() => {
    alert("Oops! The menu is not available in the beta.");
  }, 500);
}

function onQuitClick(): void {
  playAudio(audioConfig.buttonClick.audio);

  if (window.electron) {
    setTimeout(window.electron.quitApp, QUIT_DELAY);
  } else {
    alert("Thank you for playing!");
  }
}

function onTimerExpired(ctx: GameContext, ui: DomReference): void {
  if (ctx.state.isGoalReached() || ctx.state.isGameOver) return;

  playAudio(audioConfig.gameOver.audio);
  pauseAudio(audioConfig.bgMusic.audio);

  setTimeout(() => {
    playAudio(audioConfig.gameOverMusic.audio);
  }, GAME_OVER_MUSIC_DELAY);

  if (window.electron) {
    void window.electron.setDiscordStatus({ gameStatusRPC: "game-over" });
  }

  ctx.state.setGameOver(true);
  ctx.progressBar.stop();
  toggleGameOver(true, ctx.state.isHighScore);

  const nextDeathCount = getDeathCount() + 1;
  setDeathCount(nextDeathCount);

  if (ui.deathTracker) {
    ui.deathTracker.textContent = String(nextDeathCount);
  }

  const currentScore = formatCounter(ctx.state.counter);

  if (ui.scoreText) {
    ui.scoreText.textContent = `Score: ${currentScore}`;
  }
  if (!window.electron) {
    youDiedConsole(currentScore);
  }
}

function resetPowerUps(ctx: GameContext): void {
  ctx.powerUps.clearPowerUps();
  ctx.powerUps.spawnCooldown();
}

function getDeathCount(): number {
  const stored = localStorage.getItem(DEATH_COUNT_KEY);
  const parsed = Number.parseInt(stored ?? "", 10);

  return Number.isNaN(parsed) ? 0 : parsed;
}

function setDeathCount(value: number): void {
  localStorage.setItem(DEATH_COUNT_KEY, String(value));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

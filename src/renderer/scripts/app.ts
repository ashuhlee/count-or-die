
import { GameState } from './core/gameState.ts';
import Counter from './components/counterDisplay.ts';

import checkHardwareAcceleration from './utils/hardwareAcceleration.ts';

import renderGame from './containers/gameContainer.ts';
import renderMain from './containers/mainContainer.ts';

import setGameActions from './core/gameActions.ts';
import setPowerUps from './core/powerUps.ts';

import { toggleGameOver, youDiedConsole } from './core/gameOver.ts';

import { keyboardControls } from './controls/keyHandler.ts';
import { playAudio, pauseAudio, audioConfig } from './controls/audioHandler.ts';

import { splitLetters } from './anim/animations.ts';
import { heartGlitch } from './anim/glitchEffect.ts';

import { setHighScoreDisplay } from './components/highScoreDisplay.ts';
import { setGoalDisplay, setGradientText } from './components/goalDisplay.ts';
import { initProgressBar, updateBarColor } from './components/progressBarDisplay.ts';

import { hideLoadingScreen, showLoadingScreen } from './components/loadingScreen.ts';
import { soundToggle, menuToggle } from './components/menuBar.ts';


type DomReference = ReturnType<typeof createDomRefs>;
type GameContext = ReturnType<typeof createGameCtx>;

const DEATH_COUNT_KEY = 'deathCount';

const GLITCH_INTERVAL = 6000;
const GAME_OVER_MUSIC_DELAY = 1000;
const RESTART_LOAD_DELAY = 530;
const QUIT_DELAY = 400;

document.addEventListener('DOMContentLoaded', () => {
	void createGame();
});

async function createGame(): Promise<void> {

	await alertHardwareAcceleration();

	playAudio(audioConfig.bgMusic.audio);
	renderContent();

	const ui = createDomRefs();
	const ctx = createGameCtx(ui);

	initUserInterface(ctx);
	bindUIEvents(ctx, ui);
	startGameLoops(ctx);
}

async function alertHardwareAcceleration(): Promise<void> {

	if (!checkHardwareAcceleration()) {
		if (window.electron) {
			await window.electron.showGpuWarning();
		}
		else {
			alert('Graphic hardware acceleration is disabled. The game requires it for proper performance!');
		}
	}
}

function renderContent(): void {
	renderMain();
	renderGame();
}

function createDomRefs() {

	return {
		counterText: document.getElementById('counter'),
		counterOuter: document.getElementById('counter-outer'),
		counterShine: document.getElementById('counter-shine'),

		highScoreText: document.getElementById('high-score'),
		goalBox: document.getElementById('next-goal'),
		goalText: document.querySelector<HTMLElement>('.goal-text'),

		increaseBtn: document.getElementById('increase-img'),
		boostBtn: document.getElementById('decrease-img'),
		resetBtn: document.getElementById('reset-img'),

		gameOverBtn: document.getElementById('game-over-btn'),
		menuBtn: document.getElementById('menu-btn'),
		quitBtn: document.getElementById('quit-btn'),

		deathTracker: document.getElementById('death-tracker'),
		scoreText: document.querySelector('.score-text')
	};
}

function createGameCtx(ui: DomReference) {

	const progressBar = initProgressBar();
	const state = new GameState();

	const counter = new Counter({
		textElement: ui.counterText,
		outerElement: ui.counterOuter,
		textShine: ui.counterShine
	})

	const highScore = setHighScoreDisplay(ui.highScoreText);
	const goal = setGoalDisplay(ui.goalBox);
	const goalText = setGradientText(ui.goalText);

	const actions = setGameActions({
		state,
		counter,
		highScore,
		goal,
		goalText,
		bar: progressBar,
		sounds: audioConfig
	})

	const powerUps = setPowerUps({ counter, state });

	return { state, actions, counter, highScore, goal, goalText, progressBar, powerUps }
}

function initUserInterface(ctx: GameContext) {
	splitLetters('.game-name', 'wavy');
	heartGlitch();

	ctx.highScore.update(ctx.state.highScore);
	ctx.counter.update(ctx.state.counter);
	ctx.goal.update(ctx.state.currentGoal, false);
}

function bindUIEvents(ctx: GameContext, ui: DomReference) {

	ui.increaseBtn.addEventListener('click', (e) => onIncrease(ctx, e));
	ui.boostBtn.addEventListener('click', (e) => onBoost(ctx, e));
	ui.resetBtn.addEventListener('click', () => onReset(ctx));

	ui.gameOverBtn.addEventListener('click', () => onGameOverRestart(ctx));
	ui.menuBtn.addEventListener('click', onMenuClick);
	ui.quitBtn.addEventListener('click', onQuitClick);

	keyboardControls({
		onIncrease: ctx.actions.increase,
		onBoost: ctx.actions.jumpToGoal,
		disabled: () => ctx.state.isGameOver
	});

	soundToggle();
	menuToggle();

	document.addEventListener('progressBarExp', () => {
		onTimerExpired(ctx, ui);
	})
}

function startGameLoops(ctx: GameContext) {
	startGlitchEffectLoop();
	startFrameLoop(ctx);
	ctx.powerUps.spawnCooldown();
}

function startGlitchEffectLoop() {
	setInterval(heartGlitch, GLITCH_INTERVAL);
}

function startFrameLoop(ctx: GameContext) {
	function frame() {
		if (!ctx.state.isGameOver) {
			if (ctx.state.updateHighScore()) {
				ctx.state.isHighScore = true;
			}
			updateBarColor(ctx.progressBar, ctx.state.isHighScore);
		}
		requestAnimationFrame(frame);
	}
	frame();
}

function onIncrease(ctx: GameContext, event?: MouseEvent) {
	if (ctx.state.isGameOver) return;
	ctx.actions.increase(event);
}

function onBoost(ctx: GameContext, event?: MouseEvent) {
	if (ctx.state.isGameOver) return;
	ctx.actions.jumpToGoal(event);
}

function onReset(ctx: GameContext) {
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

function onMenuClick() {
	playAudio(audioConfig.buttonClick.audio);
	setTimeout(() => {
		alert('Oops! The menu is not available in the beta.');
	}, 500)
}

function onQuitClick() {
	playAudio(audioConfig.buttonClick.audio);

	if (window.electron) {
		setTimeout(window.electron.quitApp, QUIT_DELAY);
	}
	else {
		alert('Thank you for playing!');
	}
}

function onTimerExpired(ctx: GameContext, ui: DomReference) {
	if (ctx.state.isGoalReached() || ctx.state.isGameOver) return;

	playAudio(audioConfig.gameOver.audio);
	pauseAudio(audioConfig.bgMusic.audio);

	setTimeout(() => {
		playAudio(audioConfig.gameOverMusic.audio);
	}, GAME_OVER_MUSIC_DELAY);

	if (window.electron) {
		window.electron.setDiscordStatus({ gameStatusRPC: 'game-over' });
	}

	ctx.state.setGameOver(true);
	ctx.progressBar.style.animation = 'none';
	toggleGameOver(true, ctx.state.isHighScore);

	const nextDeathCount = getDeathCount() + 1;
	setDeathCount(nextDeathCount);

	if (ui.deathTracker) {
		ui.deathTracker.textContent = String(nextDeathCount);
	}

	const currentScore = ui.counterText?.textContent ?? '0';

	if (ui.scoreText) {
		ui.scoreText.textContent = `Score: ${currentScore}`;
	}
	if (!window.electron) {
		youDiedConsole(currentScore);
	}
}

function resetPowerUps(ctx: GameContext) {
	ctx.powerUps.clearPowerUps();
	ctx.powerUps.spawnCooldown();
}

function getDeathCount(): number {
	const stored = localStorage.getItem(DEATH_COUNT_KEY);
	const parsed = Number.parseInt(stored ?? '', 10);

	return Number.isNaN(parsed) ? 0 : parsed;
}

function setDeathCount(value: number) {
	localStorage.setItem(DEATH_COUNT_KEY, String(value));
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
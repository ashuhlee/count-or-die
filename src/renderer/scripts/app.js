
import { renderGame } from "./containers/gameContainer.js";
import { renderMain } from "./containers/mainContainer.js";

import { setGameActions } from "./core/gameActions.js";
import { setPowerUps } from "./core/powerUps.js";
import { toggleGameOver, youDiedConsole } from "./core/gameOver.js";

import { keyboardControls } from "./controls/keyHandler.js";
import { playAudio, pauseAudio, sounds } from "./controls/audioHandler.js";

import { splitLetters } from "./anim/animations.js";
import { heartGlitch } from "./anim/glitchEffect.js";

import { hideLoadingScreen, showLoadingScreen } from "./components/loadingScreen.js";

import { setGoalDisplay, setGradientText } from "./components/goalDisplay.js";
import { setHighScoreDisplay } from "./components/highScoreDisplay.js";

import { initProgressBar, updateBarColor } from "./components/progressBarDisplay.js";
import { soundToggle } from "./components/menuBar.js";

import { GameState } from "./core/gameState.js";
import { Counter } from "./components/counterDisplay.js";

// localStorage.setItem("high-score", 5); // TESTS: manually reset high score

document.addEventListener("DOMContentLoaded", () => {

	playAudio(sounds.bgMusic);

	// render elements
	renderMain();
	renderGame();

	// initialize game (start progress bar)
	const progressBar = initProgressBar();

	// animations
	splitLetters(".game-name", "wavy");

	setInterval(heartGlitch, 6000);
	heartGlitch();

	let countText = document.getElementById("counter");
	let countOuter = document.getElementById("counter-outer");
	let countShine = document.getElementById("counter-shine");

	let highScoreText = document.getElementById("high-score");
	let goalBox = document.getElementById("next-goal");
	let goalText = document.querySelector(".goal-text");

	// create class instances
	const gameState = new GameState();
	const powerUpSystem = setPowerUps({ state: gameState, bar: progressBar });

	const counterDisplay = new Counter({
		textElement: countText,
		outerElement: countOuter,
		textShine: countShine
	});

	// track progress bar
	let isGameOver = false;

	function animate() {
		if (!isGameOver) {
			if (gameState.updateHighScore()) {
				gameState.isHighScore = true;
			}
			updateBarColor(progressBar, gameState.isHighScore);
		}
		requestAnimationFrame(animate);
	}

	animate();
	powerUpSystem.spawnCooldown();

	const highScoreDisplay = setHighScoreDisplay(highScoreText);
	const goalDisplay = setGoalDisplay(goalBox);
	const goalTextDisplay = setGradientText(goalText);

	// set initial displays
	highScoreDisplay.update(gameState.highScore);
	counterDisplay.update(gameState.counter);
	goalDisplay.update(gameState.currentGoal, false);

	// create game actions
	const actions = setGameActions({
		state: gameState,
		counter: counterDisplay,
		highScore: highScoreDisplay,
		goal: goalDisplay,
		goalText: goalTextDisplay,
		bar: progressBar,
		sounds: sounds,
	});

	async function restartGameOver() {

		showLoadingScreen();
		await new Promise(resolve => setTimeout(resolve, 530));

		isGameOver = false;
		actions.restartGame();

		hideLoadingScreen();

		powerUpSystem.clearPowerUps();
		powerUpSystem.spawnCooldown();
	}


	// button clicks
	document.getElementById("increase-img").addEventListener("click", (e) => {
		if (!gameState.isGameOver) {
			actions.increase(e);
		}
	});

	document.getElementById("decrease-img").addEventListener("click", (e) => {
		if (!gameState.isGameOver) {
			actions.jumpToGoal(e);
		}
	});

	document.getElementById("reset-img").addEventListener("click", () => {
		actions.restartGame();
		playAudio(sounds.reset);
		isGameOver = false;

		powerUpSystem.clearPowerUps();
		powerUpSystem.spawnCooldown();
	});
	document.getElementById("game-over-btn").addEventListener("click", () => {
		restartGameOver();
	});

	// keyb controls
	keyboardControls({
		onIncrease: actions.increase,
		onBoost: actions.jumpToGoal,
		onRestart: actions.restartGame,
		disabled: () => gameState.isGameOver
	});
	soundToggle();

	// game over
	document.addEventListener("progressBarExp", () => {
		if (!gameState.isGoalReached() && !gameState.isGameOver) {

			playAudio(sounds.gameOver);
			pauseAudio(sounds.bgMusic);

			if (window.electron) {
				window.electron.setDiscordStatus({ gameStatusRPC: "game-over" });
			}

			isGameOver = true;
			progressBar.style.animation = "none";

			gameState.setGameOver(true);
			toggleGameOver(true, gameState.isHighScore);

			youDiedConsole(countText.textContent);

			const scoreText = document.querySelector(".score-text");
			scoreText.textContent = `Score: ${countText.textContent}`;

		}
	});

});

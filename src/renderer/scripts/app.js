
import { setGameActions } from "./core/gameActions.js";
import { keyboardControls } from "./controls/keyHandler.js";
import { splitLetters } from "./anim/animations.js";

import { setGoalDisplay, setGradientText } from "./components/goalDisplay.js";
import { setHighScoreDisplay } from "./components/highScoreDisplay.js";
import { initProgressBar, updateBarColor } from "./components/progressBarDisplay.js";

import { toggleGameOver } from "./core/gameOver.js";

import { GameState } from "./core/gameState.js";
import { Counter } from "./components/counterDisplay.js";

import {
	bgMusic,
	highScoreFx,
	buttonIncFx,
	buttonDecFx,
	buttonResetFx,
	goalReachedFx,
	playAudio,
	pauseAudio,
} from "./controls/audioHandler.js";

const ipc = require('electron').ipcRenderer;

// localStorage.setItem("high-score", 5); // TESTS: manually reset high score

document.addEventListener("DOMContentLoaded", () => {

	// initialize game (start audio and progress bar)
	playAudio(bgMusic);
	const progressBar = initProgressBar();

	let gameOverTriggered = false;

	// title text animation
	splitLetters(".game-name", "wavy");

	// track progress bar (every 1 ms)
	setInterval(() =>  updateBarColor(progressBar), 1);

	let countText = document.getElementById("counter");
	let countOuter = document.getElementById("counter-outer");
	let highScoreText = document.getElementById("high-score");
	let goalBox = document.getElementById("next-goal");
	let goalText = document.querySelector(".goal-text");

	// create class instances
	const gameState = new GameState();

	const counterDisplay = new Counter({
		textElement: countText,
		outerElement: countOuter
	});

	const highScoreDisplay = setHighScoreDisplay(highScoreText);
	const goalDisplay = setGoalDisplay(goalBox);
	const goalTextDisplay = setGradientText(goalText);

	// set initial displays
	highScoreDisplay.update(gameState.highScore);
	counterDisplay.update(gameState.counter);
	goalDisplay.update(gameState.currentGoal, false);

	// store sound effects in an object
	const soundFx = {
		bgMusic,
		highScore: highScoreFx,
		buttonInc: buttonIncFx,
		buttonDec: buttonDecFx,
		goalReached: goalReachedFx,
		reset: buttonResetFx
	};

	// create game actions
	const actions = setGameActions({
		state: gameState,
		counter: counterDisplay,
		highScore: highScoreDisplay,
		goal: goalDisplay,
		goalText: goalTextDisplay,
		bar: progressBar,
		sounds: soundFx,
		onRestart: () => {
			gameOverTriggered = false;
		}
	});

	// button clicks
	document.getElementById("increase-img").addEventListener("click", actions.increase);
	document.getElementById("decrease-img").addEventListener("click", actions.decrease);

	document.getElementById("reset-img").addEventListener("click", () => {
		actions.restartGame();
		gameOverTriggered = false;
	});
	document.getElementById("game-over-btn").addEventListener("click", () => {
		actions.restartGame();
		gameOverTriggered = false;
	});

	// keyb controls
	keyboardControls({
		onIncrease: actions.increase,
		onDecrease: actions.decrease,
		onRestart: () => {
			actions.restartGame();
			gameOverTriggered = false;
		},
	});

	// game over
	document.addEventListener("progressBarExp", () => {
		if (!gameState.isGoalReached() && !gameOverTriggered) {

			gameOverTriggered = true;
			toggleGameOver(true);
			pauseAudio(bgMusic);

			console.log(`\u{1F480} game over! final score: ${countText.textContent}`)
		}
	});

	// close app
	function closeApp(e) {
		e.preventDefault();
		ipc.send("close");
	}
	const closeBtn = document.getElementById("closeApp")
	closeBtn.addEventListener("click", closeApp);

});

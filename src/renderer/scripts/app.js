
import { setGameActions } from "./core/gameActions.js";
import { keyboardControls } from "./controls/keyHandler.js";

import { setHighScoreDisplay } from "./components/highScoreDisplay.js";
import { initProgressBar, updateBarColor } from "./components/progressBarDisplay.js";

import { toggleGameOver } from "./core/gameOver.js";

import { GameState } from "./core/gameState.js";
import { Counter } from "./components/counterDisplay.js";

import { bgMusic, highScoreFx, buttonIncFx, buttonDecFx, buttonResetFx, playAudio, pauseAudio } from "./controls/audioHandler.js";

const ipc = require('electron').ipcRenderer;

localStorage.setItem("high-score", 10); // TESTS: manually reset high score

document.addEventListener("DOMContentLoaded", () => {

	// initialize game (start audio and progress bar)
	playAudio(bgMusic);
	const progressBar = initProgressBar();

	// track progress bar (every 1 ms)
	setInterval(() =>  updateBarColor(progressBar), 1);

	let countText = document.getElementById("counter");
	let countOuter = document.getElementById("counter-outer");
	let highScoreText = document.getElementById("high-score");

	// create class instances
	const gameState = new GameState();

	const counterDisplay = new Counter({
		textElement: countText,
		outerElement: countOuter
	});

	const highScoreDisplay = setHighScoreDisplay(highScoreText);

	// set initial displays
	highScoreDisplay.update(gameState.highScore);
	counterDisplay.update(gameState.counter);

	// store sound effects in an object
	const soundFx = {
		bgMusic,
		highScore: highScoreFx,
		buttonInc: buttonIncFx,
		buttonDec: buttonDecFx,
		reset: buttonResetFx
	};

	// create game actions
	const actions = setGameActions({
		state: gameState,
		counter: counterDisplay,
		highScore: highScoreDisplay,
		bar: progressBar,
		sounds: soundFx
	});

	// button clicks
	document.getElementById("increase-img").addEventListener("click", actions.increase);
	document.getElementById("decrease-img").addEventListener("click", actions.decrease);
	document.getElementById("reset-img").addEventListener("click", actions.restartGame);
	document.getElementById("game-over-btn").addEventListener("click", actions.restartGame);

	// keyb controls
	keyboardControls({
		onIncrease: actions.increase,
		onDecrease: actions.decrease,
		onRestart: actions.restartGame,
	});

	// game over
	document.addEventListener("progressBarExp", () => {
		if (!gameState.isGoalReached()) {
			toggleGameOver(true);
			pauseAudio(bgMusic);

			console.log("game over!")
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

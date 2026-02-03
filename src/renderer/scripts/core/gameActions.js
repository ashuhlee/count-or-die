
import { playAudio } from "../controls/audioHandler.js";
import { resetBar } from "../components/progressBarDisplay.js";
import { animateBtn } from "../anim/animations.js";
import { toggleGameOver } from "./gameOver.js";
import { changeTheme, resetTheme } from "../themes/levelTheme.js";


export function setGameActions({ state, counter, highScore, goal, goalText, bar, sounds }) {

	function increase() {

		state.increment();
		animateBtn("increase");
		playAudio(sounds.buttonInc);

		if (state.counter === state.highScore + 1) {
			counter.addNewScoreEffect();
		}

		if (state.counter === 100) {
			changeTheme("theme100", bar);
		}
		if (state.counter === 200) {
			changeTheme("theme200");
		}

		if (state.updateHighScore()) {
			highScore.update(state.highScore);
			highScore.addNewScoreEffect();

			if (!state.highScoreFxPlayed) {

				playAudio(sounds.highScore);
				state.highScoreFxPlayed = true;
			}
		} else {
			counter.removeNewScoreEffect();
		}

		if (state.isGoalReached()) {

			playAudio(sounds.goalReached);
			goal.addNewGoalEffect();
			goalText.addNewTextEffect();

			state.incrementGoal();
			goal.update(state.currentGoal, true);
			resetBar(bar, state.barSpeed());

		}

		counter.animate("pop");
		counter.update(state.counter);
	}

	function decrease() {

		state.decrement();
		animateBtn("decrease");

		if (state.counter === 0) {
			counter.animate("reset-shake");
			counter.update(state.counter);
			playAudio(sounds.reset);
			return;
		}

		playAudio(sounds.buttonDec);
		counter.animate("pop-dec");
		counter.update(state.counter);
	}

	function restartGame() {

		state.reset();

		// reset ui
		resetTheme();

		// remove vfx from last game
		counter.removeNewScoreEffect();
		highScore.removeNewScoreEffect();
		goal.removeNewGoalEffect();

		toggleGameOver(false);

		// reset values
		counter.update(state.counter);
		goal.update(state.currentGoal);
		resetBar(bar, 20);

		// play reset anim + audio
		playAudio(sounds.bgMusic);
		counter.animate("reset-shake");

	}

	return { increase, decrease, restartGame };

}
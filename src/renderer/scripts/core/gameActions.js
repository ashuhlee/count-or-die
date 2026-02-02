
import { playAudio } from "../controls/audioHandler.js";
import { resetBar } from "../components/progressBarDisplay.js";
import { animateBtn } from "../anim/buttonAnim.js";
import { toggleGameOver } from "./gameOver.js";


export function setGameActions({ state, counter, highScore, goal, goalText, bar, sounds }) {

	function increase() {

		state.increment();
		animateBtn("increase");
		playAudio(sounds.buttonInc);

		if (state.counter === state.highScore + 1) {
			counter.addNewScoreEffect();
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

			console.log(`new goal: ${state.currentGoal}`);
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
		counter.animate("reset-shake");
		counter.update(state.counter);
		goal.update(state.currentGoal);

		playAudio(sounds.reset);
		playAudio(sounds.bgMusic);

		counter.removeNewScoreEffect();
		highScore.removeNewScoreEffect();

		goal.removeNewGoalEffect();

		resetBar(bar, 20);
		toggleGameOver(false);
	}

	return { increase, decrease, restartGame };

}
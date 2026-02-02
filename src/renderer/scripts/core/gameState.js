
export class GameState {

	constructor() {
		this.counter = 0;
		this.currentGoal = 30;
		this.goalIncrement = 25;
		this.highScoreFxPlayed = false;
		this.highScore = Number(localStorage.getItem("high-score")) || 0;
	}

	// buttons logic
	increment() {
		this.counter++;
	}
	decrement() {
		this.counter = this.counter > 0 ? this.counter - 1 : 0; // TO-DO: update this with the power-up button
	}
	reset() {
		this.counter = 0;
		this.currentGoal = 30;
		this.highScoreFxPlayed = false;
	}

	// update high score logic
	updateHighScore() {
		// if counter is greater than high score, set new high score in local storage
		// TO-DO: implement better high score storing
		if (this.counter > this.highScore) {

			this.highScore = this.counter;
			localStorage.setItem("high-score", this.highScore);
			return true;
		}
		return false;
	}

	// goal logic
	isGoalReached() {
		// return true if the counter is divisible by 25
		return this.counter === this.currentGoal;
	}
	incrementGoal() {
		this.currentGoal += this.goalIncrement; // goal sets to 25, 50, 75 etc.
	}

	// progress bar logic
	barSpeed() {
		// 1.25x speed increase each round
		let goalsReached = Math.floor((this.currentGoal - 30) / this.goalIncrement);
		return 20 / Math.pow(1.25, goalsReached);
	}
}
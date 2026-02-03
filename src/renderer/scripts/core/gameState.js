
export class GameState {

	constructor() {
		this.counter = 0;

		this.currentGoal = 30;
		this.goalsReached = 0;
		this.goalIncrement = 25; // starting increment
		this.goalIncRandomizer = [10, 15, 20, 25, 30];

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
		this.goalsReached = 0;
		this.highScoreFxPlayed = false;
	}

	getRandomGoal() {
		const i = Math.floor(Math.random() * this.goalIncRandomizer.length);
		return this.goalIncRandomizer[i];
	}

	// update high score logic
	updateHighScore() {

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
		return this.counter === this.currentGoal;
	}
	incrementGoal() {
		this.goalIncrement = this.getRandomGoal();
		this.currentGoal += this.goalIncrement; // random increments of [10, 15, 20, 25, 30]
		this.goalsReached++;
	}

	// progress bar logic
	barSpeed() {
		// 1.25x speed increase each round
		return 20 / Math.pow(1.25, this.goalsReached);
	}
}
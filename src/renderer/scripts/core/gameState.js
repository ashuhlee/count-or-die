
export class GameState {

	constructor() {

		this.isGameOver = false;

		this.counter = 0;
		this.boostsAvailable = 4;
		this.countIncrement = 1;

		this.currentGoal = 30;
		this.goalsReached = 0;
		this.trueGoalsReached = 0; // without boosts

		this.goalIncrement = 25; // starting increment
		this.goalIncRandomizer = [10, 15, 20, 25, 30];

		this.highScoreFxPlayed = false;
		this.highScore = Number(localStorage.getItem("high-score")) || 0;
	}

	// buttons logic
	increment() {
		this.counter += this.countIncrement;
	}
	boost() {
		// TODO: update this with the boost button + other files
		if (this.boostsAvailable <= 0) {
			return false;
		}
		this.counter = this.currentGoal;

		this.goalsReached++;
		this.boostsAvailable--;

		return true;
	}

	setGameOver(value) {
		this.isGameOver = value;
	}
	reset() {
		this.counter = 0;
		this.boostsAvailable = 4;
		this.currentGoal = 30;

		this.goalsReached = 0;
		this.trueGoalsReached = 0;

		this.highScoreFxPlayed = false;
		this.isGameOver = false;
	}

	getRandomGoal() {
		const i = Math.floor(Math.random() * this.goalIncRandomizer.length);
		return this.goalIncRandomizer[i];
	}

	// update high score logic
	updateHighScore() {
		// TODO: implement better high score storing
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
	incrementGoal(boosted = false) {
		this.goalIncrement = this.getRandomGoal();
		this.currentGoal += this.goalIncrement; // random increments of [10, 15, 20, 25, 30]
		this.goalsReached++;

		if (!boosted) {
			this.trueGoalsReached++;
		}
	}

	// 1.2x speed increase each round
	barSpeed() {
		let multiplier = Math.pow(1.2, this.trueGoalsReached);
		let speedIncrease = 20 / multiplier;

		// console.log(`${multiplier.toFixed(2)}x faster`); // tests
		return speedIncrease;
	}
}
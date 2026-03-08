
export default class GameState {

	counter: number;
	boostsAvailable: number;
	countIncrement: number;

	currentGoal: number;
	goalsReached: number;
	trueGoalsReached: number;

	highScore: number;

	goalIncrement: number;
	goalIncRandomizer: number[];

	isGameOver: boolean;
	isHighScore: boolean;

	highScoreFxPlayed: boolean;
	confettiPlayed: boolean;
	gradientFxPlayed: boolean;

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

		this.isHighScore = false;
		this.highScoreFxPlayed = false;

		this.confettiPlayed = false;
		this.gradientFxPlayed = false;

		this.highScore = Number(localStorage.getItem("highScore")) || 0;
	}

	// buttons logic
	increment() {
		this.counter += this.countIncrement;
	}
	boost() {
		if (this.boostsAvailable <= 0) {
			return false;
		}
		this.counter = this.currentGoal;

		this.goalsReached++;
		this.boostsAvailable--;

		return true;
	}

	setGameOver(value: boolean) {
		this.isGameOver = value;
	}
	reset() {
		this.counter = 0;
		this.boostsAvailable = 4;
		this.currentGoal = 30;

		this.goalsReached = 0;
		this.trueGoalsReached = 0;

		this.isHighScore = false;
		this.highScoreFxPlayed = false;

		this.gradientFxPlayed = false;
		this.confettiPlayed = false;

		this.isGameOver = false;
	}

	getRandomGoal() {
		const i = Math.floor(Math.random() * this.goalIncRandomizer.length);
		return this.goalIncRandomizer[i];
	}

	// update high score logic
	updateHighScore() {
		if (this.counter > this.highScore) {
			this.highScore = this.counter;
			this.isHighScore = true;

			localStorage.setItem('highScore', String(this.highScore));

			if (window.electron) {
				void window.electron.setDiscordStatus({ highScoreRPC: this.highScore });
			}
			return true;
		}
		return false;
	}

	// goal logic
	isGoalReached() {
		return this.counter >= this.currentGoal;
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
		const multiplier = Math.pow(1.2, this.trueGoalsReached);
		return 20 / multiplier;
	}
}

import { resetTheme } from "../controls/themeHandler.js";

const phrasesRegular = [
	"you died lolz",
	"lol loser",
	"aw, you died",
	"you died :(",
	"better luck next life..",
	"nice try!",
	"you didn't deserve that..",
	"let's aim a bit higher..",
	"sooo close!"
]

const phrasesNewScore = [
	"new high score!",
	"you beat your best score!",
	"you're getting better!",
	"oooh, a new record!"
]

function setRandomText(arr) {
	const i = Math.floor(Math.random() * arr.length);
	return arr[i];
}

export function toggleGameOver(isGameOver = false, highScoreReached = false) {

	const flash = document.getElementById("red-flash");
	const gameOverScreen = document.getElementById("game-over");

	const displayText = document.querySelector(".go-text-random");

	if (highScoreReached) {
		displayText.textContent = setRandomText(phrasesNewScore);
	}
	else {
		displayText.textContent = setRandomText(phrasesRegular);
	}

    if (isGameOver) {
		flash.classList.add("flash");
		flash.addEventListener("animationend", () => {
			flash.classList.remove("flash");
			gameOverScreen.classList.add("visible");

			setTimeout(() => {
				resetTheme()
			}, 500);

		}, {once: true})
	} else {
		gameOverScreen.classList.remove("visible");
	}
}

export function youDiedConsole(finalScore) {
	console.log(
	"%c▓██   ██▓ ▒█████   █    ██    ▓█████▄  ██▓▓█████ ▓█████▄ \n" +
	" ▒██  ██▒▒██▒  ██▒ ██  ▓██▒   ▒██▀ ██▌▓██▒▓█   ▀ ▒██▀ ██▌\n" +
	"  ▒██ ██░▒██░  ██▒▓██  ▒██░   ░██   █▌▒██▒▒███   ░██   █▌\n" +
	"  ░ ▐██▓░▒██   ██░▓▓█  ░██░   ░▓█▄   ▌░██░▒▓█  ▄ ░▓█▄   ▌\n" +
	"  ░ ██▒▓░░ ████▓▒░▒▒█████▓    ░▒████▓ ░██░░▒████▒░▒████▓ \n" +
	"   ██▒▒▒ ░ ▒░▒░▒░ ░▒▓▒ ▒ ▒     ▒▒▓  ▒ ░▓  ░░ ▒░ ░ ▒▒▓  ▒ \n" +
	" ▓██ ░▒░   ░ ▒ ▒░ ░░▒░ ░ ░     ░ ▒  ▒  ▒ ░ ░ ░  ░ ░ ▒  ▒ \n" +
	" ▒ ▒ ░░  ░ ░ ░ ▒   ░░░ ░ ░     ░ ░  ░  ▒ ░   ░    ░ ░  ░ \n" +
	" ░ ░         ░ ░     ░           ░     ░     ░  ░   ░    \n" +
	" ░ ░                           ░                  ░      \n\n" +
	`Final score: ${finalScore}`, 'color: #FF2659')
}
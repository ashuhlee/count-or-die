
const phrasesRegular = [
	'you died lolz',
	'lol loser',
	'aw, you died',
	'you died :(',
	'better luck next life..',
	'nice try!',
	"let's aim a bit higher..",
	'sooo close!',
	'you are dead',
	'another try maybe?',
	'give it another go!'
]

const phrasesNewScore = [
	'new high score!',
	'you beat your best score!',
	"you're getting better!",
	'oooh, a new record!'
]

function setRandomText(arr) {
	const i = Math.floor(Math.random() * arr.length);
	return arr[i];
}

export function toggleGameOver(isGameOver = false, highScoreReached = false) {

	let isNegative = true;
	const backToMenu = document.getElementById('menu-btn');

	backToMenu.addEventListener('mouseenter', () => {
		backToMenu.style.transform = `scale(1.15) 
			rotate(${isNegative ? '-4deg' : '4deg'})`;

		backToMenu.style.setProperty('--arr-color', isNegative ? '#FBB6FF' : '#FFDEB6');
	})

	backToMenu.addEventListener('mouseleave', () => {
		backToMenu.style.transform = '';
		backToMenu.style.removeProperty('--arr-color');
		if (backToMenu) isNegative = !isNegative;
	})

	const flash = document.getElementById('red-flash');
	const gameOverScreen = document.getElementById('game-over');

	const displayText = document.querySelector('.go-text-random');
	const scoreText = document.querySelector('.score-text');

	if (highScoreReached) {
		displayText.textContent = setRandomText(phrasesNewScore);

		displayText.style.color = `rgba(255, 255, 255, 0.7)`;
		displayText.style.backgroundImage = `var(--rainbow-gradient-bar)`;

		displayText.style.backgroundClip = `text`;
		displayText.style.backgroundSize = `100% auto`;
		displayText.style.backgroundPosition = `0% center`;

		scoreText.style.color = `rgba(255, 255, 255, 0.8)`;
		scoreText.style.backgroundImage = `var(--rainbow-gradient-bar)`;

		scoreText.style.backgroundClip = `text`;
		scoreText.style.backgroundSize = `100% auto`;
		scoreText.style.backgroundPosition = `0% center`;

	}
	else {
		displayText.textContent = setRandomText(phrasesRegular);
	}

    if (isGameOver) {
		flash.classList.add('flash');
		flash.addEventListener('animationend', () => {
			flash.classList.remove('flash');
			gameOverScreen.classList.add('visible');

		}, {once: true})
	} else {
		gameOverScreen.classList.remove('visible');

		displayText.style.color = '';
		displayText.style.backgroundImage = '';
		displayText.style.backgroundClip = '';
		displayText.style.backgroundSize = '';
		displayText.style.backgroundPosition = '';

		scoreText.style.color = '';
		scoreText.style.backgroundImage = '';
		scoreText.style.backgroundClip = '';
		scoreText.style.backgroundSize = '';
		scoreText.style.backgroundPosition = '';
	}
}

export function youDiedConsole(finalScore) {
	console.log(
	'%c▓██   ██▓ ▒█████   █    ██    ▓█████▄  ██▓▓█████ ▓█████▄ \n' +
	' ▒██  ██▒▒██▒  ██▒ ██  ▓██▒   ▒██▀ ██▌▓██▒▓█   ▀ ▒██▀ ██▌\n' +
	'  ▒██ ██░▒██░  ██▒▓██  ▒██░   ░██   █▌▒██▒▒███   ░██   █▌\n' +
	'  ░ ▐██▓░▒██   ██░▓▓█  ░██░   ░▓█▄   ▌░██░▒▓█  ▄ ░▓█▄   ▌\n' +
	'  ░ ██▒▓░░ ████▓▒░▒▒█████▓    ░▒████▓ ░██░░▒████▒░▒████▓ \n' +
	'   ██▒▒▒ ░ ▒░▒░▒░ ░▒▓▒ ▒ ▒     ▒▒▓  ▒ ░▓  ░░ ▒░ ░ ▒▒▓  ▒ \n' +
	' ▓██ ░▒░   ░ ▒ ▒░ ░░▒░ ░ ░     ░ ▒  ▒  ▒ ░ ░ ░  ░ ░ ▒  ▒ \n' +
	' ▒ ▒ ░░  ░ ░ ░ ▒   ░░░ ░ ░     ░ ░  ░  ▒ ░   ░    ░ ░  ░ \n' +
	' ░ ░         ░ ░     ░           ░     ░     ░  ░   ░    \n' +
	' ░ ░                           ░                  ░      \n\n' +
	`Final score: ${finalScore}`, 'color: #FF2659')
}
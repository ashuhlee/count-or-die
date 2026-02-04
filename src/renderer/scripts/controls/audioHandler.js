
// declare assets
const bgMusic = new Audio("../assets/audio/music/the-return-of-the-8-bit-era.mp3");

const buttonIncFx = new Audio("../assets/audio/sfx/button-press-1.mp3");
const buttonDecFx = new Audio("../assets/audio/sfx/button-press-2.mp3");
const buttonResetFx = new Audio("../assets/audio/sfx/reset-press.mp3");

const goalReachedFx = new Audio("../assets/audio/sfx/goal-reached.mp3");
const highScoreFx = new Audio("../assets/audio/sfx/highscore.mp3");
const gameOverFx = new Audio("../assets/audio/sfx/game-over.mp3");

const boostUsedFx = new Audio();
const noBoostsFx = new Audio();

// audio configuration
bgMusic.loop = true;
bgMusic.volume = 0;

buttonIncFx.volume = 1;
buttonDecFx.volume = 0.4;
buttonResetFx.volume = 0.7;

highScoreFx.volume = 0.4;
goalReachedFx.volume = 0.4;
gameOverFx.volume = 1;

// store sound effects in an object
export const sounds = {
	bgMusic,

	buttonInc: buttonIncFx,
	buttonDec: buttonDecFx,

	highScore: highScoreFx,
	goalReached: goalReachedFx,
	gameOver: gameOverFx,

	useBoost: boostUsedFx,
	noBoosts: noBoostsFx,

	reset: buttonResetFx
};


// audio controls
export function playAudio(audio, fromStart = true) {
    if (fromStart) {
        audio.currentTime = 0;
    }
    audio.play().catch((err) => {
        console.warn(`${audio.src} failed to play`, {
            error: err.name,
            message: err.message,
            audioElement: audio
        });
    });
}

export function pauseAudio(audio) {
    audio.pause();
}

export function lowerVolume(audio, targetVolume) {
	if (audio && !audio.paused) {
		audio.volume = targetVolume;
	}
}

// import files
import bgMusicFile from "../../assets/audio/music/the-return-of-the-8-bit-era.mp3";

import btnIncFxFile from "../../assets/audio/sfx/button-press-1.mp3";
import btnDecFxFile from "../../assets/audio/sfx/button-press-2.mp3";
import btnResetFxFile from "../../assets/audio/sfx/reset-press.mp3";

import goalReachedFxFile from "../../assets/audio/sfx/goal-reached.mp3";
import highScoreFxFile from "../../assets/audio/sfx/highscore.mp3";
import gameOverFxFile from "../../assets/audio/sfx/game-over.mp3";

import boostFxFile from "../../assets/audio/sfx/boost.mp3";
import noBoostsFxFile from "../../assets/audio/sfx/error.mp3";

// declare assets
const bgMusic = new Audio(bgMusicFile);

const buttonIncFx = new Audio(btnIncFxFile);
const buttonDecFx = new Audio(btnDecFxFile);
const buttonResetFx = new Audio(btnResetFxFile);

const goalReachedFx = new Audio(goalReachedFxFile);
const highScoreFx = new Audio(highScoreFxFile);
const gameOverFx = new Audio(gameOverFxFile);

const boostUsedFx = new Audio(boostFxFile);
const noBoostsFx = new Audio(noBoostsFxFile);

// audio configuration
bgMusic.loop = true;
bgMusic.volume = 0.2;

buttonIncFx.volume = 1;
buttonDecFx.volume = 0.4;
buttonResetFx.volume = 0.7;

highScoreFx.volume = 0.7;
goalReachedFx.volume = 0.4;
gameOverFx.volume = 1;

boostUsedFx.volume = 0.2;
noBoostsFx.volume = 0.4;

// store sound effects in an object
export const sounds = {
	bgMusic: bgMusic,

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

export function toggleMusic(audio) {
	audio.muted = !audio.muted;
	if (!audio.muted) {
		audio.play();
	}
}
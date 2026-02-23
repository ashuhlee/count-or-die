
// import files
import bgMusicFile from "@assets/audio/music/the-return-of-the-8-bit-era.mp3";

import btnIncFxFile from "@assets/audio/sfx/button-press-1.mp3";
import btnDecFxFile from "@assets/audio/sfx/button-press-2.mp3";

import goalReachedFxFile from "@assets/audio/sfx/goal-reached.mp3";
import highScoreFxFile from "@assets/audio/sfx/highscore.mp3";
import gameOverFxFile from "@assets/audio/sfx/game-over.mp3";

import boostFxFile from "@assets/audio/sfx/boost.mp3";
import noBoostsFxFile from "@assets/audio/sfx/error.mp3";


export const audioConfig = {
    bgMusic: {
		audio: new Audio(bgMusicFile),
		volume: 0.2,
		loop: true
	},
    buttonInc: {
		audio: new Audio(btnIncFxFile),
		volume: 1
	},
    buttonReset: {
		audio: new Audio(btnDecFxFile),
		volume: 0.2
	},
    useBoost: {
		audio: new Audio(boostFxFile),
		volume: 0.2
	},
    noBoosts: {
		audio: new Audio(noBoostsFxFile),
		volume: 0.4
	},
    highScore: {
		audio: new Audio(highScoreFxFile),
		volume: 0.7
	},
    goalReached: {
		audio: new Audio(goalReachedFxFile),
		volume: 0.4
	},
    gameOver: {
		audio: new Audio(gameOverFxFile),
		volume: 1
	}
};

for (const config of Object.values(audioConfig)) {
	config.audio.volume = config.volume;
	if (config.loop) {
		config.audio.loop = true;
	}
}

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
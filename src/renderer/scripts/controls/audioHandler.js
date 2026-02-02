
export const bgMusic = new Audio("../assets/audio/music/pixels.mp3");
export const highScoreFx = new Audio("../assets/audio/sfx/highscore.mp3");

export const buttonIncFx = new Audio("../assets/audio/sfx/button-press-1.mp3");
export const buttonDecFx = new Audio("../assets/audio/sfx/button-press-2.mp3");
export const buttonResetFx = new Audio("../assets/audio/sfx/reset-press.mp3");

export const goalReachedFx = new Audio("../assets/audio/sfx/goal-reached.mp3");

// audio settings
bgMusic.loop = true;
bgMusic.volume = 0;

highScoreFx.volume = 0.8;
buttonIncFx.volume = 1;
buttonDecFx.volume = 0.4;
buttonResetFx.volume = 0.7;

export const playAudio = (audio, fromStart = true) => {
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
};

export const pauseAudio = (audio) => {
    audio.pause();
};

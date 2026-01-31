
export const bgMusic = new Audio("../assets/audio/music/pressxtwice.mp3");
export const highScoreFx = new Audio("../assets/audio/sfx/highscore.mp3");

export const buttonSoundInc = new Audio("../assets/audio/sfx/button-press-1.mp3");
export const buttonSoundDec = new Audio("../assets/audio/sfx/button-press-2.mp3");
export const buttonSoundReset = new Audio("../assets/audio/sfx/reset-press.mp3");

export const goalReachedFx = new Audio();

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
    audio.pause().catch((err) => {
        console.warn(`${audio.src} failed to pause`, {
            error: err.name,
            message: err.message,
            audioElement: audio
        });
    });
};

// audio settings
bgMusic.loop = true;
bgMusic.volume = 0;
highScoreFx.volume = 0.8;
buttonSoundInc.volume = 1;
buttonSoundDec.volume = 0.4;
buttonSoundReset.volume = 0.7;
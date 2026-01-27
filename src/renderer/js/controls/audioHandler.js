
export const bgMusic = new Audio("../assets/audio/music/pressxtwice.mp3");
export const highScoreFx = new Audio("../assets/audio/sfx/highscore.mp3");

export const buttonSoundInc = new Audio("../assets/audio/sfx/button-press-1.mp3");
export const buttonSoundDec = new Audio("../assets/audio/sfx/button-press-2.mp3");
export const buttonSoundReset = new Audio("../assets/audio/sfx/reset-press.mp3");

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

// audio settings
bgMusic.loop = true;
bgMusic.volume = 0.15;
highScoreFx.volume = 0.7;
buttonSoundInc.volume = 1;
buttonSoundDec.volume = 0.2;
buttonSoundReset.volume = 0.7;
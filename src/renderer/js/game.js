
import { bgMusic, highScoreFx, buttonSoundInc, buttonSoundDec, buttonSoundReset, playAudio } from "./controls/audioHandler.js";
import { keyboardControls } from "./controls/keyHandler.js";

import { initProgressBar, updateBarColor, resetBar } from "./components/progressBar.js";
import { gameOver } from "./states/gameOver.js";


let counter = 0;
const goalIncrement = 25;

let highScoreFxPlayed = false;
let highScore = Number(localStorage.getItem("high-score")) || 0;

let progressBar, highScoreEl, countText, countOuter;

const btnImages = {
    increase: {
        normal: "../assets/images/png/buttons/increase.png",
        pressed: "../assets/images/png/buttons/increase-press.png",
    },
    decrease: {
        normal: "../assets/images/png/buttons/decrease.png",
        pressed: "../assets/images/png/buttons/decrease-press.png"
    }
};

const gameOverScreen = document.getElementById("game-over");

document.addEventListener("DOMContentLoaded", () => {

    playAudio(bgMusic);
    progressBar = initProgressBar();

    // track progress bar (every 100 ms)
    setInterval(() => {
        updateBarColor(progressBar);
    }, 100);

    // element references
    highScoreEl = document.getElementById("high-score");
    countText = document.getElementById('counter');
    countOuter = document.getElementById('counter-outer');

    // set initial high score display
    highScoreEl.textContent = "high score: " + highScore;

    // set initial counter display
    updateCounter();

    // event listeners
    document.getElementById("increase-img").addEventListener("click", increase);
    document.getElementById("decrease-img").addEventListener("click", decrease);
    document.getElementById("reset-img").addEventListener("click", restartGame);
    document.getElementById("game-over-btn").addEventListener("click", restartGame);

    // fullscreen game
    document.getElementById("closeApp").addEventListener("click", () =>{
        if (document.fullscreenElement) {
            void document.exitFullscreen();
        }
        else {
            document.documentElement.requestFullscreen().catch(err => {
                console.error("Error when trying to fullscreen: ", err)
            });
        }
    })

    // play with a keyboard
    keyboardControls({
        onIncrease: increase,
        onDecrease: decrease,
        onRestart: restartGame
    });

    // game over
    document.addEventListener("progressBarExp", () => {
        if (counter % goalIncrement !== 0) {
            gameOver();
        }
    })

    const closeBtn = document.getElementById('closeApp');
    closeBtn.addEventListener('click', () => {
        window.electron.closeApp();
    });
});

// localStorage.setItem("high-score", 100); // TESTS: manually reset high score

function updateCounter() {
    // set text content to counter number
    let value = counter.toString();

    countText.textContent = value.padStart(2, '0');
    countOuter.textContent = value.padStart(2, '0');
}

function animateBtn(btnType) {

    const img = document.getElementById(`${btnType}-img`);
    img.src = btnImages[btnType].pressed;

    setTimeout(() => {
        img.src = btnImages[btnType].normal;
    }, 150);
}

// increase counter
function increase() {

    counter++;

    animateBtn("increase");
    playAudio(buttonSoundInc);

    if (counter === highScore + 1) {
        countText.classList.add("new-score-counter");

        setTimeout(() => {
            countText.classList.remove("new-score-counter")}, 200);
    }

    if (counter > highScore) {

        highScore = counter;
        localStorage.setItem("high-score", highScore);
        highScoreEl.textContent = "high score: " + highScore;
        highScoreEl.classList.add("new-score");

        if (highScoreFxPlayed === false) {

            playAudio(highScoreFx);
            highScoreFxPlayed = true;
        }
    }
    else {
        countText.classList.remove("new-score-counter");
    }

    if (counter % goalIncrement === 0) {
        // 1.25x speed increase
        const barSpeed = 20 / Math.pow(1.25, Math.floor(counter / goalIncrement));
        resetBar(progressBar, barSpeed);
    }
    playAnimation("pop");
    updateCounter();
}

// decrease counter
function decrease() {

    counter = counter > 0 ? counter - 1 : 0;
    animateBtn("decrease");

    if (counter === 0) {
        playAnimation("reset-shake");
        updateCounter();
        playAudio(buttonSoundReset);
        return;
    }

    playAudio(buttonSoundDec);
    playAnimation("pop-dec");
    updateCounter()
}

// restart game
function restartGame() {

    counter = 0;
    highScoreFxPlayed = false;

    playAnimation("reset-shake");
    updateCounter();

    playAudio(buttonSoundReset);
    playAudio(bgMusic);

    highScoreEl.classList.remove("new-score");
    countText.classList.remove("new-score-counter");

    resetBar(progressBar, 20);
    gameOverScreen.style.display = "none";
}

// pop animation
function playAnimation(className) {

    countText.style.animation = "none";
    countOuter.style.animation = "none";

    countText.getBoundingClientRect();
    countOuter.getBoundingClientRect();

    countText.style.animation = "";
    countOuter.style.animation = "";

    countText.classList.remove("pop", "pop-dec", "reset-shake");
    countOuter.classList.remove("pop", "pop-dec", "reset-shake");

    countText.classList.add(className);
    countOuter.classList.add(className);
}


import { bgMusic, highScoreFx, buttonSoundInc, buttonSoundDec, buttonSoundReset, playAudio } from "./audio.js";
import { initProgressBar, updateBarColor, resetBar } from "./components/progress-bar.js";


let progressBar;

document.addEventListener("DOMContentLoaded", () => {
    playAudio(bgMusic);

    progressBar = initProgressBar();

    const closeBtn = document.getElementById('closeApp');
    closeBtn.addEventListener('click', () => {
        window.electron.closeApp();
    });
});

localStorage.setItem("high-score", 5); // manually reset high score for tests

let counter = 0;
let highScoreFxPlayed = false;
const highScoreEl = document.getElementById("high-score");

let highScore = Number(localStorage.getItem("high-score")) || 0;
highScoreEl.textContent = "high score: " + highScore;

// store html elements in variables
const countText = document.getElementById('counter');
const countOuter = document.getElementById('counter-outer');

// increase counter
function increase() {

    counter++;

    const img = document.getElementById("increase-img");
    img.src = "../assets/images/png/buttons/increase-press.png";

    setTimeout(() => {
        img.src = "../assets/images/png/buttons/increase.png";
    }, 150);

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
        playAnimation("reset-shake")

        if (highScoreFxPlayed === false) {

            playAudio(highScoreFx);
            highScoreFxPlayed = true;
        }
    }
    else {
        countText.classList.remove("new-score-counter");
    }
    playAnimation("pop");
    updateCounter();
}

// decrease counter
function decrease() {

    counter = counter > 0 ? counter - 1 : 0;

    const img = document.getElementById("decrease-img");
    img.src = "../assets/images/png/buttons/decrease-press.png";

    setTimeout(() => {
        img.src = "../assets/images/png/buttons/decrease.png";
    }, 150);

    if (counter === 0) {
        playAnimation("reset-shake");

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

    resetBar(progressBar);
}

// pop animation
function playAnimation(className) {

    countText.style.animation = "none";
    countOuter.style.animation = "none";

    countText.getBoundingClientRect();

    countText.style.animation = "";
    countOuter.style.animation = "";

    countText.classList.remove("pop", "pop-dec", "reset-shake");
    countOuter.classList.remove("pop", "pop-dec", "reset-shake");

    countText.classList.add(className);
    countOuter.classList.add(className);
}

function updateCounter() {
    let value = counter.toString();

    countText.textContent = value.padStart(2, '0');
    countOuter.textContent = value.padStart(2, '0');
}

document.getElementById("increase-img").addEventListener("click", increase);
document.getElementById("decrease-img").addEventListener("click", decrease);
document.getElementById("reset-img").addEventListener("click", restartGame);

function handleCloseApp() {
}

localStorage.setItem("high-score", 5); // manually reset high score for tests

const backgroundMusic = new Audio("../../assets/audio/music/pressxtwice.mp3");

backgroundMusic.loop = true;
backgroundMusic.volume = 0.15;

document.addEventListener("DOMContentLoaded", () => {

    backgroundMusic.play().catch(err => {
        console.log("autoplay failed :/", err)
    });
});

const highScoreFx = new Audio("../../assets/audio/sfx/highscore.mp3");
highScoreFx.volume = 0.7;
let highScoreFxPlayed = false;

const buttonSoundInc = new Audio("../../assets/audio/sfx/button-press-1.mp3");
const buttonSoundDec = new Audio("../../assets/audio/sfx/button-press-2.mp3");
const buttonSoundReset = new Audio("../../assets/audio/sfx/reset-press.mp3");

let counter = 0;

const highScoreEl = document.getElementById("high-score");

let highScore = Number(localStorage.getItem("high-score")) || 0;
highScoreEl.textContent = "high score: " + highScore;

// store html elements in variables
const countText = document.getElementById('counter')
const countOuter = document.getElementById('counter-outer')

// increase counter
function increase() {

    const img = document.getElementById("increase-img");
    img.src = "../../assets/images/png/buttons/increase-press.png";

    setTimeout(() => {
        img.src = "../../assets/images/png/buttons/increase.png";}, 150);

    buttonSoundInc.currentTime = 0;
    buttonSoundInc.play();

    counter++;

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

            highScoreFx.currentTime = 0;
            highScoreFx.play();
            highScoreFxPlayed = true;
        }
    }
    else {
        countText.classList.remove("new-score-counter");
    }

    updateCounter("pop");
}

// decrease counter
function decrease() {

    const img = document.getElementById("decrease-img");
    img.src = "../../assets/images/png/buttons/decrease-press.png";

    setTimeout(() => {
        img.src = "../../assets/images/png/buttons/decrease.png";}, 150);

    if (counter === 0) {
        playAnimation("reset-shake");

        buttonSoundReset.currentTime = 0;
        buttonSoundReset.play();
        return;
    }

    buttonSoundDec.currentTime = 0;
    buttonSoundDec.volume = 0.2;
    buttonSoundDec.play();

    counter = counter > 0 ? counter - 1 : 0;
    updateCounter("pop-dec")
}

// reset counter
function reset() {

    counter = 0;
    highScoreFxPlayed = false;
    updateCounter("reset-shake");

    buttonSoundReset.currentTime = 0;
    buttonSoundReset.volume = 0.7;
    buttonSoundReset.play();

    highScoreEl.classList.remove("new-score");
    countText.classList.remove("new-score-counter");
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

function updateCounter(animation = "pop") {

    let value = counter.toString()
    playAnimation(animation)

    countText.textContent = value.padStart(2, '0');
    countOuter.textContent = value.padStart(2, '0');

}

// close app
document.addEventListener('DOMContentLoaded', () => {

    const closeBtn = document.getElementById('closeApp');
    closeBtn.addEventListener('click', () => {
        window.electron.closeApp();
    });
});

function handleCloseApp() {
}

// counter logic

let counter = 0;
// localStorage.setItem("high-score", 5); // manually reset high score for tests

// get high score
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

    counter++;

    if (counter > highScore) {

        highScore = counter;
        localStorage.setItem("high-score", highScore);
        highScoreEl.textContent = "high score: " + highScore;
        highScoreEl.classList.add("new-score");

        countText.classList.add("new-score-counter");
        updateCounter("pop-gradient");
    }
    else {
        countText.classList.remove("new-score-counter");
        updateCounter("pop");
    }
}

// decrease counter
function decrease() {

  const img = document.getElementById("decrease-img");
  img.src = "../../assets/images/png/buttons/decrease-press.png";

  setTimeout(() => {
    img.src = "../../assets/images/png/buttons/decrease.png";}, 150);

    if (counter === 0) {
        playAnimation("reset-shake");
        return;
    }
    counter = counter > 0 ? counter - 1 : 0;
    updateCounter("pop-dec")
}

// reset counter
function reset() {

    counter = 0;
    updateCounter("reset-shake");

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


// CLOSE APP
document.addEventListener('DOMContentLoaded', () => {

    const closeBtn = document.getElementById('closeApp');
    closeBtn.addEventListener('click', () => {
        window.electron.closeApp();
  });
});

function handleCloseApp() {
}
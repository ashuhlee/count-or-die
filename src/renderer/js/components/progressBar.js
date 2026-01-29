
export const barColors = {
    primary: "#B4A6FF",
    warning: "#FFD5A5",
    critical: "#f7628b"
}

let animStartTime = null;
let currAnimDuration = 20;

export function initProgressBar() {

    const progressBar = document.getElementById("progress-bar");

    Object.assign(progressBar.style, {
    height: "13px",
    gridArea: "1 / 1",
    animation: "progress-anim 20s linear infinite",
    transformOrigin: "left",
    width: `140px`,
    background: barColors.primary,
    });
    // start animation timer
    animStartTime = Date.now();
    currAnimDuration = 20;

    return progressBar;
}

export function updateBarColor(progressBar) {
    if (!progressBar || !animStartTime) {
        return;
    }

    // track how much time has passed
    let elapsed = (Date.now() - animStartTime) / 1000; // ms to seconds
    let cycle = (elapsed % currAnimDuration) / currAnimDuration;
    const percentage = Math.round((1 - cycle) * 100);

    let progressAnim = `progress-anim ${currAnimDuration}s linear infinite`;
    const blinkAnim = `blink 1s linear infinite`;

    if (percentage < 0.1) {
        const barExpired = new CustomEvent("progressBarExp");
        document.dispatchEvent(barExpired);
        console.log('Game over!');
    }
    if (percentage <= 20) {
        progressBar.style.background = barColors.critical;
        progressBar.style.animation = `${blinkAnim}, ${progressAnim}`;
    }
    else if (percentage <= 50) {
        progressBar.style.background = barColors.warning;
        progressBar.style.animation = progressAnim;
    }
    else {
        progressBar.style.background = barColors.primary;
        progressBar.style.animation = progressAnim;
    }
    // console.log(`Progress bar: ${percentage}%`); // tests
}

export function resetBar(progressBar, speed) {
    if (progressBar) {

        // reset animations
        progressBar.style.animation = "none";
        progressBar.getBoundingClientRect();

        // restore original width
        progressBar.style.width = `140px`;
        progressBar.style.animation = `progress-anim ${speed}s linear infinite`;

        // reset timing and color
        animStartTime = Date.now();
        currAnimDuration = speed;
        progressBar.style.background = barColors.primary;
    }
}
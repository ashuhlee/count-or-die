
export const barColors = {
    primary: "#B4A6FF",
    warning: "#ffb199",
    critical: "#f7628b"
}

let animStartTime = null;
let currAnimDuration = 20;

export function initProgressBar() {

    const progressBar = document.getElementById("progress-bar");
    currAnimDuration = 20;

    Object.assign(progressBar.style, {
		height: "13px",
		gridArea: "1 / 1",
		animation: `progress-anim ${currAnimDuration}s linear infinite`,
		transformOrigin: "left",
		width: `140px`,
		background: barColors.primary,
    });
    // start animation timer
    animStartTime = Date.now();

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

    const blinkSlow = `blink 0.8s linear infinite`;
    const blinkFast = `blink 0.5s linear infinite`;

    if (percentage < 0.1) {
        const barExpired = new CustomEvent("progressBarExp");
        document.dispatchEvent(barExpired);
    }
    else if (percentage <= 15) {
        progressBar.style.background = barColors.critical;
        progressBar.style.animation = `${blinkFast}, ${progressAnim}`;
    }
    else if (percentage <= 30) {
        progressBar.style.background = barColors.critical;
        progressBar.style.animation = `${blinkSlow}, ${progressAnim}`;
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
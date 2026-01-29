
export const barColors = {
    primary: "#B4A6FF",
    warning: "#FFD5A5",
    critical: "#f7628b"
}

export function initProgressBar() {
    const progressBar = document.getElementById("progress-bar");

    Object.assign(progressBar.style, {
    height: "13px",
    gridArea: "1 / 1",
    animation: "progress-anim 10s linear infinite",
    transformOrigin: "left",
    width: `140px`,
    background: barColors.primary,
    });

    return progressBar;
}

export function updateBarColor(progressBar, clr) {
    if (progressBar) {
        progressBar.style.background = barColors[clr];
    }
}

export function resetBar(progressBar) {
    if (progressBar) {

        progressBar.style.animation = "none";
        progressBar.getBoundingClientRect();
        progressBar.style.animation = "progress-anim 20s linear infinite";
    }
}
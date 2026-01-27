// progress-bar.js
export class ProgressBar {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.colors = {
            primary: "#B4A6FF",
            warning: "#FFB366",
            critical: "#FF6B6B"
        };
        this.init();
    }

    init() {
        Object.assign(this.element.style, {
            height: "13px",
            gridArea: "1 / 1",
            animation: "progress-anim 20s linear infinite",
            transformOrigin: "left",
            background: this.colors.primary,
        });
    }

    updateWidth(score) {
        this.element.style.width = `${Math.max(0, parseInt(score) || 0)}px`;
    }

    updateColor(colorKey) {
        this.element.style.background = this.colors[colorKey] || this.colors.primary;
    }
}

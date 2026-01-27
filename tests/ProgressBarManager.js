import { ProgressBar } from "./progress-bar.js";

// Initialize progress bar
const progressBar = new ProgressBar("progress-bar");
progressBar.updateWidth(140); // Set initial width

// Update dynamically when needed
function updateProgressBar(score) {
    progressBar.updateWidth(score);
    
    // Change color based on score thresholds
    if (score > 100) {
        progressBar.updateColor('critical');
    } else if (score > 50) {
        progressBar.updateColor('warning');
    } else {
        progressBar.updateColor('primary');
    }
}

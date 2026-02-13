
import { barColors } from "../components/progressBarDisplay.js";

import tile4 from "../../assets/ui/textures/tile-4.png";
import resetBtnPink from "../../assets/ui/buttons/reset-btn-pink.png";
import resetBtnDefault from "../../assets/ui/buttons/reset-btn.png";

export function changeTheme(level, progressBar) {

	const resetBtn = document.getElementById('reset-img');

	switch (level) {
		case 'theme200':

			barColors.primary = "#ffa2f1";
			if (progressBar) {
				progressBar.style.background = barColors.primary;
			}

			document.body.style.backgroundImage = `url("${tile4}")`;
			resetBtn.src = resetBtnPink;

			document.documentElement.style.setProperty('--shadow-pink-005', 'var(--shadow-purple-005)');
			document.documentElement.style.setProperty('--shadow-pink-015', 'var(--shadow-purple-015)');
			document.documentElement.style.setProperty('--shadow-pink-020', 'var(--shadow-purple-020)');

			const gradientStops = document.querySelectorAll('#default-color stop');

			gradientStops[0].setAttribute('stop-color', '#EEE0FF');
			gradientStops[1].setAttribute('stop-color', '#E7B4FF');
			gradientStops[2].setAttribute('stop-color', '#6458CE');

			break;

		case 'theme300':

			document.body.style.backgroundImage = `url("${tile4}")`;
			break;
	}
}

export function resetTheme() {

	barColors.primary = "#B4A6FF";
	document.body.style.backgroundImage = '';

	const resetBtn = document.getElementById('reset-img');
	resetBtn.src = resetBtnDefault;

	document.documentElement.style.setProperty('--shadow-pink-005', '');
	document.documentElement.style.setProperty('--shadow-pink-015', '');
	document.documentElement.style.setProperty('--shadow-pink-020', '');

	const gradientStops = document.querySelectorAll('#default-color stop');

    gradientStops[0].setAttribute('stop-color', '#FFDAF6');
    gradientStops[1].setAttribute('stop-color', '#DF7FC7');
    gradientStops[2].setAttribute('stop-color', '#B5519C');
}
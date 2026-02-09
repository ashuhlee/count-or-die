
import { PowerGlitch } from "powerglitch";

export function createGlitch(element, duration = 2500, iterations = 4) {

	PowerGlitch.glitch(element, {
		playMode: 'always',
		timing: {
			duration: duration,
			iterations: iterations,
			easing: 'ease'
		},
		shake: {
			velocity: 4,
		},
		slice: {
			count: 2,
			hueRotate: false
		},
	});
}

export function heartGlitch() {
	const hearts = ['.heart4', '.heart2', '.heart1', '.heart3'];
	const delay = 400;

	hearts.forEach((heartItem, index) => {
		setTimeout(() => {
			PowerGlitch.glitch(heartItem, {
				playMode: 'always',
				timing: {
					duration: 2500,
					easing: 'ease',
					iterations: 1
				},
				glitchTimeSpan: {
					start: 0,
					end: 0.16,
				},
				shake: {
					velocity: 1,
				},
				slice: {
					count: 2,
					cssFilters: 'brightness(1.05)',
					hueRotate: false
				}
			});
		}, index * delay)
	});
}
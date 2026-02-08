
import { PowerGlitch } from "powerglitch";

export function createGlitch(element, duration, iterations) {

	PowerGlitch.glitch(element, {
		timing: {
			duration: duration,
			iterations: iterations,
			easing: 'linear'
		},
		shake: {
			velocity: 10,
		},
		slice: {
			count: 3,
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
					hueRotate: false
				}
			});
		}, index * delay)
	});
}
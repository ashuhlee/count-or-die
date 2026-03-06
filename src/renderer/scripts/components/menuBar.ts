
import { audioConfig, toggleAudio } from '../controls/audioHandler.ts';

import soundBtnMuted from '@assets/ui/svg/sound-button-muted.svg';
import soundBtnNoMusic from '@assets/ui/svg/sound-button-no_music.svg';
import soundBtnUnmuted from '@assets/ui/svg/sound-button-reg.svg';

export function soundToggle(): void {

	const toggleSoundBtn = document.getElementById('soundBtn') as HTMLImageElement;
	if (!toggleSoundBtn) return;

	let state = 0;

	function applyState(state: number) {
		if (state === 0) {
			// sfx + music
			audioConfig.bgMusic.audio.muted = false;
			toggleAudio(false);
			toggleSoundBtn.src = soundBtnUnmuted;
		}
		else if (state === 1) {
			// sfx + no music
			audioConfig.bgMusic.audio.muted = true;
			toggleAudio(false);
			toggleSoundBtn.src = soundBtnNoMusic;
		}
		else {
			// no sfx + no music
			audioConfig.bgMusic.audio.muted = true;
			toggleAudio(true);
			toggleSoundBtn.src = soundBtnMuted;
		}

		localStorage.setItem('soundState', state.toString());
	}
	// restored saved audio settings
	const saved = localStorage.getItem('soundState');
	if (saved !== null) {
		state = parseInt(saved);
		applyState(state);
	}

	toggleSoundBtn.addEventListener('click', () => {
		state = (state + 1) % 3;
		applyState(state);
	})
}

export function menuToggle(): void {
	const menuBtn = document.getElementById('optionsBtn') as HTMLImageElement;

	menuBtn.addEventListener('click', () => {
		alert('Oops! The settings menu is not available in the beta.');
	})
}
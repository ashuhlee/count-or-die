import { audioConfig, playAudio, toggleMusic } from "../controls/audioHandler.js";

import soundBtnMuted from "@assets/ui/svg/sound-button-muted.svg";
import soundBtnUnmuted from "@assets/ui/svg/sound-button-reg.svg";

export function soundToggle() {

	const toggleSoundBtn = document.getElementById("soundBtn");
	const savedMutedState = localStorage.getItem("soundMuted");

	if (savedMutedState !== null) {
		audioConfig.bgMusic.audio.muted = (savedMutedState === "true");
		toggleSoundBtn.src = audioConfig.bgMusic.audio.muted ? soundBtnMuted : soundBtnUnmuted;
	}

	toggleSoundBtn.addEventListener("click", () => {
		// console.log(`is sound playing: ${sounds.bgMusic.muted.toString()}`);
		playAudio(audioConfig.mouseClick.audio);
		toggleMusic(audioConfig.bgMusic.audio);
		toggleSoundBtn.src = audioConfig.bgMusic.audio.muted ? soundBtnMuted : soundBtnUnmuted;

		localStorage.setItem("soundMuted", audioConfig.bgMusic.audio.muted.toString());
	})
}
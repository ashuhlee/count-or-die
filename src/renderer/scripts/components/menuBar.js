import { sounds, toggleMusic } from "../controls/audioHandler.js";

import soundBtnMuted from "../../assets/ui/svg/sound-button-muted.svg";
import soundBtnUnmuted from "../../assets/ui/svg/sound-button-reg.svg";

export function soundToggle() {

	const toggleSoundBtn = document.getElementById("soundBtn");
	const savedMutedState = localStorage.getItem("soundMuted");

	if (savedMutedState !== null) {
		sounds.bgMusic.muted = (savedMutedState === "true");
		toggleSoundBtn.src = sounds.bgMusic.muted ? soundBtnMuted : soundBtnUnmuted;
	}

	toggleSoundBtn.addEventListener("click", () => {
		console.log(`is sound playing: ${sounds.bgMusic.muted.toString()}`);
		toggleMusic(sounds.bgMusic);
		toggleSoundBtn.src = sounds.bgMusic.muted ? soundBtnMuted : soundBtnUnmuted;

		localStorage.setItem("soundMuted", sounds.bgMusic.muted.toString());
	})
}
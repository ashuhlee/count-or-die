import { sounds, toggleMusic } from "../controls/audioHandler.js";

import soundBtnMuted from "../../assets/ui/svg/sound-button-muted.svg";
import soundBtnUnmuted from "../../assets/ui/svg/sound-button-reg.svg";

export function soundToggle() {

	const toggleSoundBtn = document.getElementById("soundBtn");

	toggleSoundBtn.addEventListener("click", () => {
		console.log("clicked")
		toggleMusic(sounds.bgMusic);
		toggleSoundBtn.src = sounds.bgMusic.muted ? soundBtnMuted : soundBtnUnmuted;
	})
}
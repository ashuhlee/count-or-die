import { useEffect, useState } from "react";

import soundBtnMuted from "@assets/ui/svg/sound-button-muted.svg";
import soundBtnNoMusic from "@assets/ui/svg/sound-button-no_music.svg";
import soundBtnUnmuted from "@assets/ui/svg/sound-button-reg.svg";
import optionsBtnSvg from "@assets/ui/svg/options-button.svg";

import { audioConfig, toggleAudio } from "../controls/audioHandler.ts";

const SOUND_STATE_KEY = "soundState";

// 0: sfx + music, 1: sfx + no music, 2: no sfx + no music
const SOUND_ICONS = [soundBtnUnmuted, soundBtnNoMusic, soundBtnMuted];

function applySoundState(state: number): void {
  audioConfig.bgMusic.audio.muted = state !== 0;
  toggleAudio(state >= 2);
  localStorage.setItem(SOUND_STATE_KEY, state.toString());
}

function readSavedState(): number {
  const saved = localStorage.getItem(SOUND_STATE_KEY);
  return saved === null ? 0 : parseInt(saved);
}

export default function Controls() {
  const [soundState, setSoundState] = useState(readSavedState);

  // restore saved audio settings
  useEffect(() => {
    if (localStorage.getItem(SOUND_STATE_KEY) !== null) {
      applySoundState(soundState);
    }
    // only on mount
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSoundClick(): void {
    const next = (soundState + 1) % 3;
    setSoundState(next);
    applySoundState(next);
  }

  return (
    <>
      <img
        id="soundBtn"
        alt="sound icon"
        src={SOUND_ICONS[soundState] ?? soundBtnMuted}
        onClick={onSoundClick}
      />
      <img
        id="optionsBtn"
        alt="options icon"
        src={optionsBtnSvg}
        onClick={() =>
          alert("Oops! The settings menu is not available in the beta.")
        }
      />
    </>
  );
}

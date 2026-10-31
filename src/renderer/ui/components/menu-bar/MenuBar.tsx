import { useEffect, useState, type CSSProperties } from "react";

import soundBtnMuted from "@assets/ui/svg/sound-button-muted.svg";
import soundBtnNoMusic from "@assets/ui/svg/sound-button-no_music.svg";
import soundBtnUnmuted from "@assets/ui/svg/sound-button-reg.svg";
import optionsBtnSvg from "@assets/ui/svg/options-button.svg";
import roundBtnPurple from "@assets/ui/buttons/round-btn-purple.png";
import roundBtnGrey from "@assets/ui/buttons/round-btn-grey.png";

import { audioConfig, toggleAudio } from "../../../utils/sounds.ts";

const SOUND_STATE_KEY = "soundState";

// 0: sfx + music, 1: sfx + no music, 2: no sfx + no music
const SOUND_ICONS = [soundBtnUnmuted, soundBtnNoMusic, soundBtnMuted];

function applySoundState(state: number): void {
  audioConfig.bgMusic.audio.muted = state !== 0;
  audioConfig.menuMusic.audio.muted = state !== 0;
  toggleAudio(state >= 2);
  localStorage.setItem(SOUND_STATE_KEY, state.toString());
}

function readSavedState(): number {
  const saved = localStorage.getItem(SOUND_STATE_KEY);
  return saved === null ? 0 : parseInt(saved);
}

const ENTRANCE = { delay: 0, step: 0.14 };
type MenuBarProps = { entrance?: "wait" | "play" };

export default function MenuBar({ entrance }: MenuBarProps) {
  const [soundState, setSoundState] = useState(readSavedState);

  // restore saved audio settings
  useEffect(() => {
    if (localStorage.getItem(SOUND_STATE_KEY) !== null) {
      applySoundState(soundState);
    }
  }, []);

  function onSoundClick(): void {
    const next = (soundState + 1) % 3;
    setSoundState(next);
    applySoundState(next);
  }

  const entering = (index: number) => ({
    className: `round-btn${entrance ? " bounce-in-right" : ""}`,
    style: entrance
      ? ({
          animationDelay: `${ENTRANCE.delay + index * ENTRANCE.step}s`,
          animationPlayState: entrance === "play" ? "running" : "paused",
        } as CSSProperties)
      : undefined,
  });

  return (
    <div className="controls">
      <button
        type="button"
        {...entering(1)}
        onClick={() =>
          alert("Oops! The settings menu is not available in the beta.")
        }
      >
        <img className="round-btn-face" alt="" src={roundBtnPurple} />
        <img
          className="round-btn-icon"
          alt="options icon"
          src={optionsBtnSvg}
        />
      </button>
      <button type="button" {...entering(0)} onClick={onSoundClick}>
        <img className="round-btn-face" alt="" src={roundBtnGrey} />
        <img
          id="soundBtn"
          className="round-btn-icon"
          alt="sound icon"
          src={SOUND_ICONS[soundState] ?? soundBtnMuted}
        />
      </button>
    </div>
  );
}

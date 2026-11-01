import { useEffect, useState, type CSSProperties } from "react";

import soundBtnMuted from "@assets/ui/svg/sound-button-muted.svg";
import soundBtnNoMusic from "@assets/ui/svg/sound-button-no_music.svg";
import soundBtnUnmuted from "@assets/ui/svg/sound-button-reg.svg";
import optionsBtnSvg from "@assets/ui/svg/options-button.svg";
import homeBtnSvg from "@assets/ui/svg/home-button.svg";
import githubBtnSvg from "@assets/ui/svg/github-button.svg";

import { audioConfig, toggleAudio } from "../../../utils/sounds.ts";
import { openGithub } from "../../../utils/openGithub.ts";
import RoundButton from "../round-button/RoundButton.tsx";
import Tooltip from "../tooltip/Tooltip.tsx";

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
type MenuBarProps = {
  entrance?: "wait" | "play";
  onHome?: () => void;
  // the settings menu is not ready for the game page yet
  inGame?: boolean;
};

export default function MenuBar({ entrance, onHome, inGame }: MenuBarProps) {
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
    className: entrance ? "bounce-in-right" : undefined,
    style: entrance
      ? ({
          animationDelay: `${ENTRANCE.delay + index * ENTRANCE.step}s`,
          animationPlayState: entrance === "play" ? "running" : "paused",
        } as CSSProperties)
      : undefined,
  });

  return (
    <div className="controls">
      {onHome && (
        <RoundButton
          {...entering(2)}
          variant={5}
          icon={homeBtnSvg}
          iconAlt="home icon"
          iconSize={28}
          id="home-btn"
          onClick={onHome}
        />
      )}
      {!inGame && (
        <RoundButton
          {...entering(1)}
          variant={5}
          icon={optionsBtnSvg}
          iconAlt="options icon"
          iconSize={24}
          onClick={() =>
            alert("Oops! The settings menu is not available in the beta.")
          }
        />
      )}
      <RoundButton
        {...entering(0)}
        variant={soundState >= 2 ? 4 : 5}
        icon={SOUND_ICONS[soundState] ?? soundBtnMuted}
        iconAlt="sound icon"
        iconSize={28}
        iconId="soundBtn"
        onClick={onSoundClick}
      />
      {!inGame && (
        <Tooltip text="Contribute" placement="cursor">
          <RoundButton
            {...entering(2)}
            variant={5}
            icon={githubBtnSvg}
            iconAlt="github icon"
            iconSize={30}
            id="github-btn"
            onClick={openGithub}
          />
        </Tooltip>
      )}
    </div>
  );
}

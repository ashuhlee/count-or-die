import { useEffect, useState, type CSSProperties } from "react";

import soundBtnMuted from "@assets/ui/svg/sound-button-muted.svg";
import soundBtnNoMusic from "@assets/ui/svg/sound-button-no_music.svg";
import soundBtnUnmuted from "@assets/ui/svg/sound-button-reg.svg";
import optionsBtnSvg from "@assets/ui/svg/options-button.svg";
import homeBtnSvg from "@assets/ui/svg/home-button.svg";
import infoBtnSvg from "@assets/ui/svg/info-button.svg";
import lockIcon from "@assets/ui/deco/lock_grey.svg";
import skullIcon from "@assets/ui/deco/skull_grey.svg";

import { muteMusic, toggleAudio } from "../../../../utils/app/sounds.ts";
import { openChangelog } from "../../../../utils/app/openChangelog.ts";
import {
  onSettingsRequested,
  requestSettings,
} from "../../../../utils/events/settingsNotice.ts";
import GameNotification from "../../../overlays/game-notification/GameNotification.tsx";
import { useTimedNotification } from "../../../overlays/game-notification/useTimedNotification.ts";
import RoundButton from "../../buttons/round-button/RoundButton.tsx";
import Tooltip from "../../../overlays/tooltip/Tooltip.tsx";

const SOUND_STATE_KEY = "soundState";

// 0: sfx + music, 1: sfx + no music, 2: no sfx + no music
const SOUND_ICONS = [soundBtnUnmuted, soundBtnNoMusic, soundBtnMuted];

function applySoundState(state: number): void {
  muteMusic(state !== 0);
  toggleAudio(state >= 2);
  localStorage.setItem(SOUND_STATE_KEY, state.toString());
}

function readSavedState(): number {
  const saved = localStorage.getItem(SOUND_STATE_KEY);
  return saved === null ? 0 : parseInt(saved);
}

const ENTRANCE = { delay: 0, step: 0.14 };
const WELCOME_DELAY = 0.2;
type MenuBarProps = {
  entrance?: "wait" | "play";
  onHome?: () => void;
  onHelp?: () => void;
  inGame?: boolean;
};

export default function MenuBar({
  entrance,
  onHome,
  onHelp,
  inGame,
}: MenuBarProps) {
  const options = useTimedNotification();
  useEffect(() => onSettingsRequested(options.show), [options.show]);
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

  const welcome = !inGame && entrance === "play";

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
    <>
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
            onClick={requestSettings}
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
          <RoundButton
            {...entering(2)}
            variant={5}
            icon={infoBtnSvg}
            iconAlt="info icon"
            iconSize={12}
            id="help-btn"
            onClick={onHelp}
          />
        )}
      </div>
      {(welcome || options.shown) && (
        <div className="notices">
          {welcome && (
            <Tooltip text="Changelog" placement="cursor-right">
              <GameNotification
                icon={skullIcon}
                iconAlt="skull"
                text="Welcome to beta.1!"
                border="#B0A1FF"
                still
                delay={WELCOME_DELAY}
                id="welcome-notice"
                onClick={openChangelog}
              />
            </Tooltip>
          )}
          {options.shown && (
            <GameNotification
              key={options.shown.id}
              icon={lockIcon}
              iconAlt="lock"
              iconSize={20}
              text="The options menu isn't available in the beta."
              border="#ffb9f0"
              still
              leaving={options.shown.leaving}
              id="options-notice"
            />
          )}
        </div>
      )}
    </>
  );
}

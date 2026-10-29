import type { SoundName } from "../game/events.ts";

import bgMusicFile from "@assets/audio/music/the-return-of-the-8-bit-era.mp3";
import gameOverMusicFile from "@assets/audio/sfx/game-over-music.mp3";

import btnIncFxFile from "@assets/audio/sfx/button-press-1.mp3";

import goalReachedFxFile from "@assets/audio/sfx/goal-reached.mp3";
import highScoreFxFile from "@assets/audio/sfx/highscore.mp3";

import gameOverFxFile from "@assets/audio/sfx/game-over.mp3";

import boostFxFile from "@assets/audio/sfx/boost.mp3";
import noBoostsFxFile from "@assets/audio/sfx/error.mp3";

import mouseClickFxFile from "@assets/audio/sfx/mouse-click.mp3";
import buttonClickFxFile from "@assets/audio/sfx/button-click.mp3";

import powerUpFxFile from "@assets/audio/sfx/power-up.mp3";
import boostPowerUpFxFile from "@assets/audio/sfx/powerup-boost.mp3";
import penaltyFxFile from "@assets/audio/sfx/penalty.mp3";

type AudioTrack = {
  audio: HTMLAudioElement;
  volume: number;
  loop?: boolean;
};
// every sound the game can ask for has to be here, and nothing else
export const audioConfig: Record<SoundName, AudioTrack> = {
  bgMusic: {
    audio: new Audio(bgMusicFile),
    volume: 0.2,
    loop: true,
  },
  buttonInc: {
    audio: new Audio(btnIncFxFile),
    volume: 1,
  },
  useBoost: {
    audio: new Audio(boostFxFile),
    volume: 0.3,
  },
  noBoosts: {
    audio: new Audio(noBoostsFxFile),
    volume: 0.4,
  },
  highScore: {
    audio: new Audio(highScoreFxFile),
    volume: 0.9,
  },
  goalReached: {
    audio: new Audio(goalReachedFxFile),
    volume: 0.4,
  },
  gameOver: {
    audio: new Audio(gameOverFxFile),
    volume: 1,
  },
  gameOverMusic: {
    audio: new Audio(gameOverMusicFile),
    volume: 0.15,
  },
  buttonClick: {
    audio: new Audio(buttonClickFxFile),
    volume: 0.2,
  },
  mouseClick: {
    audio: new Audio(mouseClickFxFile),
    volume: 0.4,
  },
  // power ups
  powerUp: {
    audio: new Audio(powerUpFxFile),
    volume: 0.4,
  },
  boostPowerUp: {
    audio: new Audio(boostPowerUpFxFile),
    volume: 0.9,
  },
  penalty: {
    audio: new Audio(penaltyFxFile),
    volume: 0.25,
  },
};

for (const config of Object.values(audioConfig)) {
  config.audio.volume = config.volume;
  if (config.loop) {
    config.audio.loop = true;
  }
}

// audio controls

export function playSound(name: SoundName): void {
  const { audio } = audioConfig[name];

  audio.currentTime = 0;
  audio.play().catch((err) => {
    console.warn(`${audio.src} failed to play`, {
      error: err.name,
      message: err.message,
      audioElement: audio,
    });
  });
}

export function pauseSound(name: SoundName): void {
  audioConfig[name].audio.pause();
}

export function toggleAudio(mute: boolean): void {
  for (const config of Object.values(audioConfig)) {
    config.audio.volume = mute ? 0 : config.volume;
  }
}

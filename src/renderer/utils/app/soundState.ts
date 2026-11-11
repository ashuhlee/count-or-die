import {
  MUTED,
  SOUND_ON,
  nextSoundMode,
  parseSoundMode,
  toggleMusic,
  toggleMute,
  type SoundMode,
} from "../../../shared/soundMode.ts";
import { muteMusic, toggleAudio } from "./sounds.ts";

const SOUND_STATE_KEY = "soundState";

const listeners = new Set<() => void>();

let beforeMute: SoundMode = SOUND_ON;

export function getSoundMode(): SoundMode {
  try {
    return parseSoundMode(localStorage.getItem(SOUND_STATE_KEY));
  } catch {
    return SOUND_ON;
  }
}

function hasSavedSoundMode(): boolean {
  try {
    return localStorage.getItem(SOUND_STATE_KEY) !== null;
  } catch {
    return false;
  }
}

function applySoundMode(mode: SoundMode): void {
  muteMusic(mode !== SOUND_ON);
  toggleAudio(mode === MUTED);
}

export function setSoundMode(mode: SoundMode): void {
  const current = getSoundMode();
  if (current !== MUTED) beforeMute = current;

  applySoundMode(mode);
  try {
    localStorage.setItem(SOUND_STATE_KEY, mode.toString());
  } catch {}
  listeners.forEach((listener) => listener());
}

// puts the saved setting back when the game starts
export function restoreSoundMode(): void {
  if (hasSavedSoundMode()) applySoundMode(getSoundMode());
}

export function subscribeSoundMode(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function cycleSoundMode(): void {
  setSoundMode(nextSoundMode(getSoundMode()));
}

export function toggleMuteSound(): void {
  setSoundMode(toggleMute(getSoundMode(), beforeMute));
}

export function toggleMusicSound(): void {
  setSoundMode(toggleMusic(getSoundMode()));
}

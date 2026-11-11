// 0: sfx + music, 1: sfx + no music, 2: no sfx + no music
export type SoundMode = 0 | 1 | 2;

export const SOUND_ON: SoundMode = 0;
export const MUSIC_OFF: SoundMode = 1;
export const MUTED: SoundMode = 2;

export function parseSoundMode(saved: string | null): SoundMode {
  const mode = Number.parseInt(saved ?? "", 10);
  return mode === MUSIC_OFF || mode === MUTED ? mode : SOUND_ON;
}

export function nextSoundMode(mode: SoundMode): SoundMode {
  return ((mode + 1) % 3) as SoundMode;
}

export function toggleMute(mode: SoundMode, before: SoundMode): SoundMode {
  return mode === MUTED ? before : MUTED;
}

export function toggleMusic(mode: SoundMode): SoundMode {
  return mode === SOUND_ON ? MUSIC_OFF : SOUND_ON;
}

import { describe, expect, test } from "vite-plus/test";

import {
  MUSIC_OFF,
  MUTED,
  SOUND_ON,
  nextSoundMode,
  parseSoundMode,
  toggleMusic,
  toggleMute,
} from "../../src/shared/soundMode.ts";

describe("soundMode", () => {
  test("a saved mode is read back, anything else means sound on", () => {
    expect(parseSoundMode("0")).toBe(SOUND_ON);
    expect(parseSoundMode("1")).toBe(MUSIC_OFF);
    expect(parseSoundMode("2")).toBe(MUTED);
    expect(parseSoundMode(null)).toBe(SOUND_ON);
    expect(parseSoundMode("7")).toBe(SOUND_ON);
    expect(parseSoundMode("loud")).toBe(SOUND_ON);
  });

  test("the sound button goes through the modes and starts over", () => {
    expect(nextSoundMode(SOUND_ON)).toBe(MUSIC_OFF);
    expect(nextSoundMode(MUSIC_OFF)).toBe(MUTED);
    expect(nextSoundMode(MUTED)).toBe(SOUND_ON);
  });

  test("muting goes back to what it was before", () => {
    expect(toggleMute(SOUND_ON, SOUND_ON)).toBe(MUTED);
    expect(toggleMute(MUSIC_OFF, MUSIC_OFF)).toBe(MUTED);
    expect(toggleMute(MUTED, SOUND_ON)).toBe(SOUND_ON);
    expect(toggleMute(MUTED, MUSIC_OFF)).toBe(MUSIC_OFF);
  });

  test("toggling the music keeps the effects, and unmutes when muted", () => {
    expect(toggleMusic(SOUND_ON)).toBe(MUSIC_OFF);
    expect(toggleMusic(MUSIC_OFF)).toBe(SOUND_ON);
    expect(toggleMusic(MUTED)).toBe(SOUND_ON);
  });
});

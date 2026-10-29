type Presence = Parameters<
  NonNullable<Window["electron"]>["setDiscordStatus"]
>[0];

// Tells Discord what the player is up to. Only the Electron app can; in the
// browser there is nobody to tell.
export function updateDiscordPresence(presence: Presence): void {
  void window.electron?.setDiscordStatus(presence);
}

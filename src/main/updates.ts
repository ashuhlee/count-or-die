export function canAutoUpdate(
  platform: NodeJS.Platform,
  packaged: boolean,
): boolean {
  return packaged && (platform === "win32" || platform === "darwin");
}

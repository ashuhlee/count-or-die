export const CHANGELOG_URL =
  "https://github.com/ashuhlee/count-or-die/releases";

export function openChangelog(): void {
  if (window.electron) {
    window.electron.openChangelog();
  } else {
    window.open(CHANGELOG_URL, "_blank", "noopener");
  }
}

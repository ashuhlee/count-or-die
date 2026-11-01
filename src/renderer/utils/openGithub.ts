export const GITHUB_URL = "https://github.com/ashuhlee/count-or-die";

export function openGithub(): void {
  if (window.electron) {
    window.electron.openGithub();
  } else {
    window.open(GITHUB_URL, "_blank", "noopener");
  }
}

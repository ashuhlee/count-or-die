const KEY = "betaNoticeHidden";
const SEEN_KEY = "betaNoticeSeen";

export function betaNoticeHidden(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function hideBetaNotice(): void {
  try {
    localStorage.setItem(KEY, "1");
  } catch {}
}

export function betaNoticeSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markBetaNoticeSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {}
}

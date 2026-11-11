// whether the beta notice has been shown, so that it only comes up once
const KEY = "betaNoticeSeen";

export function betaNoticeSeen(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function markBetaNoticeSeen(): void {
  try {
    localStorage.setItem(KEY, "1");
  } catch {}
}

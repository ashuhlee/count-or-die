const HELP_REQUESTED = "help-requested";
const CHALLENGES_REQUESTED = "challenges-requested";

function listen(name: string, handler: () => void): () => void {
  window.addEventListener(name, handler);
  return () => window.removeEventListener(name, handler);
}

export function requestHelp(): void {
  window.dispatchEvent(new Event(HELP_REQUESTED));
}

export function onHelpRequested(handler: () => void): () => void {
  return listen(HELP_REQUESTED, handler);
}

export function requestChallenges(): void {
  window.dispatchEvent(new Event(CHALLENGES_REQUESTED));
}

export function onChallengesRequested(handler: () => void): () => void {
  return listen(CHALLENGES_REQUESTED, handler);
}

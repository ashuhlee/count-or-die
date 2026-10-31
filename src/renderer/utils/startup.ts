// The fonts and pictures the first screen needs. They are loaded before the
// game starts so nothing pops in, or lags, while its animations are running.
export const STARTUP_FONTS = [
  "24px Silkscreen",
  "bold 24px Silkscreen",
  "24px 'Alien Cyborg'",
  "24px serious1",
  "24px 'SMW Text NC'",
];

// loading stops waiting after this long, so a missing file cannot hold the game
const GIVE_UP_AFTER = 5000;

// how long the startup screen takes to grow over the page, and to go away
const COVER_TIME = 600;
const HIDE_TIME = 600;

const loadImage = (url: string) =>
  new Promise<void>((resolve) => {
    const image = new Image();
    image.src = url;
    // a picture that fails to load is not worth holding the game for
    (image.decode?.() ?? Promise.resolve()).then(resolve, resolve);
  });

const loadFont = (font: string) =>
  document.fonts?.load(font).catch(() => []) ?? Promise.resolve([]);

export async function preload(
  urls: string[],
  fonts: string[] = STARTUP_FONTS,
  giveUpAfter = GIVE_UP_AFTER,
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const giveUp = new Promise((resolve) => {
    timer = setTimeout(resolve, giveUpAfter);
  });
  await Promise.race([
    Promise.all([...fonts.map(loadFont), ...urls.map(loadImage)]),
    giveUp,
  ]);
  clearTimeout(timer);
}

// two frames, so what was just mounted (the WebGL shaders draw on mount) has
// been painted once before the screen over it goes
export const afterPaint = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

// The screen in index.html that covers the page until the game is ready. It
// stays at least until it has finished growing, so it does not shrink mid-way.
export async function hideStartupScreen(
  shownFor = performance.now(),
  hideTime = HIDE_TIME,
) {
  const screen = document.getElementById("startup-screen");
  if (!screen) return;

  const remaining = COVER_TIME - shownFor;
  if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));

  screen.classList.add("hiding");
  setTimeout(() => screen.remove(), hideTime);
}

export const STARTUP_FONTS = [
  "24px Silkscreen",
  "bold 24px Silkscreen",
  "24px 'Alien Cyborg'",
  "24px serious1",
  "24px 'SMW Text NC'",
];

const GIVE_UP_AFTER = 5000;
const FILL_TIME = 250;
const HIDE_TIME = 300;

const loadImage = (url: string) =>
  new Promise<void>((resolve) => {
    const image = new Image();
    image.src = url;
    (image.decode?.() ?? Promise.resolve()).then(resolve, resolve);
  });

const loadFont = (font: string) =>
  document.fonts?.load(font).catch(() => []) ?? Promise.resolve([]);

const startupScreen = () => document.getElementById("startup-screen");

export const showStartupProgress = (fraction: number) =>
  startupScreen()?.style.setProperty("--progress", String(fraction));

export async function preload(
  urls: string[],
  fonts: string[] = STARTUP_FONTS,
  giveUpAfter = GIVE_UP_AFTER,
  onProgress: (fraction: number) => void = showStartupProgress,
) {
  const loads = [
    ...fonts.map((font) => () => loadFont(font)),
    ...urls.map((url) => () => loadImage(url)),
  ];
  let done = 0;
  onProgress(0);

  let timer: ReturnType<typeof setTimeout> | undefined;
  const giveUp = new Promise((resolve) => {
    timer = setTimeout(resolve, giveUpAfter);
  });
  await Promise.race([
    Promise.all(
      loads.map((load) => load().then(() => onProgress(++done / loads.length))),
    ),
    giveUp,
  ]);
  clearTimeout(timer);
}

export const afterPaint = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

export async function hideStartupScreen(
  fillTime = FILL_TIME,
  hideTime = HIDE_TIME,
) {
  const screen = startupScreen();
  if (!screen) return;

  showStartupProgress(1);
  await new Promise((resolve) => setTimeout(resolve, fillTime));

  screen.classList.add("hiding");
  setTimeout(() => screen.remove(), hideTime);
}

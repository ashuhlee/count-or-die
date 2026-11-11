import { app, autoUpdater, dialog } from "electron";

const GIVE_UP_AFTER = 30_000;

let checking = false;

function say(title: string, message: string, detail: string): void {
  void dialog.showMessageBox({
    type: "info",
    buttons: ["Okay"],
    title,
    message,
    detail,
    noLink: true,
  });
}

export function checkForUpdates(): void {
  if (checking) return;
  checking = true;

  const finish = () => {
    checking = false;
    clearTimeout(timer);
    autoUpdater.removeListener("update-available", onAvailable);
    autoUpdater.removeListener("update-not-available", onUpToDate);
    autoUpdater.removeListener("error", onError);
  };

  function onAvailable() {
    finish();
    say(
      "Update available",
      "A new version is downloading",
      "It downloads in the background, and you'll be asked to restart when it's ready.",
    );
  }

  function onUpToDate() {
    finish();
    say(
      "You're up to date",
      "You have the latest version",
      `Count or Die ${app.getVersion()}`,
    );
  }

  function onError(error: Error) {
    finish();
    say(
      "Couldn't check for updates",
      "The update check failed",
      `${error.message}\n\nTry again later.`,
    );
  }

  const timer = setTimeout(() => {
    finish();
    say(
      "Couldn't check for updates",
      "No answer from the update server",
      "Check your internet connection and try again.",
    );
  }, GIVE_UP_AFTER);

  autoUpdater.once("update-available", onAvailable);
  autoUpdater.once("update-not-available", onUpToDate);
  autoUpdater.once("error", onError);

  try {
    autoUpdater.checkForUpdates();
  } catch (error) {
    onError(error as Error);
  }
}

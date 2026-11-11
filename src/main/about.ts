import { app, dialog } from "electron";

// macOS has its own about panel, this fills it in
export function setUpAboutPanel(): void {
  app.setAboutPanelOptions({
    applicationName: "Count or Die",
    applicationVersion: app.getVersion(),
  });
}

// Windows and Linux don't have one
export function showAbout(icon: string): void {
  void dialog.showMessageBox({
    icon,
    type: "info",
    buttons: ["Okay"],
    title: "About Count or Die",
    message: "Count or Die",
    detail: `Version ${app.getVersion()}`,
    noLink: true,
  });
}

import type { WebContents } from "electron";

type Lockable = Pick<
  WebContents,
  "on" | "setWindowOpenHandler" | "setVisualZoomLevelLimits"
>;
export function lockDown(contents: Lockable, isPackaged: boolean) {
  contents.setWindowOpenHandler(() => ({ action: "deny" }));
  if (!isPackaged) return;

  contents.on("will-navigate", (event) => event.preventDefault());
  void contents.setVisualZoomLevelLimits(1, 1);
}

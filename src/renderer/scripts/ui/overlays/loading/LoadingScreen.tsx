import { useSyncExternalStore } from "react";

import skullImg from "@assets/ui/deco/skull_gradient.png";

import { loadingStore } from "./loadingStore.ts";

export default function LoadingScreen() {
  const { mounted, visible, hiding } = useSyncExternalStore(
    loadingStore.subscribe,
    loadingStore.getSnapshot,
  );

  if (!mounted) return null;

  return (
    <div
      id="loading-screen"
      className={`loading-screen${visible ? " visible" : ""}${hiding ? " hiding" : ""}`}
    >
      <div className="loading-content">
        <div className="diamond-outline" id="diamond-outline"></div>
        <div className="diamond-wrapper" id="diamond-wrapper">
          <div className="diamond" id="diamond"></div>
          <img src={skullImg} className="loading-skull" alt="skull" />
        </div>
      </div>
    </div>
  );
}

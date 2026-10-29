import { createPortal } from "react-dom";

import Controls from "./Controls.tsx";
import Counter from "./Counter.tsx";
import CursorCounts from "./CursorCounts.tsx";
import Hearts from "./Hearts.tsx";
import HighScore from "./HighScore.tsx";
import LoadingScreen from "./LoadingScreen.tsx";

// Root of the incremental React migration. Each ported component renders into a
// placeholder element left behind by the vanilla containers, so the rest of the
// UI keeps working while pieces move over one at a time.
export default function App() {
  const controlsRoot = document.getElementById("controls-root");
  const counterRoot = document.getElementById("counter-root");
  const boostRoot = document.getElementById("boost-root");
  const highScoreRoot = document.getElementById("high-score-root");

  return (
    <>
      {controlsRoot && createPortal(<Controls />, controlsRoot)}
      {counterRoot && createPortal(<Counter />, counterRoot)}
      {boostRoot && createPortal(<Hearts />, boostRoot)}
      {highScoreRoot && createPortal(<HighScore />, highScoreRoot)}

      {/* these position themselves with fixed positioning */}
      <CursorCounts />
      <LoadingScreen />
    </>
  );
}

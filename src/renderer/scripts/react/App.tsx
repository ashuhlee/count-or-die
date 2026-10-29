import { createPortal } from "react-dom";

import Counter from "./Counter.tsx";
import Hearts from "./Hearts.tsx";

// Root of the incremental React migration. Each ported component renders into a
// placeholder element left behind by the vanilla containers, so the rest of the
// UI keeps working while pieces move over one at a time.
export default function App() {
  const counterRoot = document.getElementById("counter-root");
  const boostRoot = document.getElementById("boost-root");

  return (
    <>
      {counterRoot && createPortal(<Counter />, counterRoot)}
      {boostRoot && createPortal(<Hearts />, boostRoot)}
    </>
  );
}

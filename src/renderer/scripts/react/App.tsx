import { createPortal } from "react-dom";

import Counter from "./Counter.tsx";

export default function App() {
  const counterRoot = document.getElementById("counter-root");

  return <>{counterRoot && createPortal(<Counter />, counterRoot)}</>;
}

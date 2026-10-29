import { useRef, useState, type CSSProperties } from "react";

import { playSound } from "../../../utils/sounds.ts";

const MENU_DELAY = 500;

// "back to menu" tilts the opposite way each time it is hovered
export default function BackToMenu() {
  const [tilt, setTilt] = useState<"left" | "right" | null>(null);
  const nextTilt = useRef<"left" | "right">("left");

  function onClick() {
    playSound("buttonClick");
    setTimeout(
      () => alert("Oops! The menu is not available in the beta."),
      MENU_DELAY,
    );
  }

  return (
    <h2
      className="back-to-menu underline left"
      id="menu-btn"
      onClick={onClick}
      onMouseEnter={() => setTilt(nextTilt.current)}
      onMouseLeave={() => {
        nextTilt.current = nextTilt.current === "left" ? "right" : "left";
        setTilt(null);
      }}
      style={
        tilt
          ? ({
              transform: `scale(1.15) rotate(${tilt === "left" ? "-4deg" : "4deg"})`,
              "--arr-color": tilt === "left" ? "#FBB6FF" : "#FFDEB6",
            } as CSSProperties)
          : undefined
      }
    >
      back to menu
    </h2>
  );
}

import { useRef, useState, type CSSProperties } from "react";

import { useGame } from "../../../provider/useGame.ts";
import Letters from "../../components/letters/Letters.tsx";

const HOVER_STRIPE_SPEED = 3;

export default function BackToMenu() {
  const { actions } = useGame();
  const button = useRef<HTMLHeadingElement>(null);
  const [tilt, setTilt] = useState<"left" | "right" | null>(null);
  const nextTilt = useRef<"left" | "right">("left");

  function setStripeSpeed(rate: number) {
    const animations = button.current?.getAnimations?.({ subtree: true }) ?? [];
    for (const animation of animations) {
      if ((animation as CSSAnimation).animationName === "slide-stripes") {
        animation.playbackRate = rate;
      }
    }
  }

  return (
    <h2
      ref={button}
      className="back-to-menu underline left"
      id="menu-btn"
      onClick={actions.backToMenu}
      onMouseEnter={() => {
        setTilt(nextTilt.current);
        setStripeSpeed(HOVER_STRIPE_SPEED);
      }}
      onMouseLeave={() => {
        setStripeSpeed(1);
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
      <Letters text="Back to menu" step={0.1} height={0.7} duration={1} />
    </h2>
  );
}

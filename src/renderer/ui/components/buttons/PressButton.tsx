import { useEffect, useRef, useState, type MouseEvent } from "react";

import { useGameEvent } from "../../provider/useGameEvent.ts";
import { useTimeouts } from "../../hooks/useTimeouts.ts";

const PRESS_DURATION = 100;

type PressButtonProps = {
  button: "increase" | "decrease";
  id: string;
  alt: string;
  normal: string;
  pressed: string;
  onClick: (event: MouseEvent<HTMLImageElement>) => void;
};

// the red tint that fades out after pressing a button with no boosts left
const DISABLED_FLASH = [
  {
    filter:
      "opacity(0.4) drop-shadow(0 0 0 red) drop-shadow(0 0 0 red) brightness(0.8) saturate(120%)",
  },
  { filter: "none" },
];

export default function PressButton({
  button,
  id,
  alt,
  normal,
  pressed,
  onClick,
}: PressButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  // bumped each time the button is pressed while disabled, so it remounts
  // and replays its shake; 0 means it never has
  const [shakeId, setShakeId] = useState(0);

  const later = useTimeouts();
  const releaseTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useGameEvent("pressed", (event) => {
    if (event.button !== button) return;

    clearTimeout(releaseTimer.current);
    setIsPressed(true);
    if (event.disabled) setShakeId((current) => current + 1);

    releaseTimer.current = later(() => setIsPressed(false), PRESS_DURATION);
  });

  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (shakeId === 0) return;

    const animation = ref.current.animate(DISABLED_FLASH, {
      duration: 800,
      easing: "ease",
      fill: "forwards",
    });
    return () => animation.cancel();
  }, [shakeId]);

  return (
    <img
      key={shakeId}
      ref={ref}
      id={id}
      alt={alt}
      src={isPressed ? pressed : normal}
      className={shakeId > 0 ? "no-boosts-shake" : undefined}
      onClick={onClick}
    />
  );
}

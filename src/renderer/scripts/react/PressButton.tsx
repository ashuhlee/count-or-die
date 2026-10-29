import { useEffect, useRef, useSyncExternalStore } from "react";

import { buttonStore, type ButtonType } from "./buttonStore.ts";

type PressButtonProps = {
  type: ButtonType;
  id: string;
  alt: string;
  normal: string;
  pressed: string;
  onClick: (event: MouseEvent) => void;
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
  type,
  id,
  alt,
  normal,
  pressed,
  onClick,
}: PressButtonProps) {
  const { pressed: isPressed, shakeId } = useSyncExternalStore(
    buttonStore.subscribe,
    () => buttonStore.getSnapshot()[type],
  );

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
      // a new key remounts the button, which replays the shake
      key={shakeId}
      ref={ref}
      id={id}
      alt={alt}
      src={isPressed ? pressed : normal}
      className={shakeId > 0 ? "no-boosts-shake" : undefined}
      onClick={(event) => onClick(event.nativeEvent)}
    />
  );
}

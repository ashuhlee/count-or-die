import { useRef } from "react";

import { useHeartGlitch } from "./useHeartGlitch.ts";

type HeartProps = {
  // 1-4, left to right
  number: number;
  // the heart's color: heart-pink, heart-blue, ...
  colorClass: string;
  src: string;
  used: boolean;
  restoring: boolean;
  slotRef: (element: HTMLDivElement | null) => void;
  onRestored: () => void;
};

export default function Heart({
  number,
  colorClass,
  src,
  used,
  restoring,
  slotRef,
  onRestored,
}: HeartProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  useHeartGlitch(imageRef, number);

  return (
    <div
      ref={slotRef}
      id={`boost-${number}`}
      className={[colorClass, used && "heart-use", restoring && "heart-restore"]
        .filter(Boolean)
        .join(" ")}
      style={restoring ? { animationDelay: "0s" } : undefined}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) onRestored();
      }}
    >
      <img
        ref={imageRef}
        src={src}
        alt={`heart${number}`}
        className={`heart${number}`}
        id={`heart${number}`}
      />
    </div>
  );
}

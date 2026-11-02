import { useEffect, useRef } from "react";

import MeltInShader, {
  type MeltColors,
} from "../../../shaders/melt-in-shader/MeltInShader.tsx";
import { useHeartGlitch } from "./useHeartGlitch.ts";

const MELT = { duration: 1300, pixelScale: 4 };

const MELT_GRACE = 1500;

export type HeartMelt = {
  colors?: Partial<MeltColors>;
  duration?: number;
  pixelScale?: number;
};

type HeartProps = {
  number: number; // 1-4, left to right
  colorClass: string; // the heart's color: heart-pink, heart-blue, ...
  src: string;
  used: boolean;
  restoring: boolean;
  melt?: HeartMelt;
  slotRef: (element: HTMLDivElement | null) => void;
  onRestored: () => void;
};

export default function Heart({
  number,
  colorClass,
  src,
  used,
  restoring,
  melt,
  slotRef,
  onRestored,
}: HeartProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  useHeartGlitch(imageRef, number);

  const meltDuration = melt?.duration ?? MELT.duration;
  const latestOnRestored = useRef(onRestored);
  useEffect(() => {
    latestOnRestored.current = onRestored;
  });
  useEffect(() => {
    if (!restoring) return;

    const timer = setTimeout(() => {
      console.warn(
        `heart ${number}: its melt did not finish, showing the heart anyway`,
      );
      latestOnRestored.current();
    }, meltDuration + MELT_GRACE);
    return () => clearTimeout(timer);
  }, [restoring, meltDuration, number]);

  return (
    <div
      ref={slotRef}
      id={`boost-${number}`}
      className={[colorClass, used && "heart-use", restoring && "heart-restore"]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="heart-art" style={{ opacity: restoring ? 0 : 1 }}>
        <img
          ref={imageRef}
          src={src}
          alt={`heart${number}`}
          className={`heart${number}`}
          id={`heart${number}`}
        />
      </div>
      {restoring && (
        <MeltInShader
          src={src}
          alt=""
          className="heart-melt"
          active
          duration={meltDuration}
          pixelScale={melt?.pixelScale ?? MELT.pixelScale}
          colors={melt?.colors}
          shadow={false}
          settledBrightness={1}
          onDone={onRestored}
        />
      )}
    </div>
  );
}

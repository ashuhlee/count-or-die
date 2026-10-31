import { useRef } from "react";

import MeltInShader, {
  type MeltColors,
} from "../../shaders/melt-in-shader/MeltInShader.tsx";
import { useHeartGlitch } from "./useHeartGlitch.ts";

const MELT = { duration: 1500, pixelScale: 4 };

export type HeartMelt = {
  colors?: Partial<MeltColors>;
  duration?: number;
  pixelScale?: number;
};

type HeartProps = {
  // 1-4, left to right
  number: number;
  // the heart's color: heart-pink, heart-blue, ...
  colorClass: string;
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
          duration={melt?.duration ?? MELT.duration}
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

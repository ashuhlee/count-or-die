import { useEffect, useRef, type CSSProperties } from "react";

// the solid pixels of a heart: the pale shadow pixels it has at the edges are
// left out, so the shine does not light them up
import heartMask from "@assets/ui/deco/px_heart_mask.png";
import MeltInShader, {
  type MeltColors,
} from "../../../shaders/melt-in-shader/MeltInShader.tsx";

const MELT = { duration: 1300, pixelScale: 4 };
const MELT_GRACE = 1500;

// how often a heart shines is in the style sheet
// the first shine waits this long, so it does not play as the game starts
const SHINE_START = 3;
const SHINE_STAGGER = 0.4;
const SHINE_ORDER = [4, 2, 1, 3];

export type HeartMelt = {
  colors?: Partial<MeltColors>;
  duration?: number;
  pixelScale?: number;
};

type HeartProps = {
  number: number; // 1-4, left to right
  colorClass: string; // the heart color: heart-pink, heart-blue, ...
  src: string;
  used: boolean;
  restoring: boolean;
  shine: string; // the color of the shine over the heart
  melt?: HeartMelt;
  slotRef: (element: HTMLDivElement | null) => void;
  onRestored: () => void;
};

export default function Heart({
  number,
  colorClass,
  src,
  shine,
  used,
  restoring,
  melt,
  slotRef,
  onRestored,
}: HeartProps) {
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
          src={src}
          alt={`heart${number}`}
          className={`heart${number}`}
          id={`heart${number}`}
        />
        {/* a copy on top that the shine sweeps over, cut to the solid pixels */}
        <div
          className="heart-shine shine"
          aria-hidden="true"
          style={
            {
              "--heart-mask": `url("${heartMask}")`,
              "--shine-color": shine,
              "--shine-delay": `${SHINE_START + SHINE_ORDER.indexOf(number) * SHINE_STAGGER}s`,
            } as CSSProperties
          }
        >
          <img src={src} alt="" />
        </div>
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

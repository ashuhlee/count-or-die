import {
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";

import { powerUpStore, type SpawnedPowerUp } from "./powerUpStore.ts";

// on wide screens the icon is nudged in from the edge by a random amount
const WIDE_SCREEN = 600;
const MAX_NUDGE = 150;

function FallingPowerUp({
  id,
  type,
  icon,
  side,
  fall,
  xRand,
  onCollect,
  onMiss,
}: SpawnedPowerUp) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [nudge, setNudge] = useState<number | null>(null);

  useLayoutEffect(() => {
    const width = areaRef.current.offsetWidth;
    if (width > WIDE_SCREEN) {
      setNudge(Math.floor(xRand * (Math.min(width / 3, MAX_NUDGE) + 1)));
    }
  }, [xRand]);

  const style: CSSProperties = {
    animation: `${fall} 2.8s linear forwards`,
    ...(nudge !== null && { [side]: `${nudge}px` }),
  };

  return (
    <div className="spawn-area" ref={areaRef}>
      <img
        className={`power-up-img spawn-area--${side}`}
        src={icon}
        data-power-up-type={type}
        style={style}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          powerUpStore.remove(id);
          onCollect(rect);
        }}
        onAnimationEnd={() => {
          powerUpStore.remove(id);
          onMiss();
        }}
      />
    </div>
  );
}

export default function PowerUps() {
  const items = useSyncExternalStore(
    powerUpStore.subscribe,
    powerUpStore.getSnapshot,
  );

  return (
    <>
      {items.map((item) => (
        <FallingPowerUp key={item.id} {...item} />
      ))}
    </>
  );
}

import { useEffect, useRef, useSyncExternalStore } from "react";

import { cursorStore, type CursorCount } from "./cursorStore.ts";

function FloatingCount({
  id,
  value,
  x,
  y,
  color,
  isBoosted,
  xPos,
  rotateDeg,
}: CursorCount) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const animation = ref.current.animate(
      [
        {
          opacity: isBoosted ? 1 : 0.7,
          transform: `translateY(-20px) translateX(0) rotate(0) scale(1)`,
        },
        {
          opacity: 0,
          transform: `translateY(-80px)
						translateX(${xPos}px)
						rotate(${isBoosted ? rotateDeg : xPos}deg)
						scale(${isBoosted ? 1.4 : 1.2})`,
          color,
        },
      ],
      {
        duration: 700,
        easing: "ease-out",
      },
    );

    const onFinish = () => cursorStore.remove(id);
    animation.addEventListener("finish", onFinish);

    return () => {
      animation.removeEventListener("finish", onFinish);
      animation.cancel();
    };
  }, [id, color, isBoosted, xPos, rotateDeg]);

  return (
    <span
      ref={ref}
      className="count-cursor"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        color,
        textShadow: "0 2px 0 var(--shadow-pink-020)",
      }}
    >
      {`+${value}`}
    </span>
  );
}

export default function CursorCounts() {
  const counts = useSyncExternalStore(
    cursorStore.subscribe,
    cursorStore.getSnapshot,
  );

  return (
    <>
      {counts.map((count) => (
        <FloatingCount key={count.id} {...count} />
      ))}
    </>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";

import { useGameEvent } from "../../../provider/useGameEvent.ts";

const BOOST_COLORS = ["#E8E3F8", "#83d0ff", "#ae9eff", "#FF98E1"];
const PLAIN_COLOR = "#FFFFFF";

type CursorCount = {
  id: number;
  value: number;
  x: number;
  y: number;
  color: string;
  isBoosted: boolean;
  xPos: number;
  rotateDeg: number;
};

function FloatingCount({
  count,
  onDone,
}: {
  count: CursorCount;
  onDone: (id: number) => void;
}) {
  const { id, value, x, y, color, isBoosted, xPos, rotateDeg } = count;
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
      { duration: 700, easing: "ease-out" },
    );

    const finish = () => onDone(id);
    animation.addEventListener("finish", finish);

    return () => {
      animation.removeEventListener("finish", finish);
      animation.cancel();
    };
  }, [id, color, isBoosted, xPos, rotateDeg, onDone]);

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
  const [counts, setCounts] = useState<CursorCount[]>([]);
  const nextId = useRef(0);
  const boostColor = useRef(0);

  useGameEvent("cursorCount", ({ value, boosted, x, y }) => {
    let color = PLAIN_COLOR;
    if (boosted) {
      color = BOOST_COLORS[boostColor.current];
      boostColor.current = (boostColor.current + 1) % BOOST_COLORS.length;
    }

    setCounts((current) => [
      ...current,
      {
        id: nextId.current++,
        value,
        x,
        y,
        color,
        isBoosted: boosted,
        xPos: (Math.random() - 0.5) * 70,
        rotateDeg: (Math.random() - 0.5) * 50,
      },
    ]);
  });

  const remove = useCallback(
    (id: number) =>
      setCounts((current) => current.filter((count) => count.id !== id)),
    [],
  );

  return (
    <>
      {counts.map((count) => (
        <FloatingCount key={count.id} count={count} onDone={remove} />
      ))}
    </>
  );
}

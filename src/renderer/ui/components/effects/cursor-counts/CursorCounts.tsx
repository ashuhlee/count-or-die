import { useCallback, useEffect, useRef, useState } from "react";

import { useGameEvent } from "../../../../provider/useGameEvent.ts";

const COLOR = "#FFFFFF";

type CursorCount = {
  id: number;
  value: number;
  x: number;
  y: number;
  xPos: number;
};

function FloatingCount({
  count,
  onDone,
}: {
  count: CursorCount;
  onDone: (id: number) => void;
}) {
  const { id, value, x, y, xPos } = count;
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const animation = ref.current.animate(
      [
        {
          opacity: 0.7,
          transform: `translateY(-20px) translateX(0) rotate(0) scale(1)`,
        },
        {
          opacity: 0,
          transform: `translateY(-80px)
						translateX(${xPos}px)
						rotate(${xPos}deg)
						scale(1.2)`,
          color: COLOR,
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
  }, [id, xPos, onDone]);

  return (
    <span
      ref={ref}
      className="count-cursor"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        color: COLOR,
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

  useGameEvent("cursorCount", ({ value, x, y }) => {
    setCounts((current) => [
      ...current,
      {
        id: nextId.current++,
        value,
        x,
        y,
        xPos: (Math.random() - 0.5) * 70,
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

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { useGameEvent } from "../../../../provider/useGameEvent.ts";
import { rem } from "../../../../utils/app/scale.ts";

const COLORS = ["#FDA9E3", "#b5d9ff", "#aaa3ff"];

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

  // before the first paint, so the count never shows as it is in the style sheet
  useLayoutEffect(() => {
    const animation = ref.current.animate(
      [
        {
          opacity: 0.7,
          transform: `translateY(${rem(-20)}) translateX(0) rotate(0) scale(1)`,
        },
        {
          opacity: 0,
          transform: `translateY(${rem(-80)})
						translateX(${rem(xPos)})
						rotate(${xPos}deg)
						scale(1.2)`,
        },
      ],
      { duration: 700, easing: "ease-out", fill: "both" },
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
      style={
        {
          left: `${x}px`,
          top: `${y}px`,
          "--count-color": COLORS[id % COLORS.length],
        } as CSSProperties
      }
    >
      {`+${value}`}
    </span>
  );
}

export default function CursorCounts() {
  const [counts, setCounts] = useState<CursorCount[]>([]);
  const nextId = useRef(0);

  useGameEvent("cursorCount", ({ value, x, y }) => {
    const id = nextId.current++;
    setCounts((current) => [
      ...current,
      { id, value, x, y, xPos: (Math.random() - 0.5) * 70 },
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

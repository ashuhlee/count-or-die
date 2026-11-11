import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

import divide from "@assets/ui/deco/particles/divide.svg";
import equal from "@assets/ui/deco/particles/equal.svg";
import hashtag from "@assets/ui/deco/particles/hashtag.svg";
import infinity from "@assets/ui/deco/particles/infinity.svg";
import minus from "@assets/ui/deco/particles/minus.svg";
import multiply from "@assets/ui/deco/particles/multiply.svg";
import pi from "@assets/ui/deco/particles/pi.svg";
import plus from "@assets/ui/deco/particles/plus.svg";
import sigma from "@assets/ui/deco/particles/sigma.svg";
import sqrt from "@assets/ui/deco/particles/sqrt.svg";

const ICONS = [
  { src: divide, width: 64, height: 64 },
  { src: equal, width: 64, height: 69 },
  { src: hashtag, width: 64, height: 75 },
  { src: infinity, width: 64, height: 38.4 },
  { src: minus, width: 64, height: 26 },
  { src: multiply, width: 64, height: 64 },
  { src: pi, width: 64, height: 54.4 },
  { src: plus, width: 64, height: 64 },
  { src: sigma, width: 64, height: 64 },
  { src: sqrt, width: 64, height: 64 },
] as const;

type Faller = {
  id: number;
  icon: (typeof ICONS)[number];
  side: "left" | "right";
  along: number;
  color: string;
  from: number;
  to: number;
  drift: number;
  life: number;
  delay: number;
  startX: number;
  startY: number;
};

const COUNT = 3;
const COLORS = ["#F6F1F5"];

const rand = (from: number, to: number) => from + Math.random() * (to - from);
const pick = <T,>(list: readonly T[]) =>
  list[Math.floor(Math.random() * list.length)];

let nextId = 0;

const FALL_SECONDS = 5;
const START_AFTER = 1;
const START_Y = -62;
const SCALE = 0.8;

function spawn(slot: number, first: boolean, others: Faller[]): Faller {
  const life = FALL_SECONDS;
  const side = slot % 2 === 0 ? "left" : "right";
  const tilt = rand(25, 40) * pick([1, -1] as const);
  const fresh = ICONS.filter(
    (icon) => !others.some((other) => other.icon === icon),
  );
  return {
    id: nextId++,
    icon: pick(fresh.length > 0 ? fresh : ICONS),
    side,
    along: rand(0, 1),
    color: pick(COLORS),
    from: -tilt,
    to: tilt,
    // they drift outwards a little more than inwards
    drift: side === "left" ? rand(-40, 10) : rand(-10, 40),
    life,
    delay: first ? START_AFTER + (life * slot) / COUNT : 0,
    startX: 0,
    startY: START_Y,
  };
}

const pixels = (value: string) => parseFloat(value) || 0;

function dropped(faller: Faller, el: HTMLElement, dx: number, dy: number) {
  const [x = 0, y = 0] = getComputedStyle(el).translate.split(" ").map(pixels);
  const shape = el.firstElementChild;
  const angle = shape ? pixels(getComputedStyle(shape).rotate) : faller.from;

  const startY = y + dy;
  const speed = (window.innerHeight - START_Y) / FALL_SECONDS;
  const life = Math.max(0.3, (window.innerHeight - startY) / speed);
  return {
    ...faller,
    id: nextId++,
    from: angle,
    drift: faller.drift * (life / FALL_SECONDS),
    life,
    delay: 0,
    startX: x + dx,
    startY,
  };
}

export default function FallingIcons({ active }: { active: boolean }) {
  const [fallers, setFallers] = useState(() => {
    const made: Faller[] = [];
    for (let slot = 0; slot < COUNT; slot++) {
      made.push(spawn(slot, true, made));
    }
    return made;
  });

  const respawn = (slot: number) =>
    setFallers((current) =>
      current.map((faller, index) =>
        index === slot
          ? spawn(
              slot,
              false,
              current.filter((_, other) => other !== slot),
            )
          : faller,
      ),
    );

  const grab = useRef<{
    slot: number;
    x: number;
    y: number;
    dx: number;
    dy: number;
  } | null>(null);
  const [held, setHeld] = useState<number | null>(null);

  const pickUp = (slot: number, event: ReactPointerEvent<HTMLElement>) => {
    if (grab.current) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    grab.current = {
      slot,
      x: event.clientX,
      y: event.clientY,
      dx: 0,
      dy: 0,
    };
    setHeld(slot);
  };

  const drag = (slot: number, event: ReactPointerEvent<HTMLElement>) => {
    const current = grab.current;
    if (current?.slot !== slot) return;
    current.dx = event.clientX - current.x;
    current.dy = event.clientY - current.y;
    event.currentTarget.style.transform = `translate(${current.dx}px, ${current.dy}px)`;
  };

  const letGo = (slot: number, event: ReactPointerEvent<HTMLElement>) => {
    const current = grab.current;
    if (current?.slot !== slot) return;
    grab.current = null;
    setHeld(null);

    const { dx, dy } = current;
    const el = event.currentTarget;
    setFallers((all) =>
      all.map((faller, index) =>
        index === slot ? dropped(faller, el, dx, dy) : faller,
      ),
    );
  };

  return (
    <div
      className={`falling-icons${active ? "" : " falling-icons--waiting"}`}
      aria-hidden="true"
    >
      {fallers.map((faller, slot) => (
        <span
          key={faller.id}
          className={`falling-icon falling-icon--${faller.side}${held === slot ? " falling-icon--held" : ""}`}
          onPointerDown={(event) => pickUp(slot, event)}
          onPointerMove={(event) => drag(slot, event)}
          onPointerUp={(event) => letGo(slot, event)}
          onPointerCancel={(event) => letGo(slot, event)}
          onAnimationEnd={(event) => {
            if (event.animationName === "falling-icon-fall") respawn(slot);
          }}
          style={
            {
              width: `${faller.icon.width * SCALE}px`,
              height: `${faller.icon.height * SCALE}px`,
              "--icon-width": `${faller.icon.width * SCALE}px`,
              "--along": faller.along,
              "--icon": `url("${faller.icon.src}")`,
              "--from": `${faller.from}deg`,
              "--to": `${faller.to}deg`,
              "--color": faller.color,
              "--drift": `${faller.drift}px`,
              "--start-x": `${faller.startX}px`,
              "--start-y": `${faller.startY}px`,
              "--life": `${faller.life}s`,
              "--delay": `${faller.delay}s`,
            } as CSSProperties
          }
        >
          <span className="falling-icon-shape" />
        </span>
      ))}
    </div>
  );
}

import {
  useId,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import Letters from "../../components/text/letters/Letters.tsx";

type Placement = "cursor-left" | "cursor-right";

type TooltipProps = {
  text: string;
  children: ReactNode;
  placement?: Placement;
  step?: number;
  className?: string;
};

type Zone = "above" | "beside" | "below";

const SPOTS: Record<
  Placement,
  Record<Zone, { gap: number; down: number; lift: number }>
> = {
  "cursor-left": {
    above: { gap: 2, down: -10, lift: 1 },
    beside: { gap: 24, down: 0, lift: 0.5 },
    below: { gap: 16, down: 20, lift: 0 },
  },
  "cursor-right": {
    above: { gap: 8, down: -4, lift: 1 },
    beside: { gap: 14, down: 4, lift: 1 },
    below: { gap: 36, down: 20, lift: 0 },
  },
};
const ZONE_SPLIT = { above: 0.25, below: 0.6 };
const FOCUS_BELOW = 20;
const SCREEN_EDGE = 8;

export default function Tooltip({
  text,
  children,
  placement = "cursor-left",
  step = 0.014,
  className,
}: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const shadow = useRef<HTMLSpanElement>(null);
  const hovering = useRef(false);
  const zone = useRef<Zone>("below");

  function place(pointer?: { x: number; y: number }) {
    const box = anchor.current?.getBoundingClientRect();
    const width = label.current?.offsetWidth;
    const height = label.current?.offsetHeight;
    if (!box || !width || !height) return;

    const x = pointer?.x ?? box.left + box.width / 2;
    const y = pointer?.y ?? box.bottom - FOCUS_BELOW;

    const { gap, down, lift } = SPOTS[placement][zone.current];

    const spotLeft = placement === "cursor-left" ? x - width - gap : x + gap;
    const spotTop = y + down - height * lift;

    const left = Math.max(
      SCREEN_EDGE,
      Math.min(spotLeft, window.innerWidth - width - SCREEN_EDGE),
    );
    const top = Math.max(
      SCREEN_EDGE,
      Math.min(spotTop, window.innerHeight - height - SCREEN_EDGE),
    );
    const aboveText = zone.current === "above";
    for (const layer of [label.current, shadow.current]) {
      if (!layer) continue;
      layer.style.left = `${left}px`;
      layer.style.top = `${top}px`;
      layer.style.setProperty("--tooltip-spin", aboveText ? "-75deg" : "75deg");
    }
  }

  function enter(event: PointerEvent<HTMLSpanElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const down = (event.clientY - box.top) / box.height;
    zone.current =
      down < ZONE_SPLIT.above
        ? "above"
        : down < ZONE_SPLIT.below
          ? "beside"
          : "below";
    hovering.current = true;
    setOpen(true);
  }

  const layerClass = open ? " tooltip--open" : "";

  return (
    <span
      ref={anchor}
      className={className ? `tooltip-anchor ${className}` : "tooltip-anchor"}
      aria-describedby={id}
      onPointerEnter={(event) => {
        if (!hovering.current) enter(event);
        place({ x: event.clientX, y: event.clientY });
      }}
      onPointerMove={(event) => {
        if (!hovering.current) enter(event);
        place({ x: event.clientX, y: event.clientY });
      }}
      onPointerLeave={() => {
        hovering.current = false;
        setOpen(false);
      }}
      onFocus={() => {
        if (hovering.current) return;
        zone.current = "below";
        place();
        setOpen(true);
      }}
      onBlur={() => setOpen(false)}
    >
      {children}
      {createPortal(
        <>
          <span
            ref={shadow}
            aria-hidden="true"
            className={`tooltip-shadow${layerClass}`}
          >
            <span>
              <Letters text={text} step={step} />
            </span>
          </span>
          <span
            ref={label}
            id={id}
            role="tooltip"
            aria-label={text}
            className={`tooltip${layerClass}`}
          >
            <span aria-hidden="true">
              <Letters text={text} step={step} />
            </span>
          </span>
        </>,
        document.body,
      )}
    </span>
  );
}

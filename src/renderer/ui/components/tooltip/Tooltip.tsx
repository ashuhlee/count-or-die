import { useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import Letters from "../letters/Letters.tsx";

type Placement = "top" | "bottom" | "left" | "right" | "bottom-left" | "cursor";

type TooltipProps = {
  text: string;
  children: ReactNode;
  placement?: Placement;
  step?: number;
  className?: string;
};

const GAP = 8;

const CURSOR_OFFSET = { x: 10, aboveX: 2, beside: 24, above: 10, below: 20 };
const ZONE_SPLIT = { above: 0.25, below: 0.6 };

type Zone = "above" | "beside" | "below";
const SCREEN_EDGE = 8;

export default function Tooltip({
  text,
  children,
  placement = "top",
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
    const y = pointer?.y ?? box.bottom - CURSOR_OFFSET.below;
    const spots: Record<Placement, { left: number; top: number }> = {
      top: {
        left: box.left + (box.width - width) / 2,
        top: box.top - GAP - height,
      },
      bottom: {
        left: box.left + (box.width - width) / 2,
        top: box.bottom + GAP,
      },
      left: {
        left: box.left - GAP - width,
        top: box.top + (box.height - height) / 2,
      },
      right: {
        left: box.right + GAP,
        top: box.top + (box.height - height) / 2,
      },
      "bottom-left": { left: box.right - width, top: box.bottom + GAP },
      cursor: {
        left:
          x -
          width -
          {
            above: CURSOR_OFFSET.aboveX,
            beside: CURSOR_OFFSET.beside,
            below: CURSOR_OFFSET.x,
          }[zone.current],
        top: {
          above: y - CURSOR_OFFSET.above - height,
          beside: y - height / 2,
          below: y + CURSOR_OFFSET.below,
        }[zone.current],
      },
    };
    const spot = spots[placement];

    const left = Math.max(
      SCREEN_EDGE,
      Math.min(spot.left, window.innerWidth - width - SCREEN_EDGE),
    );
    const top = Math.max(
      SCREEN_EDGE,
      Math.min(spot.top, window.innerHeight - height - SCREEN_EDGE),
    );
    const aboveText =
      placement === "top" ||
      (placement === "cursor" && zone.current === "above");
    for (const layer of [label.current, shadow.current]) {
      if (!layer) continue;
      layer.style.left = `${left}px`;
      layer.style.top = `${top}px`;
      layer.style.setProperty("--tooltip-spin", aboveText ? "-75deg" : "75deg");
    }
  }

  const layerClass = open ? " tooltip--open" : "";

  return (
    <span
      ref={anchor}
      className={className ? `tooltip-anchor ${className}` : "tooltip-anchor"}
      aria-describedby={id}
      onPointerEnter={(event) => {
        if (!hovering.current) {
          const box = event.currentTarget.getBoundingClientRect();
          const down = (event.clientY - box.top) / box.height;
          zone.current =
            down < ZONE_SPLIT.above
              ? "above"
              : down < ZONE_SPLIT.below
                ? "beside"
                : "below";
        }
        hovering.current = true;
        place({ x: event.clientX, y: event.clientY });
        setOpen(true);
      }}
      onPointerMove={
        placement === "cursor"
          ? (event) => place({ x: event.clientX, y: event.clientY })
          : undefined
      }
      onPointerLeave={() => {
        hovering.current = false;
        setOpen(false);
      }}
      onFocus={() => {
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

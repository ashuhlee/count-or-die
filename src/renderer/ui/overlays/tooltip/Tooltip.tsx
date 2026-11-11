import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import Letters from "../../components/text/letters/Letters.tsx";
import { useFadeOut } from "../alert-popup/useFadeOut.ts";

type TooltipProps = {
  text: string;
  children: ReactNode;
  side?: "left" | "right";
  step?: number;
  className?: string;
};

const GAP = 20;
const EXIT_MS = 100;

export default function Tooltip({
  text,
  children,
  side = "right",
  step = 0.014,
  className,
}: TooltipProps) {
  const id = useId();
  const anchor = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null);
  // the text it appeared with: when it differs, the text changed while open
  const [openedWith, setOpenedWith] = useState(text);
  const shown = useFadeOut(open, EXIT_MS);

  function show() {
    const box = anchor.current?.getBoundingClientRect();
    if (!box) return;
    setSpot({
      x: side === "left" ? box.left - GAP : box.right + GAP,
      y: box.top + box.height / 2,
    });
    setOpenedWith(text);
    setOpen(true);
  }

  const hide = () => setOpen(false);
  const changed = text !== openedWith;

  // The box is given the width of its text, in pixels, so that it can ease to
  // a new width when the text changes (a width of auto can not be eased)
  const box = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const mounted = Boolean(shown && spot);
  useLayoutEffect(() => {
    if (!box.current || !label.current) return;
    const style = getComputedStyle(box.current);
    const padding =
      parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    box.current.style.width = `${label.current.offsetWidth + padding}px`;
  }, [text, mounted]);

  return (
    <span
      ref={anchor}
      className={className ? `tooltip-anchor ${className}` : "tooltip-anchor"}
      aria-describedby={open ? id : undefined}
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {shown &&
        spot &&
        createPortal(
          <span
            ref={box}
            id={id}
            role="tooltip"
            aria-label={text}
            className={`tooltip tooltip--${side}${open ? "" : " tooltip--leaving"}${changed ? " tooltip--changed" : ""}`}
            style={{ left: spot.x, top: spot.y }}
          >
            <span key={text} ref={label} aria-hidden="true">
              <Letters text={text} step={step} />
            </span>
          </span>,
          document.body,
        )}
    </span>
  );
}

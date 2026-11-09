import { useRef, useState, type CSSProperties } from "react";

import skullFloor from "@assets/ui/deco/skull_floor.png";

import ChatBox from "../../../overlays/chat-box/ChatBox.tsx";

type SkullFloorProps = {
  entrance?: "wait" | "play";
  // said in a chat box above the skull, to its left, when it is hovered
  chat?: string;
};

// how far the chat box is from the corner of the skull
const CORNER_GAP = 4;

export default function SkullFloor({ entrance, chat }: SkullFloorProps) {
  const anchor = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null);

  const skull = (
    <img
      src={skullFloor}
      alt="skull"
      className={`skull-floor${entrance ? " bounce-in-down-rotated" : ""}`}
      style={
        entrance
          ? ({
              animationPlayState: entrance === "play" ? "running" : "paused",
            } as CSSProperties)
          : undefined
      }
    />
  );

  if (!chat) return skull;

  function show() {
    const box = anchor.current?.getBoundingClientRect();
    if (!box) return;
    setSpot({ x: box.left - CORNER_GAP, y: box.top - CORNER_GAP });
    setOpen(true);
  }

  return (
    <div
      ref={anchor}
      className="skull-floor-anchor"
      onPointerEnter={show}
      onPointerLeave={() => setOpen(false)}
    >
      {skull}
      {spot && <ChatBox text={chat} open={open} x={spot.x} y={spot.y} />}
    </div>
  );
}

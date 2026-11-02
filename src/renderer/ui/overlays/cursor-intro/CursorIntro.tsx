import { useEffect, useLayoutEffect, useRef, useState } from "react";

import handImg from "@assets/ui/hand.svg";

import { useGame } from "../../../provider/useGame.ts";

export default function CursorIntro() {
  const { loading } = useGame();
  const [playing, setPlaying] = useState(false);
  const cover = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const wasLoading = useRef(loading.mounted);

  function place() {
    const at = pointer.current;
    if (!at || !copy.current || !cover.current) return;

    copy.current.style.translate = `${at.x}px ${at.y}px`;
    const under = document
      .elementsFromPoint(at.x, at.y)
      .find((element) => !cover.current?.contains(element));
    const kind = under
      ? getComputedStyle(under).getPropertyValue("--cursor-kind").trim()
      : "";
    cover.current.dataset.kind = kind === "hand" ? "hand" : "default";
  }

  useEffect(() => {
    function move(event: PointerEvent) {
      pointer.current = { x: event.clientX, y: event.clientY };
      place();
    }
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => {
    if (wasLoading.current && !loading.mounted && pointer.current) {
      setPlaying(true);
    }
    wasLoading.current = loading.mounted;
  }, [loading.mounted]);

  useLayoutEffect(place, [playing]);

  if (!playing) return null;

  return (
    <div ref={cover} className="cursor-intro">
      <div ref={copy} className="cursor-intro-copy">
        <div
          className="cursor-intro-art"
          onAnimationEnd={() => setPlaying(false)}
        >
          <img src={handImg} alt="" />
        </div>
      </div>
    </div>
  );
}

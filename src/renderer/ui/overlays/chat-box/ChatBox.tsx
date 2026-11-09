import { Fragment, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import Letters from "../../components/text/letters/Letters.tsx";
import { useFadeOut } from "../alert-popup/useFadeOut.ts";

type ChatBoxProps = {
  text: string;
  open: boolean;
  x: number;
  y: number;
};

const EXIT_MS = 100;

function words(text: string) {
  let offset = 0;
  return text.split(" ").map((word) => {
    const start = offset;
    offset += word.length + 1;
    return { word, offset: start };
  });
}

export default function ChatBox({ text, open, x, y }: ChatBoxProps) {
  const shown = useFadeOut(open, EXIT_MS);
  if (!shown) return null;

  return createPortal(
    <span
      role="tooltip"
      aria-label={text}
      className={`chat-box${open ? "" : " chat-box--leaving"}`}
      style={{ left: x, top: y, "--chat-x": `${x}px` } as CSSProperties}
    >
      <span className="chat-box-body" aria-hidden="true">
        {words(text).map(({ word, offset }, index) => (
          <Fragment key={index}>
            {index > 0 && " "}
            <span className="chat-box-word">
              <Letters text={word} step={0.014} offset={offset} />
            </span>
          </Fragment>
        ))}
      </span>
    </span>,
    document.body,
  );
}

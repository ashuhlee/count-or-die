const SHAPE = "M56 8V0L0 0V8L8 8L8 16H16V24H24V32H32V24H40V16H48V8L56 8Z";

type ChatTipProps = {
  border: number;
  overlap: number;
};

export default function ChatTip({ border, overlap }: ChatTipProps) {
  const reach = border * 2;
  const width = 56 + reach * 2;
  const height = 32 + reach;
  const view = {
    viewBox: `${-reach} 0 ${width} ${height}`,
    width: width / 2,
    height: height / 2,
    "aria-hidden": true,
  };

  return (
    <div
      className="chat-tip"
      style={{ width: width / 2, height: height / 2, marginTop: -overlap }}
    >
      <div
        className="chat-tip-frame"
        style={{ clipPath: `inset(${overlap}px -50px -50px -50px)` }}
      >
        <svg className="chat-tip-art" {...view}>
          <defs>
            <path id="chat-tip-shape" d={SHAPE} />
          </defs>
          <g fill="var(--goal-border, white)">
            <use href="#chat-tip-shape" x={-reach} />
            <use href="#chat-tip-shape" x={reach} />
            <use href="#chat-tip-shape" y={reach} />
          </g>
        </svg>
      </div>
      <svg className="chat-tip-art" {...view}>
        <use
          href="#chat-tip-shape"
          // the same shade as the bottom of the goal box, where they meet
          style={{
            fill: "color-mix(in srgb, var(--goal-accent, var(--goal-border, white)) var(--panel-shade), var(--panel-fill))",
          }}
        />
      </svg>
    </div>
  );
}

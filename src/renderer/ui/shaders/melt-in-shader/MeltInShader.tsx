import { useCallback, useEffect, useRef, useState, type Ref } from "react";
import "./MeltInShader.css";

// how many points the burn starts from
const SEEDS = 6;

const BRIGHTNESS_END = 1.02;
const SHADOW = { offset: 6, alpha: 0.15 } as const;

export type MeltColors = {
  edge: string;
  flash: string;
  ember: string;
  cinder: string;
  sparkA: string;
  sparkB: string;
  shadow: string;
};

export const MELT_COLORS: MeltColors = {
  edge: "#ff8ae0",
  flash: "#ffffff",
  ember: "#9875ff",
  cinder: "#ffffff",
  sparkA: "#ff8ae0",
  sparkB: "#a8e6ff",
  shadow: "#ce2a85",
};

// #rgb, #rrggbb or #rrggbbaa, as 0 to 1; the opacity is only there when given
const parseHex = (hex: string) => {
  let digits = hex.trim().replace(/^#/, "");
  if (digits.length === 3 || digits.length === 4) {
    digits = [...digits].map((digit) => digit + digit).join("");
  }
  if (!/^([0-9a-f]{6}|[0-9a-f]{8})$/i.test(digits)) return undefined;
  const channel = (at: number) => parseInt(digits.slice(at, at + 2), 16) / 255;
  return {
    r: channel(0),
    g: channel(2),
    b: channel(4),
    alpha: digits.length === 8 ? channel(6) : undefined,
  };
};

const resolveColor = (palette: MeltColors, name: keyof MeltColors) =>
  parseHex(palette[name]) ?? parseHex(MELT_COLORS[name])!;

const ZOOM = { start: 0.1, spin: -50, duration: 300 };
const SHAKE = { distance: 25, tilt: 2, step: 20, duration: 400 };

const VERTEX = `
attribute vec2 position;
varying vec2 uv;
void main() {
  // y runs down the image, like the texture does
  uv = vec2(position.x * 0.5 + 0.5, 0.5 - position.y * 0.5);
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAGMENT = `
precision highp float;

varying vec2 uv;
uniform sampler2D image;
uniform vec2 size;
uniform vec2 canvasSize;
uniform float progress;
uniform float time;
uniform vec2 seeds[SEEDS];
uniform float starts[SEEDS];
uniform vec2 shadowOffset;
uniform vec4 shadowColor;
uniform float outward;
uniform float blockScale;
uniform float brightnessEnd;
uniform vec3 edgeColor;
uniform vec3 flashColor;
uniform vec3 emberColor;
uniform vec3 cinderColor;
uniform vec3 sparkA;
uniform vec3 sparkB;

const float EDGE_BLOCK = 8.0;

const float BRIGHTNESS_START = 2.0;
const float BRIGHTNESS_FADE = 0.2;


float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  return noise(p) * 0.6 + noise(p * 2.1 + 7.3) * 0.4;
}

// the image as it looks at a spot with the burn on it, premultiplied
vec4 burn(vec2 px) {
  float edge = max(1.0, EDGE_BLOCK * blockScale);
  vec2 cell = (floor(px / edge) + 0.5) * edge;

  float flicker = fbm(cell / size * 7.0 + time * 0.35);
  float depth = -1.0;
  for (int i = 0; i < SEEDS; i++) {
    float local = clamp((progress - starts[i]) / (1.0 - starts[i]), 0.0, 1.0);
    if (local > 0.0) {
      float dist = length(cell - seeds[i]) / length(size);
      depth = max(depth, local * 1.25 - dist + (flicker - 0.5) * 0.16);
    }
  }
  if (outward > 0.5) depth = -depth;

  // a spark now and then, just ahead of the edge
  bool spark = depth > -0.025 && depth <= 0.0
    && hash(cell + floor(time * 8.0)) > 0.9;
  if (spark) {
    return vec4(hash(cell + 3.7) > 0.5 ? sparkA : sparkB, 1.0);
  }
  if (depth <= 0.0) {
    return vec4(0.0);
  }

  float block = depth < 0.035 ? 16.0 * blockScale
    : depth < 0.07 ? 8.0 * blockScale
    : depth < 0.12 ? 4.0 * blockScale
    : 1.0;
  vec2 snapped = (floor(px / block) + 0.5) * block;
  // the canvas is a little bigger than the image so the shadow has room
  if (snapped.x < 0.0 || snapped.y < 0.0 || snapped.x >= size.x || snapped.y >= size.y) {
    return vec4(0.0);
  }
  vec4 color = texture2D(image, snapped / size);

  float life = outward > 0.5 ? 1.0 - progress : progress;
  float brightness = mix(BRIGHTNESS_START, brightnessEnd, min(life / BRIGHTNESS_FADE, 1.0));
  vec3 rgb = min(color.rgb * brightness, 1.0);
  if (depth < 0.02) rgb = edgeColor;
  else if (depth < 0.04) rgb = flashColor;
  else if (depth < 0.065) rgb = mix(rgb, emberColor, 0.7);
  else if (depth < 0.1) rgb = mix(rgb, cinderColor, 0.35);

  return vec4(rgb * color.a, color.a);
}

void main() {
  vec2 px = uv * canvasSize;
  vec4 top = burn(px);

  // the shadow is the same picture, further down and right, in one color
  float casting = burn(px - shadowOffset).a;
  vec4 shadow = vec4(shadowColor.rgb, 1.0) * shadowColor.a * casting;

  gl_FragColor = top + shadow * (1.0 - top.a);
}`.replace(/SEEDS/g, String(SEEDS));

type MeltInShaderProps = {
  ref?: Ref<HTMLImageElement>;
  src: string;
  alt: string;
  className?: string;
  active: boolean;
  delay?: number;
  duration?: number;
  loop?: number;
  mode?: "in" | "out";
  pixelScale?: number;
  shadow?: boolean;
  colors?: Partial<MeltColors>;
  settledBrightness?: number;
};

type Phase = "idle" | "melting" | "done";

const compile = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

export default function MeltInShader({
  ref,
  src,
  alt,
  className,
  active,
  delay = 0,
  duration = 1600,
  loop,
  mode = "in",
  pixelScale = 1,
  shadow = true,
  colors,
  settledBrightness = BRIGHTNESS_END,
}: MeltInShaderProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const setImage = useCallback(
    (node: HTMLImageElement | null) => {
      imageRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const out = mode === "out";
  // already burned away when it first shows up, so it does not burn again
  const startsGone = useRef(out && active);
  const [phase, setPhase] = useState<Phase>(out && active ? "done" : "idle");

  const fragmentSource = FRAGMENT;
  const paletteKey = JSON.stringify({ ...MELT_COLORS, ...colors });

  useEffect(() => {
    if (!active) return;
    if (startsGone.current) {
      return () => {
        startsGone.current = false;
        setPhase("idle");
      };
    }

    const image = imageRef.current;
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!image || !canvas || !wrapper) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const gl = reducedMotion
      ? null
      : canvas.getContext("webgl", {
          alpha: true,
          premultipliedAlpha: true,
          antialias: false,
          depth: false,
          stencil: false,
        });
    const vertex = gl && compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = gl && compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl?.createProgram();

    // without WebGL the image just appears
    if (!gl || !vertex || !fragment || !program) {
      setPhase("done");
      return () => setPhase("idle");
    }

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      setPhase("done");
      return () => setPhase("idle");
    }
    gl.useProgram(program);

    // one triangle that covers the whole canvas
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const uniform = {
      size: gl.getUniformLocation(program, "size"),
      canvasSize: gl.getUniformLocation(program, "canvasSize"),
      progress: gl.getUniformLocation(program, "progress"),
      time: gl.getUniformLocation(program, "time"),
      shadowOffset: gl.getUniformLocation(program, "shadowOffset"),
      shadowColor: gl.getUniformLocation(program, "shadowColor"),
      outward: gl.getUniformLocation(program, "outward"),
      blockScale: gl.getUniformLocation(program, "blockScale"),
      brightnessEnd: gl.getUniformLocation(program, "brightnessEnd"),
      edgeColor: gl.getUniformLocation(program, "edgeColor"),
      flashColor: gl.getUniformLocation(program, "flashColor"),
      emberColor: gl.getUniformLocation(program, "emberColor"),
      cinderColor: gl.getUniformLocation(program, "cinderColor"),
      sparkA: gl.getUniformLocation(program, "sparkA"),
      sparkB: gl.getUniformLocation(program, "sparkB"),
      seeds: gl.getUniformLocation(program, "seeds"),
      starts: gl.getUniformLocation(program, "starts"),
    };

    // the current frame of the gif goes through a 2D canvas, which knows how
    // to draw an animated image as it looks right now
    const frame = document.createElement("canvas");
    const frameContext = frame.getContext("2d");

    const palette: MeltColors = JSON.parse(paletteKey);
    const setColor = (
      location: WebGLUniformLocation | null,
      name: keyof MeltColors,
    ) => {
      const { r, g, b } = resolveColor(palette, name);
      gl.uniform3f(location, r, g, b);
    };
    setColor(uniform.edgeColor, "edge");
    setColor(uniform.flashColor, "flash");
    setColor(uniform.emberColor, "ember");
    setColor(uniform.cinderColor, "cinder");
    setColor(uniform.sparkA, "sparkA");
    setColor(uniform.sparkB, "sparkB");
    const shadowColor = resolveColor(palette, "shadow");

    // where the burn starts, and how soon after the first one each point catches
    const seeds = new Float32Array(SEEDS * 2);
    const starts = new Float32Array(SEEDS);

    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let started = 0;
    let showing = false;

    // image pixels per screen pixel; the image is always laid out, the
    // canvas is not while it waits
    const shadowScale = () =>
      image.naturalWidth / (image.clientWidth || image.naturalWidth);

    const draw = () => {
      const elapsed = performance.now() - started;
      const progress = Math.min(elapsed / duration, 1);

      const tick = Math.floor(elapsed / SHAKE.step);
      const jolt = (n: number) => {
        const x = Math.sin(tick * 127.1 + n * 311.7) * 43758.5453;
        return (x - Math.floor(x)) * 2 - 1;
      };
      // the zoom, spin and shake run backwards when it melts out, and their
      // distances follow the size it is drawn at
      const t = out ? duration - elapsed : elapsed;
      const motion = (image.clientWidth || 390) / 390;
      const arrived =
        1 - (1 - Math.max(0, Math.min(t / ZOOM.duration, 1))) ** 3;
      const zoom = ZOOM.start + (1 - ZOOM.start) * arrived;
      const spin = ZOOM.spin * (1 - arrived);
      const shake = Math.max(0, 1 - t / SHAKE.duration) ** 2;
      const reach = SHAKE.distance * motion * shake;
      wrapper.style.transform =
        progress < 1
          ? `translate(${jolt(1) * reach}px, ${jolt(2) * reach}px) rotate(${spin + jolt(3) * SHAKE.tilt * shake}deg) scale(${zoom})`
          : "";

      if (!showing) {
        showing = true;
        setPhase("melting");
      }

      frameContext?.clearRect(0, 0, frame.width, frame.height);
      frameContext?.drawImage(image, 0, 0);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        frame,
      );

      gl.uniform2f(uniform.size, frame.width, frame.height);
      gl.uniform2f(uniform.canvasSize, canvas.width, canvas.height);
      gl.uniform1f(uniform.progress, progress);
      gl.uniform1f(uniform.time, elapsed / 1000);
      gl.uniform1f(uniform.outward, out ? 1 : 0);
      gl.uniform1f(uniform.blockScale, pixelScale);
      gl.uniform1f(uniform.brightnessEnd, settledBrightness);
      // the shadow is measured on screen, the canvas is drawn at image size
      const offset = SHADOW.offset * shadowScale();
      gl.uniform2f(uniform.shadowOffset, offset, offset);
      gl.uniform4f(
        uniform.shadowColor,
        shadowColor.r,
        shadowColor.g,
        shadowColor.b,
        shadow ? (shadowColor.alpha ?? SHADOW.alpha) : 0,
      );
      gl.uniform2fv(uniform.seeds, seeds);
      gl.uniform1fv(uniform.starts, starts);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (progress < 1) {
        raf = requestAnimationFrame(draw);
      } else {
        setPhase("done");
        if (loop !== undefined) timer = setTimeout(replay, loop);
      }
    };

    const replay = () => {
      setPhase("idle");
      play();
    };

    const begin = () => {
      frame.width = image.naturalWidth;
      frame.height = image.naturalHeight;
      // room past the right and bottom edges for the shadow to fall into
      const room = shadow ? Math.ceil(SHADOW.offset * shadowScale()) : 0;
      canvas.width = frame.width + room;
      canvas.height = frame.height + room;
      canvas.style.width = `${(canvas.width / frame.width) * 100}%`;
      canvas.style.height = `${(canvas.height / frame.height) * 100}%`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      play();
    };

    const play = () => {
      showing = false;
      for (let i = 0; i < SEEDS; i++) {
        seeds[i * 2] = (0.15 + Math.random() * 0.7) * frame.width;
        seeds[i * 2 + 1] = (0.2 + Math.random() * 0.6) * frame.height;
        starts[i] = i === 0 ? 0 : Math.random() * 0.25;
      }

      timer = setTimeout(() => {
        started = performance.now();
        raf = requestAnimationFrame(draw);
      }, delay);
    };

    const ready = image.complete && image.naturalWidth > 0;
    if (ready) begin();
    else image.addEventListener("load", begin, { once: true });

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      wrapper.style.transform = "";
      image.removeEventListener("load", begin);
      setPhase("idle");
      if (!gl.isContextLost()) {
        gl.deleteTexture(texture);
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
      }
    };
  }, [
    active,
    delay,
    duration,
    loop,
    fragmentSource,
    paletteKey,
    out,
    pixelScale,
    shadow,
    settledBrightness,
  ]);

  const settled = resolveColor(JSON.parse(paletteKey), "shadow");
  const plainShowing = out ? phase === "idle" : phase === "done";
  const filters = [
    settledBrightness !== 1 && `brightness(${settledBrightness})`,
    shadow &&
      `drop-shadow(${SHADOW.offset}px ${SHADOW.offset}px 0px rgba(${[settled.r, settled.g, settled.b].map((c) => Math.round(c * 255)).join(", ")}, ${settled.alpha ?? SHADOW.alpha}))`,
  ].filter(Boolean);

  return (
    <div
      ref={wrapperRef}
      className={`melt-in-shader${className ? ` ${className}` : ""}`}
    >
      <div
        style={{
          opacity: plainShowing ? 1 : 0.001,
          filter:
            plainShowing && filters.length ? filters.join(" ") : undefined,
        }}
      >
        <img
          ref={setImage}
          src={src}
          alt={alt}
          className="melt-in-shader__image"
        />
      </div>
      <canvas
        ref={canvasRef}
        className="melt-in-shader__canvas"
        style={{ display: phase === "melting" ? "block" : "none" }}
        aria-hidden="true"
      />
    </div>
  );
}

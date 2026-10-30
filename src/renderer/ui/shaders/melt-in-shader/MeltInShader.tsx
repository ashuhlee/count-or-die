import { useEffect, useRef, useState } from "react";
import "./MeltInShader.css";

// how many points the burn starts from
const SEEDS = 6;

const BRIGHTNESS_END = 1.02;
const SHADOW = { offset: 6, color: [206, 42, 133], alpha: 0.15 } as const;

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
uniform float progress;
uniform float time;
uniform vec2 seeds[SEEDS];
uniform float starts[SEEDS];
uniform vec2 shadowOffset;
uniform vec4 shadowColor;

const float EDGE_BLOCK = 8.0;

const float BRIGHTNESS_START = 2.0;
const float BRIGHTNESS_FADE = 0.2;
const float BRIGHTNESS_END = ${BRIGHTNESS_END.toFixed(2)};

const vec3 SPARK_A = vec3(1.0, 0.541, 0.878);
const vec3 SPARK_B = vec3(0.659, 0.902, 1.0);

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
  vec2 cell = (floor(px / EDGE_BLOCK) + 0.5) * EDGE_BLOCK;

  float flicker = fbm(cell / size * 7.0 + time * 0.35);
  float depth = -1.0;
  for (int i = 0; i < SEEDS; i++) {
    float local = clamp((progress - starts[i]) / (1.0 - starts[i]), 0.0, 1.0);
    if (local > 0.0) {
      float dist = length(cell - seeds[i]) / length(size);
      depth = max(depth, local * 1.25 - dist + (flicker - 0.5) * 0.16);
    }
  }

  // a spark now and then, just ahead of the edge
  bool spark = depth > -0.025 && depth <= 0.0
    && hash(cell + floor(time * 8.0)) > 0.9;
  if (spark) {
    return vec4(hash(cell + 3.7) > 0.5 ? SPARK_A : SPARK_B, 1.0);
  }
  if (depth <= 0.0) {
    return vec4(0.0);
  }

  float block = depth < 0.035 ? 16.0 : depth < 0.07 ? 8.0 : depth < 0.12 ? 4.0 : 1.0;
  vec2 snapped = (floor(px / block) + 0.5) * block;
  vec4 color = texture2D(image, snapped / size);

  float brightness = mix(BRIGHTNESS_START, BRIGHTNESS_END, min(progress / BRIGHTNESS_FADE, 1.0));
  vec3 rgb = min(color.rgb * brightness, 1.0);
  if (depth < 0.02) rgb = vec3(1.0, 0.541, 0.878);
  else if (depth < 0.04) rgb = vec3(1.0);
  else if (depth < 0.065) rgb = mix(rgb, vec3(0.596, 0.459, 1.0), 0.7);
  else if (depth < 0.1) rgb = mix(rgb, vec3(1.0), 0.35);

  return vec4(rgb * color.a, color.a);
}

void main() {
  vec2 px = uv * size;
  vec4 top = burn(px);

  // the shadow is the same picture, further down and right, in one color
  float casting = burn(px - shadowOffset).a;
  vec4 shadow = vec4(shadowColor.rgb, 1.0) * shadowColor.a * casting;

  gl_FragColor = top + shadow * (1.0 - top.a);
}`.replace(/SEEDS/g, String(SEEDS));

type MeltInShaderProps = {
  src: string;
  alt: string;
  className?: string;
  active: boolean;
  delay?: number;
  duration?: number;
  loop?: number;
};

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
  src,
  alt,
  className,
  active,
  delay = 0,
  duration = 1600,
  loop,
}: MeltInShaderProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [melted, setMelted] = useState(false);

  const fragmentSource = FRAGMENT;

  useEffect(() => {
    if (!active) return;

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
      setMelted(true);
      return () => setMelted(false);
    }

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      setMelted(true);
      return () => setMelted(false);
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
      progress: gl.getUniformLocation(program, "progress"),
      time: gl.getUniformLocation(program, "time"),
      shadowOffset: gl.getUniformLocation(program, "shadowOffset"),
      shadowColor: gl.getUniformLocation(program, "shadowColor"),
      seeds: gl.getUniformLocation(program, "seeds"),
      starts: gl.getUniformLocation(program, "starts"),
    };

    // the current frame of the gif goes through a 2D canvas, which knows how
    // to draw an animated image as it looks right now
    const frame = document.createElement("canvas");
    const frameContext = frame.getContext("2d");

    // where the burn starts, and how soon after the first one each point catches
    const seeds = new Float32Array(SEEDS * 2);
    const starts = new Float32Array(SEEDS);

    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let started = 0;

    const draw = () => {
      const elapsed = performance.now() - started;
      const progress = Math.min(elapsed / duration, 1);

      const tick = Math.floor(elapsed / SHAKE.step);
      const jolt = (n: number) => {
        const x = Math.sin(tick * 127.1 + n * 311.7) * 43758.5453;
        return (x - Math.floor(x)) * 2 - 1;
      };
      // the zoom and the spin finish together, well before the burn does
      const arrived = 1 - (1 - Math.min(elapsed / ZOOM.duration, 1)) ** 3;
      const zoom = ZOOM.start + (1 - ZOOM.start) * arrived;
      const spin = ZOOM.spin * (1 - arrived);
      const shake = Math.max(0, 1 - elapsed / SHAKE.duration) ** 2;
      wrapper.style.transform =
        progress < 1
          ? `translate(${jolt(1) * SHAKE.distance * shake}px, ${jolt(2) * SHAKE.distance * shake}px) rotate(${spin + jolt(3) * SHAKE.tilt * shake}deg) scale(${zoom})`
          : "";

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
      gl.uniform1f(uniform.progress, progress);
      gl.uniform1f(uniform.time, elapsed / 1000);
      // the shadow is measured on screen, the canvas is drawn at image size
      const scale = canvas.width / (canvas.clientWidth || canvas.width);
      gl.uniform2f(
        uniform.shadowOffset,
        SHADOW.offset * scale,
        SHADOW.offset * scale,
      );
      const [r, g, b] = SHADOW.color;
      gl.uniform4f(
        uniform.shadowColor,
        r / 255,
        g / 255,
        b / 255,
        SHADOW.alpha,
      );
      gl.uniform2fv(uniform.seeds, seeds);
      gl.uniform1fv(uniform.starts, starts);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (progress < 1) {
        raf = requestAnimationFrame(draw);
      } else {
        setMelted(true);
        if (loop !== undefined) timer = setTimeout(replay, loop);
      }
    };

    const replay = () => {
      setMelted(false);
      play();
    };

    const begin = () => {
      frame.width = canvas.width = image.naturalWidth;
      frame.height = canvas.height = image.naturalHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      play();
    };

    const play = () => {
      for (let i = 0; i < SEEDS; i++) {
        seeds[i * 2] = (0.15 + Math.random() * 0.7) * canvas.width;
        seeds[i * 2 + 1] = (0.2 + Math.random() * 0.6) * canvas.height;
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
      setMelted(false);
      if (!gl.isContextLost()) {
        gl.deleteTexture(texture);
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
      }
    };
  }, [active, delay, duration, loop, fragmentSource]);

  return (
    <div
      ref={wrapperRef}
      className={`melt-in-shader${className ? ` ${className}` : ""}`}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="melt-in-shader__image"
        style={{
          opacity: melted ? 1 : 0.001,
          filter: melted
            ? `brightness(${BRIGHTNESS_END}) drop-shadow(${SHADOW.offset}px ${SHADOW.offset}px 0px rgba(${SHADOW.color.join(", ")}, ${SHADOW.alpha}))`
            : undefined,
        }}
      />
      <canvas
        ref={canvasRef}
        className="melt-in-shader__canvas"
        style={{ display: melted ? "none" : "block" }}
        aria-hidden="true"
      />
    </div>
  );
}

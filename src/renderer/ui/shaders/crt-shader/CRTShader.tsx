import { useEffect, useRef, useState } from "react";
import "./CRTShader.css";

// The lighting of the WebGL CRT shader by Matt Sephton (MIT licence, github.com/
// gingerbeardman/webgl-crt-shader): scanlines, vignette, flicker and a curve.
// The original reads the picture it is drawn over, which a web page cannot
// give it, so this draws only the lighting, as a canvas that is multiplied over
// the page. The lighting maths is the original's.

const VERTEX = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAGMENT = `
precision highp float;

uniform vec2 resolution;
uniform float time;
uniform float scanlineIntensity;
uniform float scanlineCount;
uniform float drift;
uniform float adaptiveIntensity;
uniform float vignetteStrength;
uniform float curvature;
uniform float bezel;
uniform float edgeBlur;
uniform float flickerStrength;

const float PI = 3.14159265;

// Pulls each edge in more the further it is from its own middle, so the middle
// of every side stays on screen and only the corners are rounded off. A
// corner moves out by curvature / 2 of the screen.
vec2 curveRemapUV(vec2 uv, float curvature) {
  vec2 coords = uv * 2.0 - 1.0;
  vec2 offset = abs(coords.yx) * sqrt(curvature * 0.5);
  coords = coords + coords * offset * offset;
  return coords * 0.5 + 0.5;
}

float vignetteApprox(vec2 uv, float strength) {
  vec2 vigCoord = uv * 2.0 - 1.0;
  float dist = max(abs(vigCoord.x), abs(vigCoord.y));
  return 1.0 - dist * dist * strength;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  uv.y = 1.0 - uv.y;

  float lightingMask = 1.0;

  if (curvature > 0.001) uv = curveRemapUV(uv, curvature);

  // the dark corners of a tube, where the curve runs off the screen, fading in
  // over edgeBlur pixels; the bezel adds a border of its own
  if (curvature > 0.001 || bezel > 0.0) {
    vec2 edgePx = (min(uv, 1.0 - uv) - bezel / resolution) * resolution;
    lightingMask *= smoothstep(
      -max(edgeBlur, 1.0),
      0.0,
      min(edgePx.x, edgePx.y)
    );
  }

  if (scanlineIntensity > 0.001) {
    float scanlineY = (uv.y + time * drift) * scanlineCount;
    float scanlinePattern = abs(sin(scanlineY * PI));

    float adaptiveFactor = 1.0;
    if (adaptiveIntensity > 0.001) {
      float yPattern = sin(uv.y * 30.0) * 0.5 + 0.5;
      adaptiveFactor = 1.0 - yPattern * adaptiveIntensity * 0.2;
    }
    lightingMask *= 1.0 - scanlinePattern * scanlineIntensity * adaptiveFactor;
  }

  if (flickerStrength > 0.001) {
    lightingMask *= 1.0 + sin(time * 110.0) * flickerStrength;
  }

  if (vignetteStrength > 0.001) {
    lightingMask *= vignetteApprox(uv, vignetteStrength);
  }

  gl_FragColor = vec4(vec3(lightingMask), 1.0);
}`;

const UNIFORMS = [
  "resolution",
  "time",
  "scanlineIntensity",
  "scanlineCount",
  "drift",
  "adaptiveIntensity",
  "vignetteStrength",
  "curvature",
  "bezel",
  "edgeBlur",
  "flickerStrength",
] as const;

type CRTShaderProps = {
  scanlineIntensity?: number;
  scanlineCount?: number;
  drift?: number;
  adaptiveIntensity?: number;
  vignetteStrength?: number;
  curvature?: number;
  bezel?: number;
  edgeBlur?: number;
  flickerStrength?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  bloomIntensity?: number;
  bloomThreshold?: number;
  bloomRadius?: number;
  maxDevicePixelRatio?: number;
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

// The shader adds a glow around bright areas. A backdrop filter can only
// replace what is behind it, not add to it, so this fades a blurred, brightened
// copy of the page over the page itself: bright areas bleed outward. The
// threshold lowers how much brighter the copy is.
const bloomGain = (threshold: number) => 1 + 1.5 * (1 - threshold);

export default function CRTShader({
  scanlineIntensity = 0.15,
  scanlineCount = 256,
  drift = 6,
  adaptiveIntensity = 0.3,
  vignetteStrength = 0.2,
  curvature = 0.1,
  bezel = 0,
  edgeBlur = 16,
  flickerStrength = 0.01,
  brightness = 1,
  contrast = 1,
  saturation = 1,
  bloomIntensity = 0,
  bloomThreshold = 0.5,
  bloomRadius = 3,
  maxDevicePixelRatio = 2,
}: CRTShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generation, setGeneration] = useState(0);

  const settings = {
    scanlineIntensity,
    scanlineCount,
    drift,
    adaptiveIntensity,
    vignetteStrength,
    curvature,
    bezel,
    edgeBlur,
    flickerStrength,
    maxDevicePixelRatio,
  };
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
    });
    if (!gl) return;

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return;
    }
    gl.useProgram(program);

    const uniform = Object.fromEntries(
      UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)]),
    ) as Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>;

    // one triangle that covers the whole screen
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

    let raf = 0;
    const start = performance.now();

    const draw = () => {
      const s = settingsRef.current;
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        s.maxDevicePixelRatio,
      );
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      const seconds = (performance.now() - start) / 1000;
      gl.uniform2f(uniform.resolution, width, height);
      gl.uniform1f(uniform.time, seconds);
      gl.uniform1f(uniform.scanlineIntensity, s.scanlineIntensity);
      gl.uniform1f(uniform.scanlineCount, s.scanlineCount);
      gl.uniform1f(uniform.drift, s.drift / Math.max(1, canvas.clientHeight));
      gl.uniform1f(uniform.adaptiveIntensity, s.adaptiveIntensity);
      gl.uniform1f(uniform.vignetteStrength, s.vignetteStrength);
      gl.uniform1f(uniform.curvature, s.curvature);
      gl.uniform1f(uniform.bezel, s.bezel * ratio);
      gl.uniform1f(uniform.edgeBlur, s.edgeBlur * ratio);
      gl.uniform1f(uniform.flickerStrength, s.flickerStrength);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(raf);
    };
    const onRestored = () => setGeneration((value) => value + 1);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      if (!gl.isContextLost()) {
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
      }
    };
  }, [generation]);

  const colors = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;

  return (
    <>
      {bloomIntensity > 0 && (
        <div
          className="crt-shader__bloom"
          style={{
            backdropFilter: `blur(${bloomRadius}px) brightness(${bloomGain(bloomThreshold)})`,
            opacity: Math.min(bloomIntensity, 1),
          }}
          aria-hidden="true"
        />
      )}
      <canvas
        ref={canvasRef}
        className="crt-shader"
        style={{ backdropFilter: colors }}
        aria-hidden="true"
      />
    </>
  );
}

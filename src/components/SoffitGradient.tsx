'use client';

import React, { useEffect, useRef } from 'react';

export interface SoffitGradientConfig {
  bgColor?: string;
  colorA?: string;
  colorB?: string;
  colorC?: string;
  colorD?: string;
  scale?: number;
  speed?: number;
  tilt?: number;
  rock?: number;
  horizon?: number;
  breathe?: number;
  spread?: number;
  curve?: number;
  direct?: number;
  bounce?: number;
  bounceCurve?: number;
  spillCentre?: number;
  spillWidth?: number;
  spillFloor?: number;
  amount?: number;
  warp?: number;
  warpScale?: number;
  flow?: number;
  roughness?: number;
  lacunarity?: number;
  motes?: number;
  moteScale?: number;
  ambient?: number;
  contrast?: number;
  midpoint?: number;
  sink?: number;
  glow?: number;
  grain?: number;
  grainAnim?: number;
  dither?: number;
  vignette?: number;
  steer?: number;
  lift?: number;
  sweep?: number;
  cursor?: number;
  parallax?: number;
  maxDpr?: number;
}

export interface SoffitGradientProps extends SoffitGradientConfig {
  className?: string;
  style?: React.CSSProperties;
  config?: SoffitGradientConfig;
}

const DEFAULT_CONFIG: Required<SoffitGradientConfig> = {
  bgColor: '#062334',
  colorA: '#2b7be8',
  colorB: '#2bc8e8',
  colorC: '#4fe0d8',
  colorD: '#7fe8a0',
  ambient: 0.24,
  amount: 0.2,
  bounce: 0.38,
  bounceCurve: 4.25,
  breathe: 0.29,
  contrast: 2.45,
  cursor: 1,
  curve: 3.32,
  direct: 0.97,
  dither: 0.58,
  flow: 0.475,
  glow: 0.38,
  grain: 0,
  grainAnim: 0,
  horizon: 0.36,
  lacunarity: 1.99,
  lift: 0.11,
  maxDpr: 1,
  midpoint: 0.57,
  moteScale: 7,
  motes: 0.074,
  parallax: 0.0137,
  rock: 0.12,
  roughness: 0.29,
  scale: 1,
  sink: 0.24,
  speed: 0.33,
  spillCentre: 0.3,
  spillFloor: 0.26,
  spillWidth: 2.18,
  spread: 0.41,
  steer: -0.13,
  sweep: 0.5,
  tilt: 1.87,
  vignette: 0.21,
  warp: 2.58,
  warpScale: 0.78,
};

const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  iResolution;
uniform float iTime;
uniform vec2  iMouse;          // aspect-corrected units, same space as uv
uniform float uScale;          // zoom of the whole picture — uv and the pointer together

uniform vec3  uBg, uColorA, uColorB, uColorC, uColorD;
uniform float uSpeed, uTilt, uRock, uHorizon, uBreathe, uSpread, uCurve, uDirect;
uniform float uBounce, uBounceCurve;
uniform float uSpillCentre, uSpillWidth, uSpillFloor;
uniform float uAmount, uWarp, uWarpScale, uFlow, uRoughness, uLacunarity, uMotes, uMoteScale;
uniform float uAmbient, uContrast, uMidpoint, uSink, uGlow;
uniform float uGrain, uDither, uVignette;
uniform float uSteer, uLift, uSweep, uParallax;
uniform float uGrainAnim;

#define OCTAVES 4

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float snoise(vec2 p) {
  const float K1 = 0.366025404, K2 = 0.211324865;
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2 o = vec2(m, 1.0 - m);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * h * vec3(dot(a, hash2(i)), dot(b, hash2(i + o)), dot(c, hash2(i + 1.0)));
  return dot(n, vec3(70.0));
}

float fbm(vec2 p) {
  float v = 0.0, amp = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    v += amp * snoise(p);
    p *= uLacunarity;
    amp *= uRoughness;
  }
  return v;
}

vec3 ramp4(float t) {
  vec3 c = mix(uColorA, uColorB, smoothstep(0.00, 0.36, t));
  c = mix(c, uColorC, smoothstep(0.32, 0.70, t));
  c = mix(c, uColorD, smoothstep(0.66, 1.00, t));
  return c;
}

float triDither(vec2 fc) {
  float a = fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453);
  float b = fract(sin(dot(fc + 17.0, vec2(12.9898, 78.233))) * 43758.5453);
  return (a + b - 1.0) / 255.0;
}

float houseGrain(vec2 fc) {
  uvec2 q = uvec2(fc) * uvec2(1597334677u, 3812015801u)
          + uint(floor(iTime * 24.0 * uGrainAnim)) * 2654435769u;
  uint n = q.x ^ q.y; n = n * 1664525u + 1013904223u; n ^= n >> 16u; n *= 2246822519u; n ^= n >> 13u;
  float a = float(n & 0xffffu) / 65535.0;
  n *= 3266489917u; n ^= n >> 16u;
  float b = float(n & 0xffffu) / 65535.0;
  return a + b - 1.0;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution) / iResolution.y;
  uv *= uScale;
  vec2 iM = iMouse * uScale;
  float t = iTime * uSpeed;

  vec2 p = uv - iM * uParallax;

  float tilt = uTilt + sin(t * 0.13) * uRock + iM.x * uSteer;
  vec2 dir = vec2(cos(tilt), sin(tilt));
  float axis = dot(p, dir);
  float across = dot(p, vec2(-dir.y, dir.x));

  vec2 q = vec2(fbm(p * uWarpScale + vec2(0.0, t * uFlow)),
                fbm(p * uWarpScale + vec2(5.2, 1.3) - t * uFlow * 0.7));
  float air = fbm(p + uWarp * q + vec2(t * 0.12, -t * 0.09)) * 0.5 + 0.5;

  float horizon = uHorizon + sin(t * 0.09 + 2.1) * uBreathe - iM.y * uLift;
  float alt = clamp(0.5 + (axis - horizon) * uSpread + (air - 0.5) * uAmount, 0.0, 1.0);

  float ac = (across - uSpillCentre - iM.x * uSweep) / max(0.05, uSpillWidth);
  float spill = mix(uSpillFloor, 1.0, exp(-ac * ac));

  float direct = pow(alt, max(0.05, uCurve)) * uDirect * spill;
  float bounce = uBounce * pow(1.0 - alt, max(0.05, uBounceCurve));

  float f = uAmbient + direct + bounce;
  f += uMotes * snoise(p * uMoteScale + vec2(-t * 0.5, t * 0.35)) * 0.5 * alt;

  f = clamp((f - uMidpoint) * uContrast + 0.5, 0.0, 1.0);

  vec3 col = ramp4(f);
  col += uColorD * uGlow * pow(f, 4.0);
  col = mix(uBg, col, smoothstep(0.0, max(0.01, uSink), f) * 0.90 + 0.10);

  col *= 1.0 - uVignette * dot(uv, uv);
  { float hgL = clamp(dot(col, vec3(0.299, 0.587, 0.114)), 0.0, 1.0);
    col += houseGrain(gl_FragCoord.xy) * uGrain * mix(1.0, 4.0 * hgL * (1.0 - hgL), 0.6); }
  col += triDither(gl_FragCoord.xy) * uDither;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

function hexToVec3(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  return [(num >> 16 & 255) / 255, (num >> 8 & 255) / 255, (num & 255) / 255];
}

export const SoffitGradient: React.FC<SoffitGradientProps> = ({
  className = '',
  style,
  config = {},
  ...directConfig
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cfgRef = useRef({ ...DEFAULT_CONFIG, ...config, ...directConfig });
  cfgRef.current = { ...DEFAULT_CONFIG, ...config, ...directConfig };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    });
    if (!gl) {
      console.warn('WebGL2 is not available for SoffitGradient');
      return;
    }

    function compile(type: number, src: string) {
      const sh = gl!.createShader(type);
      if (!sh) throw new Error('Could not create shader');
      gl!.shaderSource(sh, src);
      gl!.compileShader(sh);
      if (!gl!.getShaderParameter(sh, gl!.COMPILE_STATUS)) {
        const info = gl!.getShaderInfoLog(sh);
        gl!.deleteShader(sh);
        throw new Error(info || 'Shader compile error');
      }
      return sh;
    }

    let program: WebGLProgram;
    try {
      program = gl.createProgram()!;
      const vs = compile(gl.VERTEX_SHADER, VERT);
      const fs = compile(gl.FRAGMENT_SHADER, FRAG);
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || 'Program link error');
      }
    } catch (err) {
      console.error('[SoffitGradient]', err);
      return;
    }

    gl.useProgram(program);
    gl.bindVertexArray(gl.createVertexArray());

    const LOC: Record<string, WebGLUniformLocation | null> = {};
    const loc = (n: string) => (n in LOC ? LOC[n] : (LOC[n] = gl.getUniformLocation(program, n)));
    const u1f = (n: string, v: number) => gl.uniform1f(loc(n), v);
    const u2f = (n: string, x: number, y: number) => gl.uniform2f(loc(n), x, y);
    const u3c = (n: string, hex: string) => {
      const c = hexToVec3(hex);
      gl.uniform3f(loc(n), c[0], c[1], c[2]);
    };

    function applyConfig() {
      const cfg = cfgRef.current;
      gl!.useProgram(program);
      u3c('uBg', cfg.bgColor);
      u3c('uColorA', cfg.colorA);
      u3c('uColorB', cfg.colorB);
      u3c('uColorC', cfg.colorC);
      u3c('uColorD', cfg.colorD);
      u1f('uScale', cfg.scale);
      u1f('uSpeed', cfg.speed);
      u1f('uTilt', cfg.tilt);
      u1f('uRock', cfg.rock);
      u1f('uHorizon', cfg.horizon);
      u1f('uBreathe', cfg.breathe);
      u1f('uSpread', cfg.spread);
      u1f('uCurve', cfg.curve);
      u1f('uDirect', cfg.direct);
      u1f('uBounce', cfg.bounce);
      u1f('uBounceCurve', cfg.bounceCurve);
      u1f('uSpillCentre', cfg.spillCentre);
      u1f('uSpillWidth', cfg.spillWidth);
      u1f('uSpillFloor', cfg.spillFloor);
      u1f('uAmount', cfg.amount);
      u1f('uWarp', cfg.warp);
      u1f('uWarpScale', cfg.warpScale);
      u1f('uFlow', cfg.flow);
      u1f('uRoughness', cfg.roughness);
      u1f('uLacunarity', cfg.lacunarity);
      u1f('uMotes', cfg.motes);
      u1f('uMoteScale', cfg.moteScale);
      u1f('uAmbient', cfg.ambient);
      u1f('uContrast', cfg.contrast);
      u1f('uMidpoint', cfg.midpoint);
      u1f('uSink', cfg.sink);
      u1f('uGlow', cfg.glow);
      u1f('uGrain', cfg.grain);
      u1f('uGrainAnim', cfg.grainAnim);
      u1f('uDither', cfg.dither);
      u1f('uVignette', cfg.vignette);
      u1f('uSteer', cfg.steer);
      u1f('uLift', cfg.lift);
      u1f('uSweep', cfg.sweep);
      u1f('uParallax', cfg.parallax);
      resize();
    }

    function resize() {
      const cfg = cfgRef.current;
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, cfg.maxDpr);
      const w = Math.max(1, Math.round((rect.width || window.innerWidth) * dpr));
      const h = Math.max(1, Math.round((rect.height || window.innerHeight) * dpr));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
      }
      gl!.viewport(0, 0, w, h);
      gl!.useProgram(program);
      u2f('iResolution', w, h);
    }

    const mouse = { x: 0, y: 0, ax: 0, ay: 0, tx: 0, ty: 0, rest: { x: 0, y: 0 } };
    const aim = (e: PointerEvent) => {
      const rect = canvas!.getBoundingClientRect();
      const a = (rect.width || window.innerWidth) / (rect.height || window.innerHeight);
      mouse.tx = ((e.clientX - rect.left) / (rect.width || window.innerWidth) - 0.5) * a;
      mouse.ty = 0.5 - (e.clientY - rect.top) / (rect.height || window.innerHeight);
    };

    window.addEventListener('pointermove', aim, { passive: true });
    window.addEventListener('pointerdown', aim, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    let visible = true;
    const observer = new IntersectionObserver((es) => {
      visible = es[0]?.isIntersecting ?? true;
    }, { threshold: 0 });
    observer.observe(canvas);

    const t0 = performance.now();
    let prevT = t0;
    let clock = 0;
    let raf = 0;

    applyConfig();
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const raw = now - prevT;
      prevT = now;
      if (!visible || document.hidden) return;
      const ms = raw > 50 ? 50 : raw < 4.167 ? 4.167 : raw;
      const s = ms > 36.7 ? 2.2 : ms * 0.06;
      clock += ms * 0.001;

      const kLead = 0.105 * s;
      const kBody = 0.043 * s;
      mouse.ax += (mouse.tx - mouse.ax) * kLead;
      mouse.ay += (mouse.ty - mouse.ay) * kLead;
      mouse.x += (mouse.ax - mouse.x) * kBody;
      mouse.y += (mouse.ay - mouse.y) * kBody;

      gl!.useProgram(program);
      u1f('iTime', clock);
      if (!cfgRef.current.cursor) {
        mouse.tx = mouse.rest.x;
        mouse.ty = mouse.rest.y;
      }
      u2f('iMouse', mouse.x, mouse.y);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('pointermove', aim);
      window.removeEventListener('pointerdown', aim);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full ${className}`}
      style={style}
    />
  );
};

export default SoffitGradient;

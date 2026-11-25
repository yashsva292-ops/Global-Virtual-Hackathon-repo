import React, { useEffect, useRef } from 'react';

export interface LumenBloomConfig {
  c1?: string;       // Primary green (e.g. #00a884 WhatsApp teal)
  c2?: string;       // Secondary green (e.g. #25d366 WhatsApp vibrant signal)
  c3?: string;       // Deep emerald (e.g. #059669 deep emerald)
  c4?: string;       // Luminous mint-cream glint (e.g. #dcfce7)
  bg?: string;       // Warm off-white / cream background (e.g. #efeae2)
  seed?: number;
  scale?: number;
  complex?: number;
  warp?: number;
  flow?: number;
  stretch?: number;
  soft?: number;
  travel?: number;
  loop?: number;     // Loop duration in seconds
  contrast?: number;
  sat?: number;
  exposure?: number;
  glow?: number;
  grain?: number;
  vig?: number;
  ca?: number;
}

export interface LumenBloomBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
  config?: LumenBloomConfig;
}

const DEFAULT_CONFIG: Required<LumenBloomConfig> = {
  // WhatsApp & Emerald calibrated palette replacing pink/blue/purple/orange:
  // Pink -> Deep Emerald (#059669)
  // Blue -> Signal Emerald & WhatsApp Teal (#00a884)
  // Purple/Orange -> Radiant Mint & WhatsApp Green (#25d366, #10b981)
  // Glint -> Soft Mint Glint (#dcfce7)
  // Background -> WhatsApp warm cream/off-white (#efeae2)
  c1: '#00a884', // Signal Teal Emerald
  c2: '#25d366', // WhatsApp vibrant green
  c3: '#059669', // Deep Emerald
  c4: '#10b981', // Luminous Mint-Emerald
  bg: '#efeae2', // Signature WhatsApp warm cream
  seed: 4217,
  scale: 1.15,
  complex: 4.8,
  warp: 0.95,
  flow: 0.35,
  stretch: 0.1,
  soft: 1.25,
  travel: 0.85,
  loop: 8.0,
  contrast: 1.04,
  sat: 1.12,
  exposure: 1.02,
  glow: 0.22,
  grain: 0.02,
  vig: 0.08,
  ca: 0.015,
};

const VERT = `#version 300 es
layout(location=0) in vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;
precision highp int;

uniform vec2  u_res;
uniform float u_phase;
uniform float u_seed;

uniform vec3  u_c1, u_c2, u_c3, u_c4, u_bg;
uniform float u_hue, u_sat, u_exposure, u_contrast;

uniform float u_scale;
uniform float u_complex;
uniform float u_warp;
uniform float u_flow;
uniform float u_stretch;

uniform float u_light, u_gloss, u_lightAngle, u_irid, u_glow;
uniform float u_grain, u_cell, u_lines, u_ca, u_vig, u_soft;
uniform float u_travel;

out vec4 fragColor;

#define TAU 6.28318530718
#define PI  3.14159265359

float hash11(float n){
  n = fract(n * 0.1031);
  n *= n + 33.33;
  n *= n + n;
  return fract(n);
}
float hash21(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p){
  float n = hash21(p);
  return vec2(n, hash21(p+n+17.13));
}

float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  float a = hash21(i);
  float b = hash21(i+vec2(1,0));
  float c = hash21(i+vec2(0,1));
  float d = hash21(i+vec2(1,1));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}

mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

float fbm(vec2 p){
  float v = 0.0, a = 0.5, tot = 0.0;
  mat2 R = rot(0.62);
  for (int i = 0; i < 8; i++){
    float w = clamp(u_complex - float(i), 0.0, 1.0);
    if (w <= 0.0) break;
    v += a*w*vnoise(p);
    tot += a*w;
    a *= 0.55;
    p = R*p*2.03 + 11.7;
  }
  return v/max(tot, 1e-4);
}

vec2 LT(){ return vec2(cos(TAU*u_phase), sin(TAU*u_phase)) * u_travel; }
vec2 SO(){ return vec2(hash11(u_seed*0.137 + 0.731)*61.7, hash11(u_seed*0.213 + 7.0)*47.3); }

vec3 palette(float t){
  t = clamp(t, 0.0, 1.0);
  float x = t*3.0;
  vec3 c = mix(u_c1, u_c2, smoothstep(0.0,1.0,x));
  c = mix(c, u_c3, smoothstep(1.0,2.0,x));
  c = mix(c, u_c4, smoothstep(2.0,3.0,x));
  return c;
}

vec3 hueRotate(vec3 c, float deg){
  float a = deg*PI/180.0;
  float cs = cos(a), sn = sin(a);
  mat3 m = mat3(
    0.299+0.701*cs+0.168*sn, 0.587-0.587*cs+0.330*sn, 0.114-0.114*cs-0.497*sn,
    0.299-0.299*cs-0.328*sn, 0.587+0.413*cs+0.035*sn, 0.114-0.114*cs+0.292*sn,
    0.299-0.300*cs+1.250*sn, 0.587-0.588*cs-1.050*sn, 0.114+0.886*cs-0.203*sn);
  return c*m;
}

vec2 toP(vec2 uv){
  float asp = u_res.x/u_res.y;
  vec2 p = (uv - 0.5) * vec2(asp, 1.0) * (3.0/max(u_scale, 0.15));
  p.x *= mix(1.0, 0.38, clamp(u_stretch, 0.0, 1.0));
  p.y *= mix(1.0, 0.38, clamp(-u_stretch, 0.0, 1.0));
  return p;
}

vec3 blobField(vec2 p, float warpAmt){
  vec2 so = SO();
  p += warpAmt*0.55*vec2(fbm(p*0.8+so)-0.5, fbm(p*0.8-so)-0.5)*2.0;
  vec3 col = u_bg;
  for (int i = 0; i < 5; i++){
    float fi = float(i);
    vec2 hc = hash22(vec2(fi*3.17, u_seed*0.731 + fi));
    vec2 base = (hc - 0.5)*vec2(2.2, 1.6);
    float orbR = 0.18 + 0.4*hash11(u_seed*0.117 + fi*9.1);
    float ph = u_phase + hash11(fi + u_seed*0.291);
    float dir = hash11(fi*5.0 + u_seed*0.49) > 0.5 ? 1.0 : -1.0;
    vec2 pos = base + orbR*u_travel*vec2(cos(TAU*ph*dir), sin(TAU*ph*dir));
    float rad = (0.45 + 0.6*hash11(fi*2.3 + u_seed*0.371 + 4.0)) * u_soft;
    float d = length(p - pos);
    float g = exp(-(d*d)/(rad*rad));
    vec3 bc = palette(fract(fi*0.249 + hash11(fi + u_seed*0.523)*0.18));
    col = mix(col, bc, g*0.92);
  }
  return col;
}

void main(){
  vec2 uv = gl_FragCoord.xy/u_res;
  vec3 col = blobField(toP(uv), u_warp);

  if (u_ca > 0.004){
    float asp0 = u_res.x/u_res.y;
    float r2 = length((uv - 0.5)*vec2(asp0, 1.0));
    float w = clamp(u_ca, 0.0, 1.0)*smoothstep(0.18, 0.85, r2)*0.45;
    vec3 shifted = vec3(
      hueRotate(col,  10.0).r,
      col.g,
      hueRotate(col, -10.0).b);
    col = mix(col, shifted, w);
  }

  float lum = dot(col, vec3(0.299,0.587,0.114));
  col += u_glow * col * lum * 0.85;

  float l2 = dot(col, vec3(0.299,0.587,0.114));
  col = mix(vec3(l2), col, u_sat);
  col *= u_exposure;
  col = (col - 0.5)*u_contrast + 0.5;

  float asp = u_res.x/u_res.y;
  vec2 vc = (uv-0.5)*vec2(asp,1.0);
  col *= 1.0 - u_vig*smoothstep(0.35, 1.05, length(vc));

  float gstep = floor(u_phase*24.0);
  float gr = hash21(gl_FragCoord.xy*0.71 + vec2(gstep*3.1, gstep*7.7));
  col += (gr-0.5)*u_grain*0.55;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  if (clean.length === 3) {
    const r = (num >> 8) & 0xf;
    const g = (num >> 4) & 0xf;
    const b = num & 0xf;
    return [(r | (r << 4)) / 255, (g | (g << 4)) / 255, (b | (b << 4)) / 255];
  }
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

export const LumenBloomBackground: React.FC<LumenBloomBackgroundProps> = ({
  className = '',
  style,
  config = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cfgRef = useRef<Required<LumenBloomConfig>>({ ...DEFAULT_CONFIG, ...config });

  useEffect(() => {
    cfgRef.current = { ...DEFAULT_CONFIG, ...config };
  }, [config]);

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
      console.warn('WebGL2 not supported for LumenBloomBackground');
      return;
    }

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(sh);
        gl.deleteShader(sh);
        throw new Error(info || 'Shader compile error');
      }
      return sh;
    };

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
      console.error('[LumenBloomBackground]', err);
      return;
    }

    gl.useProgram(program);

    // Full-screen triangle buffer
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const LOC: Record<string, WebGLUniformLocation | null> = {};
    const loc = (n: string) => (n in LOC ? LOC[n] : (LOC[n] = gl.getUniformLocation(program, n)));
    const u1f = (n: string, v: number) => gl.uniform1f(loc(n), v);
    const u2f = (n: string, x: number, y: number) => gl.uniform2f(loc(n), x, y);
    const u3f = (n: string, c: [number, number, number]) => gl.uniform3f(loc(n), c[0], c[1], c[2]);

    let animId: number;
    const startTime = performance.now();

    const render = () => {
      if (!canvas || !gl) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      gl.useProgram(program);

      const cfg = cfgRef.current;
      const elapsed = (performance.now() - startTime) / 1000;
      const loopDuration = Math.max(1.0, cfg.loop);
      const phase = (elapsed % loopDuration) / loopDuration;

      u2f('u_res', width, height);
      u1f('u_phase', phase);
      u1f('u_seed', cfg.seed);

      u3f('u_c1', hexToRgb(cfg.c1));
      u3f('u_c2', hexToRgb(cfg.c2));
      u3f('u_c3', hexToRgb(cfg.c3));
      u3f('u_c4', hexToRgb(cfg.c4));
      u3f('u_bg', hexToRgb(cfg.bg));

      u1f('u_hue', 0.0);
      u1f('u_sat', cfg.sat);
      u1f('u_exposure', cfg.exposure);
      u1f('u_contrast', cfg.contrast);

      u1f('u_scale', cfg.scale);
      u1f('u_complex', cfg.complex);
      u1f('u_warp', cfg.warp);
      u1f('u_flow', cfg.flow);
      u1f('u_stretch', cfg.stretch);

      u1f('u_glow', cfg.glow);
      u1f('u_grain', cfg.grain);
      u1f('u_ca', cfg.ca);
      u1f('u_vig', cfg.vig);
      u1f('u_soft', cfg.soft);
      u1f('u_travel', cfg.travel);

      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={style}
    />
  );
};

export default LumenBloomBackground;

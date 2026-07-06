/**
 * Atmosphere shader — the evening's living light (v2, "edel").
 *
 * A single fullscreen fragment shader rendering warm, volumetric light with a
 * more premium, layered look: domain-warped fog, a near/far two-layer glow,
 * refined god-rays, a cool rim accent for elegance against the warm gold, and
 * a scroll-driven vertical parallax so the environment feels 3-D as you move
 * through the night. Palette (base/glow/accent) is lerped on the CPU per
 * chapter and fed in as uniforms.
 */

export const atmosphereVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

export const atmosphereFrag = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec2  uPointer;    // -1..1, eased
  uniform float uScroll;     // 0..1 overall scroll progress
  uniform float uReduced;    // 1.0 when reduced-motion
  uniform vec3  uBase;
  uniform vec3  uGlow;
  uniform vec3  uAccent;

  // ── value noise + fbm ────────────────────────────────────────────────
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 6; i++) {
      v += amp * noise(p);
      p = p * 2.03 + vec2(11.1, 7.3);
      amp *= 0.5;
    }
    return v;
  }
  // domain-warped fbm — organic, layered smoke
  float warp(vec2 p, float t) {
    vec2 q = vec2(fbm(p + vec2(0.0, t * 0.05)), fbm(p + vec2(5.2, 1.3 - t * 0.04)));
    vec2 r = vec2(fbm(p + 1.7 * q + vec2(8.3, 2.8)), fbm(p + 1.7 * q + vec2(1.2, 6.9)));
    return fbm(p + 1.5 * r);
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5);
    p.x *= uResolution.x / uResolution.y;

    float t = uTime * (uReduced > 0.5 ? 0.0 : 1.0);
    // Scroll adds a slow descent through the volume (parallax in depth).
    float depth = uScroll;

    // Drifting light source (candle / window), nudged by pointer + scroll.
    vec2 lightPos = vec2(0.12 + uPointer.x * 0.12, 0.36 + uPointer.y * 0.07 - depth * 0.15);
    lightPos.x += sin(t * 0.07) * 0.06;
    lightPos.y += cos(t * 0.05) * 0.03;
    float d = distance(p, lightPos);

    // Base wash + soft top warmth (dialled back so text stays readable).
    vec3 col = uBase * 0.82;
    float topWarm = smoothstep(1.0, -0.25, uv.y);
    col = mix(col, uBase * 1.15 + uAccent * 0.1, topWarm * 0.38);

    // Rising, domain-warped fog — parallaxes upward with time + scroll.
    vec2 fogUv = vec2(p.x * 1.15, uv.y * 1.5 - t * 0.03 - depth * 0.4);
    float fog = warp(fogUv * 2.1, t);
    fog = smoothstep(0.28, 1.0, fog);
    float floorMask = smoothstep(0.05, 0.8, uv.y);
    col = mix(col, col + uAccent * 0.7, fog * (1.0 - floorMask) * 0.55);

    // Two-layer glow: tight near-core + soft far halo.
    float core = 0.14 / (d * d + 0.045);
    float halo = 0.10 / (d + 0.16);
    col += uGlow * (core * 0.36 + halo * 0.4);

    // Refined god-rays radiating from the light.
    vec2 dir = normalize(p - lightPos + 1e-4);
    float ang = atan(dir.y, dir.x);
    float rays = 0.5 + 0.5 * sin(ang * 14.0 + t * 0.25);
    rays *= 0.6 + 0.4 * sin(ang * 5.0 - t * 0.15);
    rays *= smoothstep(1.0, 0.0, d);
    col += uGlow * rays * 0.045;

    // Cool rim accent toward the far edges — the "edel" contrast.
    vec3 coolTint = vec3(0.36, 0.45, 0.62);
    float rim = smoothstep(0.55, 1.25, length(p));
    col = mix(col, col + coolTint * 0.10, rim * (0.4 + 0.3 * fog));

    // Distant ember sparkle.
    float spark = warp(p * 9.0 + t * 0.1, t);
    spark = pow(smoothstep(0.86, 1.0, spark), 3.0);
    col += uGlow * spark * 0.6;

    // Vignette — deepen the shadows, draw the eye in (darker for readability).
    float vig = smoothstep(1.3, 0.25, length(p));
    col *= mix(0.3, 0.92, vig);

    // Film grain (subtle, animated).
    float grain = hash(uv * uResolution + t) - 0.5;
    col += grain * 0.022;

    // Filmic tone curve + gentle lift.
    col = col / (col + vec3(0.82));
    col = pow(col, vec3(0.9));

    gl_FragColor = vec4(col, 1.0);
  }
`

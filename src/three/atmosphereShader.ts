/**
 * Atmosphere shader — the evening's living light.
 *
 * A single fullscreen fragment shader that renders warm volumetric light:
 * a drifting glow (the candle / the window), rising fog built from fbm noise,
 * faint god-rays and film grain. The three palette colours (base / glow /
 * accent) are lerped on the CPU from the per-chapter grades and fed in as
 * uniforms, so the whole environment re-lights as the guest scrolls the night.
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
    for (int i = 0; i < 5; i++) {
      v += amp * noise(p);
      p *= 2.02;
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    // aspect-correct coordinates centred at 0
    vec2 uv = vUv;
    vec2 p = (uv - 0.5);
    p.x *= uResolution.x / uResolution.y;

    float t = uTime * (uReduced > 0.5 ? 0.0 : 1.0);

    // Light source position: high, drifting, nudged by the pointer.
    vec2 lightPos = vec2(0.12 + uPointer.x * 0.10, 0.34 + uPointer.y * 0.06);
    lightPos.x += sin(t * 0.07) * 0.06;
    lightPos.y += cos(t * 0.05) * 0.03;

    float d = distance(p, lightPos);

    // Base wash — a soft vertical warmth from the top.
    vec3 col = uBase;
    float topWarm = smoothstep(1.0, -0.2, uv.y);
    col = mix(col, uBase * 1.5 + uAccent * 0.15, topWarm * 0.5);

    // Rising fog: fbm scrolled upward, denser low, tinted with accent.
    vec2 fogUv = vec2(p.x * 1.2, uv.y * 1.6 - t * 0.03);
    float fog = fbm(fogUv * 2.4 + fbm(fogUv * 1.1 + t * 0.02));
    fog = smoothstep(0.25, 1.0, fog);
    float fogMask = smoothstep(0.05, 0.75, uv.y); // more toward the floor
    col = mix(col, col + uAccent * 0.6, fog * (1.0 - fogMask) * 0.5);

    // The glow — candle / window bloom.
    float glow = 0.16 / (d * d + 0.05);
    glow += 0.09 / (d + 0.14);
    col += uGlow * glow * 0.5;

    // Faint god-rays radiating from the light.
    vec2 dir = normalize(p - lightPos + 1e-4);
    float ang = atan(dir.y, dir.x);
    float rays = 0.5 + 0.5 * sin(ang * 12.0 + t * 0.2);
    rays *= smoothstep(0.9, 0.0, d);
    col += uGlow * rays * 0.05;

    // Distant embers / dust sparkle (very subtle).
    float spark = fbm(p * 18.0 + t * 0.15);
    spark = pow(smoothstep(0.82, 1.0, spark), 3.0);
    col += uGlow * spark * 0.5;

    // Vignette — draw the eye inward, deepen the shadows.
    float vig = smoothstep(1.25, 0.25, length(p));
    col *= mix(0.55, 1.05, vig);

    // Film grain.
    float grain = hash(uv * uResolution + t) - 0.5;
    col += grain * 0.025;

    // Gentle filmic tone curve.
    col = col / (col + vec3(0.85));
    col = pow(col, vec3(0.92));

    gl_FragColor = vec4(col, 1.0);
  }
`

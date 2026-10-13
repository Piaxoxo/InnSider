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
    // Held to the upper right so it never blooms behind the (left-set) copy.
    vec2 lightPos = vec2(0.36 + uPointer.x * 0.1, 0.42 + uPointer.y * 0.06 - depth * 0.12);
    lightPos.x += sin(t * 0.07) * 0.06;
    lightPos.y += cos(t * 0.05) * 0.03;
    float d = distance(p, lightPos);

    // ── Der Grund ──────────────────────────────────────────────────────
    // Fast schwarz. Luxus im Dunkeln entsteht nicht dadurch, dass alles
    // gleichmäßig schummrig ist, sondern dadurch, dass es irgendwo wirklich
    // schwarz ist und irgendwo wirklich leuchtet. Vorher begann dieser Wert
    // bei 0.82 — daher der milchige Schleier über dem ganzen Bild.
    vec3 col = uBase * 0.22;
    float topWarm = smoothstep(1.0, -0.1, uv.y);
    col = mix(col, uBase * 0.5 + uAccent * 0.08, topWarm * 0.12);

    // ── Der Rauch ──────────────────────────────────────────────────────
    // Bleibt am Boden und in der Nähe des Lichts, statt sich über die ganze
    // Fläche zu legen. Rauch, den niemand anleuchtet, sieht man nicht.
    vec2 fogUv = vec2(p.x * 1.15, uv.y * 1.5 - t * 0.03 - depth * 0.4);
    float fog = warp(fogUv * 2.1, t);
    fog = smoothstep(0.34, 1.0, fog);
    float floorMask = smoothstep(0.0, 0.62, uv.y);
    float lit = smoothstep(1.1, 0.1, d);
    col += uAccent * fog * (1.0 - floorMask) * lit * 0.26;

    // ── Die Quelle ─────────────────────────────────────────────────────
    // Enger Kern mit steilem Abfall, dazu ein weiter Hof. Das ist der
    // Unterschied zwischen „es ist hell" und „dort steht eine Kerze".
    float core = 0.16 / (d * d + 0.012);
    float halo = 0.12 / (d * d * 2.2 + 0.26);
    // Harte Begrenzung des Ausläufers. Ohne sie reicht der Schein des Kerns
    // bis in jede Ecke und legt genau den Grauschleier über das Bild, den die
    // Vignette vorher mühsam wieder abziehen musste.
    float reach = smoothstep(1.25, 0.05, d);
    col += uGlow * (core * 0.3 + halo * 0.22) * reach;

    // Lichtbahnen aus der Quelle.
    vec2 dir = normalize(p - lightPos + 1e-4);
    float ang = atan(dir.y, dir.x);
    float rays = 0.5 + 0.5 * sin(ang * 14.0 + t * 0.25);
    rays *= 0.6 + 0.4 * sin(ang * 5.0 - t * 0.15);
    rays *= smoothstep(1.2, 0.05, d);
    col += uGlow * rays * 0.05;

    // Kühler Rand als Gegenspieler zum warmen Kern — die Tiefe im Bild.
    vec3 coolTint = vec3(0.3, 0.42, 0.66);
    float rim = smoothstep(0.5, 1.3, length(p));
    col += coolTint * rim * 0.055;

    // Funkenflug.
    float spark = warp(p * 9.0 + t * 0.1, t);
    spark = pow(smoothstep(0.84, 1.0, spark), 3.0);
    col += uGlow * spark * 0.9;

    // ── Die Vignette ───────────────────────────────────────────────────
    // Läuft bis fast auf Null aus. Vorher blieben außen 30 % stehen, und
    // genau deshalb hatte das Bild nirgends einen echten Schwarzwert.
    float vig = smoothstep(1.45, 0.2, length(p));
    col *= mix(0.03, 1.0, vig);

    // Korn.
    float grain = hash(uv * uResolution + t) - 0.5;
    col += grain * 0.02;

    // Filmische Kurve. Der kleinere Nenner hält die Lichter, das Gamma über
    // eins senkt die Mitten — zusammen ergibt das Zeichnung statt Schleier.
    col = col / (col + vec3(0.5));
    col = pow(col, vec3(1.08));

    // Sättigung zurückholen. Die Kurve oben komprimiert jeden Kanal für sich,
    // und weil der hellste Kanal am stärksten gestaucht wird, laufen helle
    // Flächen Richtung Grau. Genau das hat der Bar ihr Blau und der Küche ihr
    // Orange genommen. Hier kommt beides zurück, ohne die Kurve aufzugeben.
    float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = max(mix(vec3(lum), col, 1.5), vec3(0.0));

    gl_FragColor = vec4(col, 1.0);
  }
`

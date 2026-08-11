export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export function hexToHsl(hex: string): HSL {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: l * 100 };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
  }
  h *= 60;

  return { h, s: s * 100, l: l * 100 };
}

export function hslToHex(h: number, s: number, l: number): string {
  const hh = ((h % 360) + 360) % 360;
  const ss = Math.min(100, Math.max(0, s)) / 100;
  const ll = Math.min(100, Math.max(0, l)) / 100;

  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ll - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (hh < 60) [r, g, b] = [c, x, 0];
  else if (hh < 120) [r, g, b] = [x, c, 0];
  else if (hh < 180) [r, g, b] = [0, c, x];
  else if (hh < 240) [r, g, b] = [0, x, c];
  else if (hh < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Shortest-path hue interpolation (wraps around 360) so colors don't
 *  swing the "long way" round the color wheel between anchors. */
function lerpHue(h1: number, h2: number, t: number): number {
  let diff = h2 - h1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return h1 + diff * t;
}

function lerpHsl(a: HSL, b: HSL, t: number): HSL {
  return {
    h: lerpHue(a.h, b.h, t),
    s: a.s + (b.s - a.s) * t,
    l: a.l + (b.l - a.l) * t,
  };
}

/**
 * Given one accent color, derive a 5-stop gradient that reads like Apple's
 * keynote bars: a near-white tint of the hue, ramping through the accent
 * itself at the midpoint, out to a hue-shifted, slightly deeper end —
 * without the caller picking multiple colors.
 *
 * Interpolated in two legs (start→accent, accent→end) so the true accent
 * color always lands exactly at the 50% stop, with two intermediate
 * stops on either side for a richer, non-banded ramp.
 */
export function deriveGradientStops(color: string) {
  const accentHsl = hexToHsl(color);

  const startHsl: HSL = {
    h: accentHsl.h,
    s: Math.max(accentHsl.s * 0.12, 4),
    l: Math.min(accentHsl.l + 45, 97),
  };
  const endHsl: HSL = {
    h: (accentHsl.h + 22) % 360,
    s: Math.min(accentHsl.s + 8, 100),
    l: Math.max(accentHsl.l - 10, 8),
  };

  const stop1 = hslToHex(startHsl.h, startHsl.s, startHsl.l); // 0%
  const stop2Hsl = lerpHsl(startHsl, accentHsl, 0.5);
  const stop2 = hslToHex(stop2Hsl.h, stop2Hsl.s, stop2Hsl.l); // 25%
  const stop3 = color; // 50% — the true accent
  const stop4Hsl = lerpHsl(accentHsl, endHsl, 0.5);
  const stop4 = hslToHex(stop4Hsl.h, stop4Hsl.s, stop4Hsl.l); // 75%
  const stop5 = hslToHex(endHsl.h, endHsl.s, endHsl.l); // 100%

  return {
    stops: [stop1, stop2, stop3, stop4, stop5] as const,
    // kept for any callers still using the 3-value shape
    start: stop1,
    mid: stop3,
    end: stop5,
  };
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// --- add to color-utils.ts, alongside deriveGradientStops ---

export interface RichFill {
  /** Deepened, saturated base tone — the dominant fill color */
  base: string;
  /** Slightly deeper tone for a subtle top-to-bottom glossy falloff */
  baseDeep: string;
  /** Light tint used for the inset top highlight */
  highlight: string;
  /** Light tint used for the leading-edge radial bloom */
  glow: string;
}

/**
 * Given one accent color, derive a single rich, saturated fill plus a
 * lighter inner highlight and a soft leading-edge glow — for a glossy,
 * "premium red-card" look instead of a multi-stop rainbow gradient.
 */
export function deriveRichFill(color: string): RichFill {
  const { h, s, l } = hexToHsl(color);

  const base = hslToHex(h, Math.min(s + 10, 100), Math.max(Math.min(l, 52), 30));
  const baseDeep = hslToHex(h, Math.min(s + 14, 100), Math.max(l - 14, 14));
  const highlight = hslToHex(h, Math.max(s - 15, 0), Math.min(l + 38, 92));
  const glow = hslToHex(h, Math.max(s - 5, 0), Math.min(l + 25, 88));

  return { base, baseDeep, highlight, glow };
}
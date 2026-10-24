/**
 * Flight path mathematics and interpolation for Melli 3D Honeybee
 */

export interface FlightKeyframe {
  x: number;
  y: number;
  s: number;
  yaw: number;
  pitch: number;
  roll: number;
}

export const DESKTOP_KEYFRAMES: FlightKeyframe[] = [
  { x: -0.03, y: -0.12, s: 1.00, yaw: 150, pitch: 6,  roll: -4 },
  { x: -0.30, y: -0.04, s: 1.00, yaw: 125, pitch: 10, roll: 6 },
  { x:  0.22, y: -0.30, s: 1.00, yaw: 40,  pitch: -6, roll: -8 },
  { x: -0.22, y:  0.02, s: 0.96, yaw: 160, pitch: 8,  roll: 4 },
  { x:  0.02, y: -0.08, s: 0.92, yaw: 105, pitch: 4,  roll: 0 },
];

export const MOBILE_KEYFRAMES: FlightKeyframe[] = [
  { x:  0.05, y: -0.02, s: 0.75, yaw: 150, pitch: 6,  roll: -4 },
  { x:  0.10, y:  0.12, s: 0.80, yaw: 125, pitch: 10, roll: 6 },
  { x:  0.15, y: -0.20, s: 0.75, yaw: 40,  pitch: -6, roll: -8 },
  { x:  0.25, y:  0.20, s: 0.72, yaw: 160, pitch: 8,  roll: 4 },
  { x:  0.00, y:  0.10, s: 0.70, yaw: 105, pitch: 4,  roll: 0 },
];

export function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpAngle(a: number, b: number, t: number): number {
  const d = ((b - a + 540) % 360) - 180;
  return a + d * t;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

export function targetAt(
  pInput: number,
  isMobile: boolean = false
): {
  x: number;
  y: number;
  s: number;
  yaw: number;
  pitch: number;
  roll: number;
  moving: number;
} {
  const K = isMobile ? MOBILE_KEYFRAMES : DESKTOP_KEYFRAMES;
  let p = Number.isFinite(pInput) ? pInput : 0;
  p = clamp(p, 0, K.length - 1);

  const i = Math.min(K.length - 2, Math.floor(p));
  const f = p - i;

  const t = ease(clamp((f - 0.12) / 0.76, 0, 1));
  const dive = Math.sin(t * Math.PI) * -0.22;
  const moving = Math.sin(t * Math.PI);

  const k1 = K[i];
  const k2 = K[i + 1];

  const x = lerp(k1.x, k2.x, t);
  const y = lerp(k1.y, k2.y, t) + dive;
  const s = lerp(k1.s, k2.s, t) * (1 + Math.sin(t * Math.PI) * 0.12);
  const yaw = lerpAngle(k1.yaw, k2.yaw, t);
  const pitch = lerp(k1.pitch, k2.pitch, t);
  const roll = lerp(k1.roll, k2.roll, t);

  return { x, y, s, yaw, pitch, roll, moving };
}

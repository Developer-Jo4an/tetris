export function easeSineInOut(t, b, c) {
  return -(Math.cos(Math.PI * t) - 1) / 2 * (c - b) + b;
}

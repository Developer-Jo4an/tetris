import normalizeDegrees from "../math/normalizeDegrees";

/**
 * rgb: [r, g, b]
 r: [0, 1]
 g: [0, 1]
 b: [0, 1]
 returns hsv: [[0, 360], [0, 1], [0, 1]]
 */
export default function rgb2hsv(rgb) {
  const [R, G, B] = rgb;

  const cMax = Math.max(...rgb);
  const cMin = Math.min(...rgb);
  const delta = cMax - cMin;

  let H;
  const S = cMax === 0 ? 0 : delta / cMax;
  const V = cMax;

  if (delta === 0) {
    H = 0;
    return [H, S, V];
  }

  switch (cMax) {
    case R:
      H = ((G - B) / delta) % 6;
      break;
    case G:
      H = (B - R) / delta + 2;
      break;
    case B:
      H = (R - G) / delta + 4;
      break;
  }

  const normalizedHue = normalizeDegrees(H * 60);

  return [normalizedHue, S, V]
}

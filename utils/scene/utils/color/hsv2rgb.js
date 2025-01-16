/**
 * hsv: [h, s, v]
 h: [0, 360],
 s: [0, 1],
 v: [0, 1],
 returns rgb, each color [0, 1]
 */
export default function hsv2rgb(hsv) {
  const [H, S, V] = hsv;

  const c = V * S;
  const x = c * (1 - Math.abs((H / 60) % 2 - 1));
  const m = V - c;

  let rgb;

  switch (true) {
    case H >= 0 && H < 60:
      rgb = [c, x, 0];
      break;
    case H >= 60 && H < 120:
      rgb = [x, c, 0];
      break;
    case H >= 120 && H < 180:
      rgb = [0, c, x];
      break;
    case H >= 180 && H < 240:
      rgb = [0, x, c];
      break;
    case H >= 240 && H < 300:
      rgb = [x, 0, c];
      break;
    case H >= 300 && H < 360:
      rgb = [c, 0, x];
      break;
  }

  return rgb.map(color => color + m);
}

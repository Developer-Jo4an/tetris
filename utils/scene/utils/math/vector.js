export function normalize(point) {
  const magnitude = Math.sqrt((point.x * point.x) + (point.y * point.y));
  point.x = point.x / magnitude;
  point.y = point.y / magnitude;

  return point;
}

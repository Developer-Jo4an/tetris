export function rotateBody(p2Body, basePosition, offset) {
  const {angle} = p2Body;
  const cos = Math.cos(angle),
    sin = Math.sin(angle),
    dx = -offset.x,
    dy = -offset.y;

  p2Body.position = [
    basePosition.x + offset.x + (dx * cos - dy * sin),
    basePosition.y + offset.y + (dx * sin + dy * cos)
  ];
}

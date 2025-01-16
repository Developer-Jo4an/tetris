export function getEventPosition(e) {
  return {
    x: e.pageX ?? e.touches?.[0]?.clientX ?? 0,
    y: e.pageY ?? e.touches?.[0]?.clientY ?? 0,
  };
}

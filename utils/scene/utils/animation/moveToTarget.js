export function moveToTarget(current, target, min, delta) {
  if(Math.abs(target- current) < min)
    return target;
  else
    return current + (target - current) * delta;
}

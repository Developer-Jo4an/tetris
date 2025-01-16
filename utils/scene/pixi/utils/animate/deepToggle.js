function deep(target, mcFunc, iterateFunc) {
  const {MovieClip} = global.PIXI.animate;
  if (target instanceof MovieClip && target.mode === MovieClip.INDEPENDENT) {
    target[mcFunc]();
  }
  if (target?.children) {
    target.children.forEach(iterateFunc);
  }
}

export function deepPlay(target) {
  deep(target, "play", deepPlay);
}

export function deepStop(target) {
  deep(target, "stop", deepStop);
}

export function setFramerate(container, framerate) {
  if (container instanceof PIXI.animate.MovieClip) {
    container.framerate = framerate;
  }
  if (container.children && container.children.length > 0) {
    for (let i = 0; i < container.children.length; i++) {
      setFramerate(container.children[i], framerate);
    }
  }
}

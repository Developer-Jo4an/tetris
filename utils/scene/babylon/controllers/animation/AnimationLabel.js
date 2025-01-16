export default class AnimationLabel {

  start;

  end;

  startProgress;

  endProgress;

  constructor(name, {start, end, totalFrames, fps} = {}) {
    this.name = name;

    this.start = start;
    this.end = end;
    this.startProgress = start / totalFrames;
    this.endProgress = end / totalFrames;

    this.duration = (end - start) * (1 / fps);
  }
}

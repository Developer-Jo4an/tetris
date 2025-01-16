import {v4 as uuidv4} from "uuid";
import AnimationLabel from "./AnimationLabel";

export default class Animation {

  _progress = 0;

  _label;

  constructor({group, duration, name, fps = 60, labels = {}}) {

    this.name = name ?? group.id;
    this.group = group;
    this.fps = fps;

    const totalFrames = this.totalFrames = this.firstAnimation._maxFrame;

    const animationDuration = this.duration = totalFrames * duration;

    this.labels = Object.entries(labels).map(([name, labelData]) => new AnimationLabel(name, {
      ...labelData,
      totalFrames,
      fps,
      animationDuration
    }));

    group.pause();
  }

  static addLabelAnimation(animation, from, to, duration, label, timeline, position) {

    const uuid = uuidv4();

    if (animation.gsapLabelProgress === undefined) {
      animation._gsapLabelProgress = 0;
      animation._callbacks = {};

      Object.defineProperty(animation, 'gsapLabelProgress', {
        get: function () {
          return this._gsapLabelProgress;
        },
        set: function (progress) {
          this._gsapLabelProgress = progress;
          animation._callbacks[animation.currentUUID]?.call(null);
        }
      });
    }

    return (timeline ?? gsap)
      .fromTo(
        animation,
        {
          gsapLabelProgress: from
        },
        {
          duration,
          ease: "none",
          onUpdate() {
            animation.currentUUID = uuid;
            animation.label = label;
            animation.labelProgress = animation.gsapLabelProgress;
          },
          onReverseComplete() {
            animation.currentUUID = uuid;
          },
          onStart() {
            animation.currentUUID = uuid;
          },
          gsapLabelProgress: to
        },
        position
      );
  }

  playLabel(name, onComplete) {
    const {start, end, duration} = this.getLabelByName(name)

    gsap.fromTo(this, {
      currentFrame: start
    }, {
      currentFrame: end,
      ease: "none",
      duration,
      onComplete
    })
  }

  set labelProgress(progress) {
    this._labelProgress = progress;

    if (!this.label) return;
    const {startProgress, endProgress} = this.getLabelByName(this.label);
    this.progress = startProgress + (endProgress - startProgress) * this.labelProgress;
  }

  get labelProgress() {
    return this._labelProgress;
  }

  set label(label) {
    this._label = label;
  }

  get label() {
    return this._label;
  }

  set progress(progress) {
    this._progress = progress;
    this.currentFrame = this.progress * this.totalFrames;
  }

  get progress() {
    return this._progress;
  }

  getLabelByName(name) {
    return this.labels.find(({name: labelName}) => name === labelName);
  }

  get firstAnimation() {
    return this.group.targetedAnimations[0].animation.runtimeAnimations[0];
  }

  set currentFrame(frame) {
    this.group.goToFrame(frame);
  }

  get currentFrame() {
    return this.firstAnimation.currentFrame
  }

}

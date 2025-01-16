import AnimationLabel from "./AnimationLabel";
import {v4 as uuidv4} from 'uuid';

const {THREE} = global;

export default class Animation {

  static EVENTS = {
    RESET_SAME: "animation:reset-same",
  }

  static END_OFFSET = 0.01;

  _labelProgress = 0;

  clipActions = [];

  constructor({model, duration, target, fps, name, customClip = false, labels = {}, eventBus}) {

    if (!model) return;
    this.target = target;
    this.fps = fps ?? 60;
    this.mixer = new THREE.AnimationMixer(model);
    this.animationDuration = 0;
    this.name = name;

    if (customClip) {
      const animation = model.animations.find(({name}) => name === this.name);
      this.animationDuration = Math.max(this.animationDuration, animation.duration);
      this.createAction(animation);
    } else
      model.animations.forEach((animation) => {
        this.animationDuration = Math.max(this.animationDuration, animation.duration);
        this.createAction(animation);
      });

    const totalFrames = this.animationDuration * 60;

    this.labels = Object.entries(labels).map(([name, labelData]) => new AnimationLabel(name, {
      ...labelData,
      totalFrames,
      fps: this.fps,
      animationDuration: this.animationDuration
    }));

    this.duration = duration ?? this.animationDuration;
    this._progress = 0;
    this.eventBus = eventBus;

    if (!eventBus)
      console.log(`eventBus is not found: Animation reset may not work correctly`);
    this.eventBus?.addEventListener(Animation.EVENTS.RESET_SAME, this._checkSameReset.bind(this));
  }

  _checkSameReset({data: {target, hash}}) {
    if (hash && this.hash === hash) return;
    if (target !== this.target) return;

    this.clipActions.forEach(action => {
      action.reset();
      action.stop();
    });
    this._progress = 0;
  }

  createAction(animationClip) {
    const action = this.mixer.clipAction(animationClip);
    action.play();
    this.clipActions.push(action);
  }

  getLabelDuration(name) {
    return this.getLabelByName(name ?? this.label)?.duration;
  }

  stop() {
    gsap.killTweensOf(this);
    this.clipActions.forEach(action => {
      action.stop();
      action.reset();
    });
    this._progress = 0;
  }

  play(params = {}) {
    this.progress = 0;
    return gsap.to(this, {
      progress: 1,
      ease: "none",
      duration: this.duration * (1 - this._progress),
      onComplete: this.destroy,
      ...params
    });
  }

  beforePlay(params, hash) {
    this.eventBus?.dispatchEvent({type: Animation.EVENTS.RESET_SAME, data: {target: this.target, hash}});

    this.clipActions.forEach(action => {
      action.reset();
      if (!this.mixer._isActiveAction(action))
        action.play();
    })

    this._progress = 0;
  }

  playWithReset() {
    this.beforePlay(...arguments);
    this.play(...arguments);
  }

  set label(label) {
    this._label = label;
  }

  get label() {
    return this._label;
  }

  destroy = () => {

  };

  set labelProgress(progress) {
    this._labelProgress = progress;
    if (!this.label) return;
    const {startProgress, endProgress} = this.getLabelByName(this.label);
    this.progress = startProgress + (endProgress - startProgress) * this.labelProgress;
  }

  get labelProgress() {
    return this._labelProgress;
  }

  set progress(progress) {
    this._progress = progress;
    const duration = Math.max(0, this.animationDuration - Animation.END_OFFSET);

    this.mixer.setTime(duration * this.progress);
  }

  get progress() {
    return this._progress;
  }

  getLabelByName(name) {
    return this.labels.find(({name: labelName}) => name === labelName);
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
}

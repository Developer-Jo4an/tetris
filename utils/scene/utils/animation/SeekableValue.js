export default class SeekableValue {

  current = 0;

  _target = 0;

  _progress = 0;

  constructor({
                current = 0, target = 0, onSave,
                duration = 1, ease = "linear"
              } = {}) {
    this.current = current;
    this.target = target;
    this.onSave = onSave;
    this.ease = ease;
    this.duration = duration;
  }

  set target(target) {
    this._from = this.current;
    this._target = target;
    this._progress = 0;
  }

  get target() {
    return this._target;
  }


  update(deltaTime) {
    const {
      onSave
    } = this;

    const deltaProgress = deltaTime / this.duration;
    this._progress = Math.max(0, Math.min(this._progress + deltaProgress, 1));

    this.current = this.getCurrentValue();

    if (onSave)
      onSave(this.current);

    return this;
  }

  easeOutCubic() {
    return 1 - Math.pow(1 - this._progress, 3);
  }

  easeOutSine() {
    return Math.sin((this._progress * Math.PI) / 2);
  }

  linear() {
    return this._progress;
  }

  getCurrentValue() {
    return this._from + (this.target - this._from) * this[this.ease]();
  }
}

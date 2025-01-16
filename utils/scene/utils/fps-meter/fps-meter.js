import {visibilityParameters} from "./visibilityParameters";

export default class FPSMeter {

  static listeners = [];

  static listen(callback) {
    FPSMeter.listeners.push(callback);
  };

  constructor({maxTicks = 60 * 3, minCheckedSum = 2000, skipFirst = true, baseDelay = 2000, targetFPS = 38, delay = 2000} = {}) {
    this.maxTicks = maxTicks;
    this.minCheckedSum = minCheckedSum;
    this.targetFPS = targetFPS;
    this.delayTime = 0;
    this.delay = delay;
    this.baseDelay = baseDelay;
    this._isSkipFirst = skipFirst;
    this.ticks = [];
    this.graphicsDecrease = 0;

    this.visibilityData = visibilityParameters();
    document.addEventListener(this.visibilityData.visibilityChange, this.handleVisibilityChange, false);
  }

  handleVisibilityChange = () => {
    this.hidden = document[this.visibilityData.hidden];
    this.ticks.length = 0;
    this.lastTime = performance.now();
  };

  set graphicsDecrease(graphicsDecrease) {
    graphicsDecrease = Math.max(graphicsDecrease, 0);

    if (this.graphicsDecrease === graphicsDecrease) return;

    this._graphicsDecrease = graphicsDecrease;

    FPSMeter.listeners.forEach(fn => {
      if (typeof fn === "function")
        fn(this.graphicsDecrease);
    });
  }

  get graphicsDecrease() {
    return this._graphicsDecrease;
  }

  start() {
    if (this.started) return;
    this.started = true;
    if (this._isSkipFirst)
      this._skipFirst = true;
    this.lastTime = performance.now();
    if (this.baseDelay)
      this.delayTime = this;
    requestAnimationFrame(this.update);
  }

  stop() {
    this.started = false;
  }

  update = () => {
    if (!this.started || this.hidden) return;

    const {ticks, maxTicks, delayTime, targetFPS, delay, minCheckedSum} = this;
    const now = performance.now();
    const delta = now - this.lastTime;

    this.lastTime = now;

    this.delayTime = Math.max(0, delayTime - delta);

    if (this.delayTime)
      return requestAnimationFrame(this.update);

    ticks.push(delta);
    if (ticks.length > maxTicks)
      ticks.splice(0, 1);

    const sum = ticks.reduce((reducer, time) => reducer + time);
    if ((sum > minCheckedSum || ticks.length === maxTicks) && !this.delayTime) {
      const middle = ticks.reduce((reducer, time) => reducer + time) / ticks.length;
      const fps = 1000 / middle;

      if (this._skipFirst) {
        ticks.length = 0;
        this._skipFirst = false;
      } else if (fps < targetFPS) {

        this.delayTime = delay;
        ticks.length = 0;
        this.graphicsDecrease++;
      }
    }
    requestAnimationFrame(this.update);
  };
}

const fpsMeter = new FPSMeter();

export {fpsMeter};

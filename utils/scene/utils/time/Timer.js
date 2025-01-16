export default class Timer {

  constructor({total, name, onComplete, onUpdate, callBackContext = null}) {
    this.name = name;
    this.total = total;
    this.callBackContext = callBackContext;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
  }

  start() {
    this.isStarted = true;
    this.current = this.total;
  }

  reset() {
    this.isStarted = false;
    this.current = 0;
  }

  update(delta) {
    if (!this.isStarted) return;
    this.current = Math.max(0, this.current - delta);
    if (!this.current) {
      this?.onComplete?.call(this.callBackContext);
      this.isStarted = false;
    } else
      this?.onUpdate?.call(this.callBackContext);
  }
}

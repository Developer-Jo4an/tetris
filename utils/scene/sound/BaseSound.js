export default class BaseSound {

  constructor({loop, volume}) {
  }

  get paused(){
    return false;
  }

  set loop(loop) {
    this._loop = loop;
  }

  get loop() {
    return this._loop;
  }

  set volume(volume) {
    this._volume = volume;
  }

  get volume() {
    return this._volume;
  }

  set rate(rate) {
    this._rate = rate;
  }

  get rate() {
    return this._rate;
  }
}

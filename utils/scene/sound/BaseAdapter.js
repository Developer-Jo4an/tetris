export default class BaseAdapter {

  constructor() {
    this._lockedMod = 0;
    this._volumeAll = 1;
    this._baseVolume = 1;
    this._locked = true;
    this.waitForUnlock().then(() => this.locked = false);
  }

  get isLocked() {
    return true;
  }

  waitForUnlock() {
    const checkInterval = 250; // ms
    return new Promise(resolve => {
      if (this.checkUnlocked())
        resolve();
      else
        this.waitInterval = setInterval(() => this.checkUnlocked(resolve), checkInterval);
    });
  }

  checkUnlocked(resolve) {
    if (!this.isLocked) {
      if (resolve)
        resolve();
      clearInterval(this.waitInterval);
      return true;
    }
    return false;
  }

  set locked(locked) {
    if (this.lockedMod === locked) return;
    this._locked = locked;

    if (!locked)
      this.onUnlocked();
  }

  onUnlocked() {

  }

  get locked() {
    return this._locked;
  }

  set lockedMod(lockedMod) {
    this._lockedMod = lockedMod;

    this.volumeAll = this.volumeAll;
  }

  get lockedMod() {
    return this._lockedMod;
  }


  set baseVolume(volumeAll) {
    this._baseVolume = volumeAll;

    this.volumeAll = this.volumeAll;
  }

  get baseVolume() {
    return this._baseVolume;
  }

  set volumeAll(volumeAll) {
    this._volumeAll = volumeAll;
  }

  get volumeAll() {
    return this._volumeAll;
  }
}

import {Howl, Howler} from 'howler';
import HowlerSound from "./HowlerSound";
import BaseAdapter from "./BaseAdapter";
import {to} from "./SimpleTween";

export default class HowlerAdapter extends BaseAdapter {

  skipDispatch = false;

  callbacks = [];

  constructor(data) {
    super(data);
  }

  load(name, path, data, success, fail) {
    return new Howl({
      ...data,
      src: path,
      onloaderror: fail,
      onload: () => requestAnimationFrame(() => {
        success();
      })
    });
  }

  play(name, {loop = false, volume = 1} = {}, items) {
    const howl = items[name].sound;
    this.items = items;
    try {
      const soundID = howl.play();
      return new HowlerSound({soundID, name, howl, loop, volume});
    } catch (e) {
      console.log(`HowlerAdapter play ${name}`, e);
    }
  }


  onUnlocked() {
    to(this, {lockedMod: 1}, 3)
  }

  get isLocked() {
    return Howler.state === "suspended";
  }

  stop(name, id) {
    const howl = this.items[name].sound;
    howl.stop(id);
  }

  set volumeAll(volumeAll) {
    if (this._prevVolume === this.baseVolume * this.lockedMod) return;
    const {callbacks} = this;
    super.volumeAll = volumeAll;
    this._prevVolume = this.baseVolume * this.lockedMod;

    Howler.volume(this._prevVolume);
    if (!this.skipDispatch)
      callbacks.forEach(callback => callback());
    this.skipDispatch = false;
  }

  get volumeAll() {
    return this.baseVolume * this.lockedMod;
  }

  addCallback(callback) {
    if (typeof callback !== "function") return;
    if (!this.callbacks) this.callbacks = [];
    this.callbacks.push(callback);
  }

  deleteCallback(func) {
    const {callbacks} = this;
    const index = callbacks.indexOf(func);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }


}

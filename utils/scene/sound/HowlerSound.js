import {Howl, Howler} from 'howler';
import BaseSound from "./BaseSound";


export default class HowlerSound extends BaseSound {

  constructor({soundID, name, loop, howl, volume}) {
    super({loop, volume});

    this.name = name;
    this.howl = howl;
    this.soundID = soundID;

    this.loop = loop;
    this.volume = volume;
  }

  get paused() {
    return !this.howl._sounds.find(({_paused}) => !_paused);
  }

  set rate(rate) {
    super.rate = rate;
    try {
      this.howl.rate(this.rate, this.soundID);
    } catch (e) {
      console.log(`HowlerSound rate ${this.name}`, e);
    }
  }


  get rate() {
    return super.rate;
  }

  set loop(loop) {
    super.loop = loop;

    try {
      this.howl.loop(this.loop, this.soundID);
    } catch (e) {
      console.log(`HowlerSound loop ${this.name}`, e);
    }
  }

  get loop() {
    return super.loop;
  }

  set volume(volume) {
    super.volume = volume;

    try {
      this.howl.volume(this.volume, this.soundID);
    } catch (e) {
      console.log(`HowlerSound volume ${this.name}`, e);
    }
  }

  get volume() {
    return this._volume;
  }
}

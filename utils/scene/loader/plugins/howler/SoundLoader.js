import BaseLoader from "../BaseLoader";
import {soundManager} from "../../../sound/SoundManager";

/**
 *  {
 *     "subtype": "howler",
 *     "type": "sound",
 *     "name": "some_name", - name for getting from AssetsManager
 *     "path": "sounds/", - path to asset's folder
 *     "fileName": "sound.mp3" - asset's file name
 *   }
 */
export default class SoundLoader extends BaseLoader {

  static sysName = "HowlerSoundLoader";

  load(settings) {
    const {path, fileName, name} = settings;

    const key = super.load(`${path}${fileName}`);

    const resultPath = this.manager.resolveURL(`${path}${fileName}`);

    soundManager.load({name, path: resultPath});
    soundManager.items[name].promise.then(
      () => this.onLoad(settings, soundManager.items[name], key),
      (e) => this.onError(key, ...arguments));
  }
}

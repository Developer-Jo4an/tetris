import Manager from "./managers/Manager";
import {baseManager} from "./plugins/base/BaseManager";

export default class Loader {

  static _manager = {
    base: baseManager
  };

  static registerManager(manager, key = manager.name) {
    this._manager[key] = manager;
  }

  static load(manifest, {onLoad, onProgress, externalData} = {}) {
    const manager = new Manager({onLoad, onProgress});

    if (!manifest.length) return Promise.resolve();

    manifest.forEach(assetData => {
      const Loader = this.getLoaderCls(assetData);

      let loader = manager.getLoader(Loader);

      if (!Loader) return;

      if (!loader) {
        loader = new Loader(manager, externalData);
        manager.addLoader(Loader, loader);
      }
      loader.load(assetData);
    });

    return manager.promise;
  }

  static getLoaderCls(data) {
    const manager = Loader._manager[data.subtype];

    if (manager)
      return manager.getLoader(data);
  }
}

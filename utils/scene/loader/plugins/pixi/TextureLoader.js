import BaseLoader from "../BaseLoader";

/**
 *   {
 *     "subtype": "pixijs",
 *     "type": "texture",
 *     "name": "texture", - name for getting from AssetsManager
 *     "path": "assets/textures/", - path to asset's folder
 *     "fileName": "texture.png" - asset's file name
 *   }
 */
export default class TextureLoader extends BaseLoader {

  static sysName = "PixiTextureLoader";

  load(settings) {
    const {path, fileName} = settings;
    const loader = new PIXI.Loader();
    const url = this.manager.resolveURL(`${path}${fileName}`);
    const key = super.load(url);

    loader.onError.add(() => this.onError(key, ...arguments));
    loader.add(settings.name, url);
    loader.load((loader, resources) => this.onLoad(settings, resources[settings.name].texture, key));
  }
}

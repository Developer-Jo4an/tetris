import BaseLoader from "../BaseLoader";

/**
 *   {
 *     "subtype": "threejs",
 *     "type": "texture",
 *     "name": "texture", - name for getting from AssetsManager
 *     "path": "assets/textures/", - path to asset's folder
 *     "fileName": "texture.png" - asset's file name
 *   }
 */
export default class TextureLoader extends BaseLoader {

  static sysName = "ThreeTextureLoader";

  load(settings) {
    const {path, fileName} = settings;

    const key = super.load(`${path}${fileName}`);
    new THREE.TextureLoader(this.manager).load(`${path}${fileName}`, (texture) => {
      this.onLoad(settings, texture, key);
    }, () => {
    }, () => this.onError(key, ...arguments));
  }
}

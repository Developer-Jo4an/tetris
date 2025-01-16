import BaseLoader from "../BaseLoader";


export default class TextureLoader extends BaseLoader {

  static sysName = "BabylonTextureLoader"

  load(settings) {
    const {path, fileName} = settings;
    const url = this.manager.resolveURL(`${path}${fileName}`);

    super.load(url);

    const texture = new BABYLON.Texture(url, this.data.scene);

    texture.onLoadObservable.addOnce(() => {
      this.onLoad(settings, texture)
    })
  }
}

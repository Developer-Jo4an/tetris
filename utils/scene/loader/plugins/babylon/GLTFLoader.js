import BaseLoader from "../BaseLoader";


export default class GLTFLoader extends BaseLoader {

  static sysName = "BabylonGLTFLoader"

  load(settings) {
    const {path, fileName} = settings;
    const url = this.manager.resolveURL(path);

    super.load(`${url}${fileName}`);

    this.loadMesh(url, fileName).then(scene => this.onLoad(settings, scene));
  }

  loadMesh(url, fileName) {
    return new Promise(resolve =>
      BABYLON.SceneLoader.ImportMesh("", url, fileName, undefined,
        resolve,
      )
    )
  }
}

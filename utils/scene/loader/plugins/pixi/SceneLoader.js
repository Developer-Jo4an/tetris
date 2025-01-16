import BaseLoader from "../BaseLoader";

/**
 *   {
 *     "subtype": "pixijs",
 *     "type": "scene",
 *     "name": "some_scene", - name for getting from AssetsManager
 *     "sceneName": "some_scene",
 *     "path": "assets/scenes/" - path to asset's folder
 *   }
 */
export default class SceneLoader extends BaseLoader {

  static sysName = "PixiSceneLoader";

  load(settings) {
    const {path, sceneName} = settings;
    const pathName = `${path}${sceneName}`;

    const key = super.load(pathName);

    this.loadScript(settings)
      .then((data) => this.loadScene(settings, data))
      .then(
        data => this.onLoad(settings, data, key),
        (error) => this.onError(key, ...arguments)
      );
  }

  loadScene({path}, animationData) {
    const loader = new PIXI.Loader();
    loader.baseUrl = this.manager.resolveURL(path, true);

    return new Promise((resolve, reject) => {
      PIXI.animate.load(animationData, {
        loader,
        complete:()=> {
          const jsons = this.countAssetsByExtension(animationData.assets, ["json"])
          if (jsons.length !== animationData.spritesheets.length)
            return reject();

          const images = this.countAssetsByExtension(animationData.assets, ["png", "jpg", "jpeg"]);
          if (images.length !== Object.keys(animationData.textures).length)
            return reject();

          const txt = this.countAssetsByExtension(animationData.assets, ["txt"]);
          if (txt.length !== Object.keys(animationData.shapes).length)
            return reject();

          animationData.setup(PIXI.animate);
          resolve(animationData);
        }
      });
    });
  }

  countAssetsByExtension(assets, extensions) {
    return Object.values(assets).filter(path =>
      extensions.some(ext => path.toLowerCase().includes(ext))
    );
  }

  /**
   * !! В Adobe Animate в "параметры публикации" нужно выбирать "CommonJS"
   */
  loadScript({path, sceneName}) {
    const scriptPath = this.manager.resolveURL(`${path}${sceneName}.js`);

    return new Promise((resolve, reject) => {
      var client = new XMLHttpRequest();
      client.open("GET", scriptPath);
      client.onload = resolve;
      client.onerror = reject;
      client.send();

    }).then(({target: {response}}) => {
      window.data = {exports: null};
      const script = `(function (module){${response}})(window.data)`;
      eval(script);
      return window.data.exports;
    });
  }
}

import BaseLoader from "../BaseLoader";

/**
 *   {
 *     "subtype": "base",
 *     "type": "svg",
 *     "name": "someName", - name for getting from AssetsManager
 *     "path": "assets/tree/svg/", - path to asset's folder
 *     "fileName": "block_tree_head.svg" - asset's file name
 *   }
 */
export default class SVGLoader extends BaseLoader {

  load(settings) {
    const {path, fileName} = settings;
    const url = `${path}${fileName}`;
    const key = super.load(url);
    this.loadSvg(url).then(
      xhr => this.onLoad(settings, xhr.responseXML.documentElement, key),
      (error) => this.onError(key, ...arguments),
    );
  }

  loadSvg(url) {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", this.manager.resolveURL(url), false);
      xhr.overrideMimeType("image/svg+xml");
      xhr.onload = () => resolve(xhr);
      xhr.send("");
    });
  }
}

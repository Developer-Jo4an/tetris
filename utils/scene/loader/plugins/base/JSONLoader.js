import BaseLoader from "../BaseLoader";
import {loadJSON} from "../../../utils/load-json";

/**
 * {
 *       subtype: "base",
 *       type: "json",
 *       name: "someName", - name for getting from AssetsManager
 *       url: "/data/data.json"
 * }
 */
export default class JSONLoader extends BaseLoader {


  load(settings) {
    const url = this.manager.resolveURL(settings.url);
    const key = super.load(url);

    return loadJSON(url).then(
      (data) => this.onLoad(settings, data, key),
      (error) => this.onError(key, ...arguments),
    );
  }
}

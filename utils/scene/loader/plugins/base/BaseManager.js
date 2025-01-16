import {LoadersManager} from "../LoadersManager";
import JSONLoader from "./JSONLoader";
import SVGLoader from "./SVGLoader";
import VideoLoader from "./VideoLoader";

export class BaseManager extends LoadersManager {

  getLoader({type}) {
    switch (type) {
      case "json":
        return JSONLoader;
      case "svg":
        return SVGLoader;
      case "video":
        return VideoLoader;
    }
  }
}

export const baseManager = new BaseManager();

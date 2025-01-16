import {LoadersManager} from "../LoadersManager";
import TextureLoader from "./TextureLoader";
import SceneLoader from "./SceneLoader";

export class PixiManager extends LoadersManager {

  getLoader(assetData) {
    switch (assetData.type) {
      case "texture":
        return TextureLoader;
      case "scene":
        return SceneLoader;
    }
  }
}

export const pixiManager = new PixiManager();

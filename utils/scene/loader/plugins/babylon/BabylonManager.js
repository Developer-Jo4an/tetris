import {LoadersManager} from "../LoadersManager";
import GLTFLoader from "./GLTFLoader";
import TextureLoader from "./TextureLoader";

export class BabylonManager extends LoadersManager {

  getLoader(assetData) {

    switch (assetData.type) {
      case "gltf":
        return GLTFLoader;
      case "texture":
        return TextureLoader;
    }
  }
}

export const babylonManager = new BabylonManager();

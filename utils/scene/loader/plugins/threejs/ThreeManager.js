import {LoadersManager} from "../LoadersManager";
import GLTFLoader from "./GLTFLoader";
import TextureLoader from "./TextureLoader";
import {postprocessingList} from "../postprocessing/list";
import ThreeParser from "../postprocessing/ThreeParser";

postprocessingList.push(ThreeParser);

export class ThreeManager extends LoadersManager {

  getLoader(assetData) {
    switch (assetData.type) {
      case "gltf":
        return GLTFLoader;
      case "texture":
        return TextureLoader;
    }
  }
}

export const threeManager = new ThreeManager();

import {LoadersManager} from "../LoadersManager";
import SoundLoader from "./SoundLoader";

export class HowlerManager extends LoadersManager {

  getLoader(assetData) {
    switch (assetData.type) {
      case "sound":
        return SoundLoader;
    }
  }
}

export const howlerManager = new HowlerManager();

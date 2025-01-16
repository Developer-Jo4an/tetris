import State from "../../decorators/state/State";
import BabylonResize from "../../decorators/resize/BabylonResize";
import BaseWrapper from "../BaseWrapper";
import BabylonController from "../../containers/BabylonController";

export default class BabylonWrapper extends BaseWrapper {

  decorators = [State, BabylonResize];

  initController() {
    const {eventBus, storage} = this;

    return new BabylonController({eventBus, storage});
  }
}

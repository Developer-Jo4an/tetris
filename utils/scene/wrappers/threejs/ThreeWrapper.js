import BaseWrapper from "../BaseWrapper";
import State from "../../decorators/state/State";
import ThreeResize from "../../decorators/resize/ThreeResize";
import ThreeController from "../../containers/ThreeController";

export default class ThreeWrapper extends BaseWrapper {

  decorators = [State, ThreeResize];

  initController() {
    const {eventBus, storage} = this;

    return new ThreeController({eventBus, storage});
  }
}

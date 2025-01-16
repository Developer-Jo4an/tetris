import BaseWrapper from "../BaseWrapper";
import State from "../../decorators/state/State";
import CanvasResize from "../../decorators/resize/CanvasResize";
import PixiController from "../../containers/PixiController";

export default class PixiWrapper extends BaseWrapper {

  decorators = [State, CanvasResize];

  initController() {
    const {eventBus, storage} = this;

    return new PixiController({eventBus, storage});
  }
}

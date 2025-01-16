import BaseWrapper from "../../utils/scene/wrappers/BaseWrapper";
import CanvasResize from "../../utils/scene/decorators/resize/CanvasResize";
import PixiController from "../../utils/scene/containers/PixiController";
import TetrisState from "../../controllers/tetris/decorators/TetrisState";

export class TetrisPixiWrapper extends BaseWrapper {
  decorators = [TetrisState, CanvasResize];

  initController() {
    const {eventBus, storage} = this;

    return new PixiController({eventBus, storage});
  }
}

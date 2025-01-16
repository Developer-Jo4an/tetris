import Data from "./Data";
import PixiWrapper from "../../utils/scene/wrappers/pixi/PixiWrapper";
import TetrisController from "./TetrisController";

export default class TetrisWrapper extends PixiWrapper {
  storage = new Data();

  static get instance() {
    if (!this._instance)
      this._instance = new TetrisWrapper();

    return this._instance;
  }

  static _instance = null;

  setLevel(level) {
    this.controller.setLevel(level);
  }

  initController() {
    const {eventBus, storage} = this;
    return new TetrisController({eventBus, storage, applicationSettings: {backgroundColor: 0xff0000}});
  }
}
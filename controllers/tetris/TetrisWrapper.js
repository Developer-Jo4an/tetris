import Data from "./Data";
import TetrisController from "./TetrisController";
import {TetrisPixiWrapper} from "./TetrisPixiWrapper";

export default class TetrisWrapper extends TetrisPixiWrapper {
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

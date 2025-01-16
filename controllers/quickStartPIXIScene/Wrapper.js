import Data from "./Data";
import PixiWrapper from "../../utils/scene/wrappers/pixi/PixiWrapper";
import Controller from "./Controller";

export default class Wrapper extends PixiWrapper {

  storage = new Data();

  static get instance() {
    if (!this._instance) this._instance = new Wrapper();

    return this._instance;
  }

  static _instance = null;

  initController() {
    const {eventBus, storage} = this;

    return new Controller({eventBus, storage});
  }
}

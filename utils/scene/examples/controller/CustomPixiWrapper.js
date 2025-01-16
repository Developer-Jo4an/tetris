import PixiWrapper from "../../wrappers/pixi/PixiWrapper";
import Data from "../data/Data";

export default class CustomPixiWrapper extends PixiWrapper {

  storage = new Data();

  static get instance() {
    if (!this._instance) this._instance = new CustomPixiWrapper();

    return this._instance;
  }

  static _instance = null;

}

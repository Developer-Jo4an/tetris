import CanvasResize from "./CanvasResize";

export default class BabylonResize extends CanvasResize {


  resizeCanvas(canvas, width, height) {
    this.controller.engine.resize();

    return super.resizeCanvas(canvas, width, height)
  }
}

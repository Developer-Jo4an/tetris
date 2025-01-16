import Resize from "./Resize";

export default class CanvasResize extends Resize {


  constructor(wrapper) {
    super();
    this.onAppend = this.onAppend.bind(this);

    const {controller, eventBus} = wrapper;

    this.controller = controller;

    eventBus.addEventListener("scene-controller:append", this.onAppend)
  }

  resize() {
    const {controller, controller: {canvas}} = this;

    if (canvas) {
      const {parentNode} = canvas;

      if (parentNode) {
        const {clientWidth: width, clientHeight: height} = parentNode;
        this.resizeCanvas(canvas, width, height);

        controller.onResize?.({width, height});
      }
    }

    return super.resize();
  }

  resizeCanvas(canvas, width, height) {
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  onAppend() {
    this.resize();
  }
}

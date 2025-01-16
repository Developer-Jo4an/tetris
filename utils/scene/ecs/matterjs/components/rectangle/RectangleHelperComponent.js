import BodyHelperComponent from "../BodyHelperComponent";

export default class RectangleHelperComponent extends BodyHelperComponent {

  type = "matter-rectangle-helper"

  initGraphics() {
    const {settings: {width, height}} = this;
    const graphics = super.initGraphics();
    graphics.drawRect(-width / 2, -height / 2, width, height);

    this.pixiObject = graphics;
  }
}

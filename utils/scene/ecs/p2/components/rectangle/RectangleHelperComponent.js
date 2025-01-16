import BodyHelperComponent from "../BodyHelperComponent";

export default class RectangleHelperComponent extends BodyHelperComponent {

  type = "p2-rectangle-helper"

  initGraphics() {
    const {settings: {width, height, angle}} = this;
    const graphics = super.initGraphics();
    graphics.drawRect(-width / 2, -height / 2, width, height);

    this.pixiObject = graphics;


    if (angle)
      graphics.rotation = angle;
  }
}

import BodyHelperComponent from "../BodyHelperComponent";

export default class CircleHelperComponent extends BodyHelperComponent {

  type = "matter-circle-helper"

  initGraphics() {
    const {settings: {radius}} = this;
    const graphics = super.initGraphics();
    graphics.drawCircle(0, 0, radius);

    this.pixiObject = graphics;
  }
}

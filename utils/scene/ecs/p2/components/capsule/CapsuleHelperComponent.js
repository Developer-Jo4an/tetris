import BodyHelperComponent from "../BodyHelperComponent";

export class CapsuleHelperComponent extends BodyHelperComponent {

  type = "p2-capsule-helper"

  initGraphics() {
    const {settings: {radius, length}} = this;

    const graphics = super.initGraphics();
    graphics
      .drawCircle(-length / 2, 0, radius)
      .drawRect(-length/2, -radius, length, radius * 2)
      .drawCircle(length / 2, 0, radius);

    this.pixiObject = graphics;
  }

}

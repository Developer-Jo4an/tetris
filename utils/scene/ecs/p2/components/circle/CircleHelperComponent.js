import BodyHelperComponent from "../BodyHelperComponent";

export default class CircleHelperComponent extends BodyHelperComponent {

  type = "p2-circle-helper"

  initGraphics() {
    const {settings: {radius, hasNoBody, startAngle, endAngle}} = this;
    const graphics = super.initGraphics();

    if (startAngle !== undefined && endAngle !== undefined) {
      graphics.arc(0, 0, radius, startAngle, endAngle);
    } else graphics.drawCircle(0, 0, radius);

    this.pixiObject = graphics;

    if(hasNoBody)
      graphics.alpha = .5;

  }
}

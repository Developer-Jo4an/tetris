import BodyComponent from "../BodyComponent";
import P2 from "p2";

export default class RectangleComponent extends BodyComponent {

  type = "p2-rectangle"

  constructor({name, subtype, eventBus, contacts, x, y, angle, width, height, ...bodySettings}) {
    super({name, subtype, eventBus, contacts});

    const shape = new P2.Box({width, height});

    this.material = shape.material = new P2.Material();

    if (angle)
      bodySettings.angle = angle;

    const body = new P2.Body({
      position: [x, y],
      ...bodySettings
    });
    body.addShape(shape);

    this.p2Body = body;
  }
}

import P2 from "p2";
import BodyComponent from "../BodyComponent";

export class CapsuleComponent extends BodyComponent {

  type = "p2-capsule";

  constructor({eventBus, x, y, length, contacts, radius, angle, ...settings}) {
    super({name: "capsule", eventBus, contacts});

    const shape = new P2.Capsule({
      length,
      radius
    });

    this.material = shape.material = new P2.Material();

    const body = new P2.Body({
      position: [x, y],
      angle,
      ...settings
    });
    body.addShape(shape);

    this.p2Body = body;
  }

}

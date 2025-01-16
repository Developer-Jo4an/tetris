import BodyComponent from "../BodyComponent";
import P2 from "p2";

export default class CircleComponent extends BodyComponent {

  type = "p2-circle";

  position = {x: 0, y: 0};

  constructor({name, subtype, eventBus, contacts, x, y, radius, maxSpeed, ...bodySettings}) {
    super({name, subtype, eventBus, contacts});

    const shape = new P2.Circle({radius});

    shape.area = 4;

    this.material = shape.material = new P2.Material();

    this.position.x = x;
    this.position.y = y;

    const body = new P2.Body({
      position: [x, y],
      ...bodySettings,
    });

    body.addShape(shape);

    this.p2Body = body;
  }
}

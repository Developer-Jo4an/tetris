import BodyComponent from "../BodyComponent";
import Matter from "matter-js";

export default class RectangleComponent extends BodyComponent {

  type = "matter-rectangle"

  constructor({eventBus, x, y, width, height, maxSpeed, ...bodySettings}) {
    super({eventBus});

    const body = Matter.Bodies.rectangle(0, 0, width, height, bodySettings);
    body.maxSpeed = maxSpeed

    this.matterBody = body;

    Matter.Body.setPosition(this.matterBody, {x, y});
  }
}

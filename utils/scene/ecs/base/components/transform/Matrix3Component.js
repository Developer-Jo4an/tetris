import Component from "../../../core/Component";

export default class Matrix3Component extends Component {

  type = "matrix3"

  x = 0;

  y = 0;

  rotation = 0

  scaleX = 1;

  scaleY = 1;

  skewX = 1;

  skewY = 1;

  constructor({
                eventBus,
                x = 0, y = 0,
                scaleX = 1, scaleY = 1,
                skewX = 1, skewY = 1,
                rotation = 0,
              }) {
    super({eventBus})

    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.skewX = skewX;
    this.skewY = skewY;
  }
}

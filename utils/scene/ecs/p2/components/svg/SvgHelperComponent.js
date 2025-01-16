import BodyHelperComponent from "../BodyHelperComponent";
import P2 from "p2";

export default class SvgHelperComponent extends BodyHelperComponent {

  type = "matter-svg-helper"


  initGraphics() {
    const {settings: {p2Body, angle, offset}} = this;
    const graphics = super.initGraphics();


    p2Body.shapes.forEach(shape => {
      const {vertices, position, angle} = shape;
      const vrot = P2.vec2.create();
      const vecs = [];
      vertices.forEach(v => {
        P2.vec2.rotate(vrot, v, angle);
        vecs.push([(vrot[0] + position[0]), (vrot[1] + position[1])]);
      });
      graphics.lineStyle(1, 0xff0000, 1);
      graphics.beginFill(0x00ff00);

      vecs.forEach(([x, y], i) => {
        if (i === 0)
          graphics.moveTo(x, y);
        else
          graphics.lineTo(x, y);
      })

      graphics.endFill();
      if (vecs.length > 2) {
        graphics.moveTo(vecs[vertices.length - 1][0], vecs[vecs.length - 1][1]);
        graphics.lineTo(vecs[0][0], vecs[0][1]);
      }
    });

    if (offset) {
      const {x, y} = offset;
      graphics.beginFill(0xFF0000);
      graphics.drawCircle(x, y, 1);
      graphics.endFill();
    }

    if (angle)
      this.pixiObject.rotation = angle;


    this.pixiObject = graphics;

  }
}

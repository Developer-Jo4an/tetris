import BodyComponent from "../BodyComponent";
import P2 from "p2";
import * as pathSeg from "../../../../../shape/pathseg";

global.window.pathSeg = pathSeg; //HACK: нужно использование, иначе three-shaking выкидывает библиотеку

export default class SvgComponent extends BodyComponent {

  type = "p2-svg"

  constructor({
                name, subtype, eventBus, contacts, x, y, angle, path, reflection, offset,
                ...bodySettings
              }) {
    super({name, subtype, eventBus, contacts, offset});

    if (reflection) {
      const {x, y} = reflection;
      path = path.map(pair => {
        if (x) pair[0] *= -1;
        if (y) pair[1] *= -1;
        return pair;
      })
    }

    const body = new P2.Body({
      position: [x, y],
      ...bodySettings
    });

    body.fromPolygon(path);

    this.material = new P2.Material();


    body.shapes.forEach(shape => {

      if (offset) {
        body.removeShape(shape);
        body.addShape(shape, [-offset.x, -offset.y], 0);
      }
      shape.material = this.material;
    })

    this.p2Body = body;
  }
}

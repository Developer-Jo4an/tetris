import BodyHelperComponent from "../BodyHelperComponent";

export default class SvgHelperComponent extends BodyHelperComponent {

  type = "matter-svg-helper"

  constructor({eventBus, offset, svg, scaleX, scaleY}) {
    super({eventBus, svg});

    const base64 = new XMLSerializer().serializeToString(svg)
    const texture = new PIXI.Texture.from(base64);

    const container = new PIXI.Container;

    const sprite = new PIXI.Sprite(texture);
    if (scaleX || scaleY)
      sprite.scale.set(scaleX, scaleY);

    if (offset)
      sprite.position.set(-offset.x, -offset.y);

    container.addChild(sprite);

    this.pixiObject = container;
  }
}

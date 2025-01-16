import Component from "../../core/Component";

export default class SpriteComponent extends Component {

  type = "pixi-sprite"

  constructor({eventBus, sprite}) {
    super({eventBus});

    this.pixiObject = sprite;
    this.onChange();
  }
}

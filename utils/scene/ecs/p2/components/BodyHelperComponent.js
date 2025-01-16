import Component from "../../core/Component";

export default class BodyHelperComponent extends Component {

  _pixiObject;

  baseType = "visual-helper";

  constructor({eventBus, ...settings}) {
    super({eventBus});

    this.settings = settings;

    this.initGraphics();
  }

  initGraphics() {
    const {settings: {color}} = this;
    return new PIXI.Graphics().beginFill(color, .5);
  }

  set pixiObject(helper) {
    this._pixiObject = helper;
    this.onChange();
  }

  get pixiObject() {
    return this._pixiObject;
  }
}

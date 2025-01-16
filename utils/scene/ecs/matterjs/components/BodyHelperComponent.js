import Component from "../../core/Component";

export default class BodyHelperComponent extends Component {

  _pixiObject;

  constructor({eventBus, ...settings}) {
    super({eventBus});

    this.settings = settings;

    this.initGraphics();
  }

  initGraphics() {
    const {settings: {color}} = this;
    return new PIXI.Graphics().beginFill(color);
  }

  set pixiObject(helper) {
    this._pixiObject = helper;
    this.onChange();
  }

  get pixiObject() {
    return this._pixiObject;
  }
}

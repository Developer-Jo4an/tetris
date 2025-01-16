import BodyHelperComponent from "./BodyHelperComponent";

export default class SpriteHelperComponent extends BodyHelperComponent {

  _pixiObject;

  baseType = "visual-helper";

  type = "sprite-helper";

  constructor({eventBus, ...settings}) {
    super({eventBus});
    this.settings = settings;
    const {image, active, texture: name} = settings;

    if (!image) return console.log("image is not found");
    const texture = PIXI.Texture.from(image);


    this._defaultPixiObject = new PIXI.Sprite(texture);

    this._pixiObject = new PIXI.Container();

    this._pixiObject.name = name;

    if (active) {
      const textureActive = PIXI.Texture.from(active);
      this._activePixiObject = new PIXI.Sprite(textureActive);
      textureActive.once("update", () => this.checkApply(this._activePixiObject));
      this.checkApply(this._activePixiObject);
    }

    texture.once("update", () => this.checkApply(this._defaultPixiObject));
    this._pixiObject.addChild(this._defaultPixiObject);
    this.checkApply(this._defaultPixiObject);
  }

  applyActive(active) {
    const {_activePixiObject, _defaultPixiObject, pixiObject} = this;
    pixiObject.removeChildren();
    pixiObject.addChild(active ? (_activePixiObject ?? _defaultPixiObject) : _defaultPixiObject);
  }

  checkApply(sprite) {
    if (!sprite.texture.baseTexture.valid) return;
    this.applySettings(sprite);
  }


  applySettings(sprite) {
    const {
      settings, settings: {
        angle, spriteRotation, texture, scaleX = 1, scaleY = 1, anchor = {
          x: .5,
          y: .5
        }
      }
    } = this;
    const width = settings.width ?? 2 * settings.radius;
    const height = settings.height ?? 2 * settings.radius;

    sprite.name = texture;

    sprite.anchor.set(anchor.x, anchor.y);

    if (angle || spriteRotation)
      sprite.rotation = spriteRotation ?? angle;

    const scale = Math.max(height / sprite.height, width / sprite.width);

    sprite.scale.set(scale * scaleX, scale * scaleY);
  }

  set pixiObject(helper) {
    if (!helper) return;
    this._pixiObject = helper;
    this.onChange();
  }

  get pixiObject() {
    return this._pixiObject;
  }
}

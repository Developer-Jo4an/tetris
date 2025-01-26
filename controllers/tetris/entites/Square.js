import BaseEntity from "../../../controllers/tetris/entites/BaseEntity";
import AssetsManager from "../../../utils/scene/loader/plugins/AssetsManager";

export default class Square extends BaseEntity {

  constructor(data) {
    super(data, "square");

    this.size = data.size;

    this.init();
  }

  init() {
    const {colors} = this.storage.mainSceneSettings.square;

    const texture = AssetsManager.getAssetFromLib("square", "texture");

    const sprite = new PIXI.Sprite(texture);
    sprite.tint = Number(colors[Math.floor(Math.random() * colors.length)]);
    sprite.anchor.set(0.5);
    sprite.scale.set(this.size / sprite.width, this.size / sprite.height);
    sprite.position.set(sprite.width / 2, sprite.height / 2);
    sprite.name = `${this.name}-sprite`;

    this.view = sprite;
  }

  getPosByName() {
    const [string, column] = this.name.split(":")[1].split("-").map(Number);
    return {string, column};
  }

  destroy() {
    if (this.view.destroyed) return;
    this.view.destroy();
    super.destroy();
  }
}

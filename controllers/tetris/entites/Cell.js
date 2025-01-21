import BaseEntity from "./BaseEntity";
import AssetsManager from "../../../utils/scene/loader/plugins/AssetsManager";

export default class Cell extends BaseEntity {

  constructor(data) {
    super(data, "cell");
    const {isEmpty, size} = data;

    this.isEmpty = isEmpty;
    this.size = size;

    this.init();
  }

  init() {
    const spriteTexture = AssetsManager.getAssetFromLib(`cell-${this.isEmpty ? "empty" : "standard"}`, "texture");
    const sprite = new PIXI.Sprite(spriteTexture);
    sprite.name = `${this.name}-sprite`;

    sprite.scale.set(this.size / sprite.width, this.size / sprite.height);

    const container = new PIXI.Container();
    container.name = this.name;
    container.addChild(sprite);
    container.pivot.set(sprite.width / 2, sprite.height / 2);

    this.view = container;
  }

  getPosByName() {
    const [x, y] = this.name.split(":")[1].split("-").map(Number);
    return {x, y};
  }

  destroy() {
    super.destroy();
    //todo: destroy cell
  }
}

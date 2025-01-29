import BaseEntity from "./BaseEntity";
import AssetsManager from "../../../utils/scene/loader/plugins/AssetsManager";

export default class Cell extends BaseEntity {
  constructor(data) {
    super(data, "cell");
    const {isEmpty, size} = data;

    this.isEmpty = isEmpty;
    this.size = size;
    this.mode = "standard";

    this.init();
  }

  init() {
    const spriteTexture = AssetsManager.getAssetFromLib(`cell-${this.isEmpty ? "empty" : "standard"}`, "texture");
    this.cellSprite = new PIXI.Sprite(spriteTexture);
    this.cellSprite.name = `${this.name}-sprite`;

    this.cellSprite.scale.set(this.size / this.cellSprite.width, this.size / this.cellSprite.height);

    const container = new PIXI.Container();
    container.name = this.name;
    container.addChild(this.cellSprite);
    container.pivot.set(this.cellSprite.width / 2, this.cellSprite.height / 2);

    this.view = container;
  }

  addSquare(square) {
    this.square = square;
    square.id = this.id;
    square.name = `square:${square.id}`;
    square.view.name = `square:${square.id}-sprite`;
    square.view.position.set(square.view.width / 2, square.view.height / 2);
    this.view.addChild(square.view);
    this.square.setParentCell(this);
  }

  getSquare() {
    return this.square;
  }

  removeSquare() {
    this.square.destroy();
    this.square = null;
  }

  setMode(mode) {
    ({
      standard: () => {
        this.mode = "standard";
        this.cellSprite.tint = 0xffffff;
      },
      possibleStep: () => {
        this.mode = "possibleStep";
        this.cellSprite.tint = 0xff0000;
      }
    })[mode]?.();
  }

  destroy() {
    if (this.view.destroyed) return;
    const square = this.getSquare();
    square && square.destroy();
    this.view.destroy();
    super.destroy();
  }
}

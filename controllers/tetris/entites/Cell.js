import BaseEntity from "./BaseEntity";
import AssetsManager from "../../../utils/scene/loader/plugins/AssetsManager";

export default class Cell extends BaseEntity {

  static availableCellStatuses = ["standard"];

  static visibleCellStatuses = ["standard", "empty"];

  _status;

  _isDisabledCell;

  _isVisibleCell;

  _mode;

  constructor(data) {
    super(data, "cell");
    const {status, size} = data;

    this.size = size;
    this.status = status;
    this.isDisabledCell = !Cell.availableCellStatuses.includes(this.status);
    this.isVisibleCell = Cell.visibleCellStatuses.includes(this.status);
    this.mode = "standard";

    this.init();
  }

  get status() {
    return this._status;
  }

  set status(value) {
    this._status = value;
  }

  get isDisabledCell() {
    return this._isDisabledCell;
  }

  set isDisabledCell(value) {
    this._isDisabledCell = value;
  }

  get isVisibleCell() {
    return this._isVisibleCell;
  }

  set isVisibleCell(value) {
    this._isVisibleCell = value;
  }

  get mode() {
    return this._mode;
  }

  set mode(value) {
    this._mode = value;
  }

  init() {
    const spriteTexture = AssetsManager.getAssetFromLib(`cell-${this.status}`, "texture");
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
    if (this.isDisabledCell)
      throw new Error("incorrect status");

    this.square = square;
    square.id = this.id;
    square.name = `square:${square.id}`;
    square.view.name = `square:${square.id}-sprite`;
    square.view.position.set(square.view.width / 2, square.view.height / 2);
    this.view.addChild(square.view);
    this.square.setParentCell(this);
  }

  getSquare() {
    if (this.isDisabledCell)
      throw new Error("incorrect status");

    return this.square;
  }

  removeSquare() {
    if (this.isDisabledCell)
      throw new Error("incorrect status");

    this.square.destroy();
    this.square = null;
  }

  setMode(mode) {
    if (this.isDisabledCell)
      throw new Error("incorrect status");

    ({
      standard: () => {
        this.mode = "standard";
        this.cellSprite.tint = 0xffffff;
      },
      possibleStep: () => {
        this.mode = "possibleStep";
        this.cellSprite.tint = 0xff0000; //todo: в константы цвет на данный mode
      }
    })[mode]?.();
  }

  destroy() {
    if (this.view.destroyed) return;
    const square = !this.isDisabledCell && this.getSquare();
    square && square.destroy();
    this.view.destroy();
    super.destroy();
  }
}

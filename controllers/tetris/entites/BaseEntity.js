import TetrisContainer from "../helpers/TetrisContainer";

export default class BaseEntity {

  _view;

  _id;

  constructor(data, type) {
    this.name = data.name;
    this.storage = data.storage;
    this.eventBus = data.eventBus;
    this.type = type;
    this.id = data.id;

    this.add();
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get view() {
    return this._view;
  }

  set view(value) {
    this._view = value;
  }

  init() {

  }

  add() {
    TetrisContainer.setItemByType(this.type, this);
  }

  destroy() {
    if (this.type)
      TetrisContainer.clearItemByEntity(this.type, this);
  }
}

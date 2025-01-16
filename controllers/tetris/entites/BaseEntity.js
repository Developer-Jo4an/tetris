export default class BaseEntity {

  _view;

  _id;

  constructor(data) {
    this.name = data.name;
    this.storage = data.storage;
    this.id = data.id;
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
}
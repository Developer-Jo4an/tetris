export default class Plugin {

  _actions = [];

  _enabled = false;

  constructor() {

  }

  checkAction(action) {
    return false;
  }

  addAction(action) {
    this._actions.push(action);
  }

  checkActions() {
    this._actions.forEach(action => this.updateAction(action));
  }

  updateAction() {

  }

  reset() {
    this._actions.forEach(action => action.active = false);
  }
}

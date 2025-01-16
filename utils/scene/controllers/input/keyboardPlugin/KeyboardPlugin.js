import Plugin from "../Plugin";
import Key from "./Key";

export default class KeyboardPlugin extends Plugin {

  name = "keyboard";

  _keys = {};

  checkAction(action) {
    return !!action.data.keyboard;
  }

  addAction(action) {
    super.addAction(action);
  }

  attachGlobal() {
    this.attach(global.window)
    if (global.window.top !== global.window) {
      try {
        this.attach(global.window.top);
      } catch (e) {
        console.log(e)
      }
    }

  }

  attach(target) {
    target.removeEventListener("keydown", this.onKeyDown);
    target.removeEventListener("keyup", this.onKeyUp);

    target.addEventListener("keydown", this.onKeyDown);
    target.addEventListener("keyup", this.onKeyUp);
  }

  detach(target) {
    target.removeEventListener("keydown", this.onKeyDown);
    target.removeEventListener("keyup", this.onKeyUp);
  }

  getKey(code) {
    if (!this._keys[code])
      this._keys[code] = new Key({code});

    return this._keys[code];
  }

  onKeyDown = ({keyCode}) => {
    const key = this.getKey(keyCode);
    if (key.pressed) return;
    key.pressed = true;

    this.checkActions();
  };

  onKeyUp = ({keyCode}) => {
    const key = this.getKey(keyCode);
    if (!key.pressed) return;
    key.pressed = false;

    this.checkActions();
  };

  updateAction(action) {
    const {data: {keyboard: {keys}}} = action;
    action.active = keys.some(({keyCode}) => this._keys?.[keyCode]?.pressed);
  }

}

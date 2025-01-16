export default class VariationArray {
  _array = [];

  fill(fillFnc) {
    if (typeof fillFnc !== "function") return;
    this._array = fillFnc();
  }

  get randomItem() {
    const index = Math.floor(Math.random() * this._array.length);
    const [item] = this._array.splice(index, 1);

    return item;
  }

  get length() {
    return this._array.length;
  }
}

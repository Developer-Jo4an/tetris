export default class ExtraOrthographicCamera extends THREE.OrthographicCamera {

  _aspect = 1;

  _shiftX = 0;

  _shiftY = 0;

  _size = 0;

  constructor(size, scale = 1, near = 1, far = 1000) {
    super(size / -2, size / 2, size / 2, size / -2, near, far);

    this._size = size;

    this.zoom = scale;

    this.updateCameraProps();
  }

  updateCameraProps() {
    const {size, shiftX, shiftY, aspect} = this;

    this.left = size * aspect / -2 + shiftX;
    this.right = size * aspect / 2 + shiftX;

    this.top = size / 2 + shiftY;
    this.bottom = size / -2 + shiftY;

  }

  set aspect(aspect) {
    this._aspect = aspect;
    this.updateCameraProps();
  }

  get aspect() {
    return this._aspect;
  }

  set size(size) {
    this._size = size;
    this.updateCameraProps();
  }

  get size() {
    return this._size;
  }

  set shiftX(shiftX) {
    this._shiftX = shiftX;
    this.updateCameraProps();
  }

  get shiftX() {
    return this._shiftX;
  }


  set shiftY(shiftY) {
    this._shiftY = shiftY;
    this.updateCameraProps();
  }

  get shiftY() {
    return this._shiftY;
  }
}

THREE.ExtraOrthographicCamera = ExtraOrthographicCamera;

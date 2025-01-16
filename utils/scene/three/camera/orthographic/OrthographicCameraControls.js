import {getEventPosition} from "../../../utils/events/convert";
import Hammer from "hammerjs";

export default class OrthographicCameraControls {

  constructor({storage, domElement, controller}) {
    this.onTouch = this.onTouch.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onDown = this.onDown.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onPinch = this.onPinch.bind(this);
    this.onPinchStart = this.onPinchStart.bind(this);
    this.onUp = this.onUp.bind(this);


    this.domElement = domElement;
    this.controller = controller;
    this.storage = storage;

    this.addListeners();
  }

  addListeners() {
    const {domElement} = this;

    domElement.addEventListener("mousemove", this.onMove);
    domElement.addEventListener("mousedown", this.onDown);

    domElement.addEventListener("touchstart", this.onDown);
    domElement.addEventListener("touchstart", this.onTouch);
    domElement.addEventListener("touchmove", this.onMove);

    domElement.addEventListener("wheel", this.onWheel);

    window.addEventListener("mouseup", this.onUp);
    window.addEventListener("touchend", this.onUp);
    window.addEventListener("touchcancel", this.onUp);

    const hammer = new Hammer(domElement, {});
    hammer.get('pinch').set({
      enable: true
    });
    hammer.on("pinchstart", this.onPinchStart);
    hammer.on("pinch", this.onPinch);

  }

  onPinchStart() {
    this._zoomStart = this.controller.zoom.target;
  }

  onPinch({scale}) {
    this.controller.zoom.target = this._zoomStart * scale;
    this.restrictZoom();
  }

  onWheel(e) {
    const deltaY = typeof e.deltaY === "undefined" ? -e.wheelDelta : e.deltaY;

    const speed = 0.95;
    this.controller.zoom.target *= deltaY < 0 ? 1 / speed : speed;

    this.restrictZoom();
  }

  restrictZoom() {
    const {
      storage: {
        mainSceneSettings: {
          camera: {
            restrictions: {
              zoom: {min, max},
            }
          }
        }
      }
    } = this;

    this.controller.zoom.target = Math.max(min, Math.min(max, this.controller.zoom.target));
  }

  onTouch() {
    this._isTouch = true;
  }

  onMove(e) {
    if (!this._prevMove) return;

    const position = getEventPosition(e);


    const {
      controller, storage: {
        mainSceneSettings: {
          camera: {
            restrictions: {
              x: {min: minX, max: maxX}, z: {min: minZ, max: maxZ},
            }
          }
        }
      }
    } = this;

    const deltaMove = 1200 / this.controller.zoom.current; //HACK: magic number
    const {_prevMove: {x, y}, domElement} = this;
    const {offsetHeight} = domElement;
    const delta = this.getRotatedDelta(new THREE.Vector2(position.x - x, position.y - y));
    this.controller.offset.x.target = Math.max(minX, Math.min(maxX, this.controller.offset.x.target - deltaMove * delta.x / offsetHeight));
    this.controller.offset.z.target = Math.max(minZ, Math.min(maxZ, this.controller.offset.z.target - deltaMove * delta.y / offsetHeight));

    this._prevMove = position;
  }

  getRotatedDelta(delta) {
    const {storage: {mainSceneSettings: {camera: {position, baseTarget}}}} = this;

    const angle = (new THREE.Vector3(position.x - baseTarget.x, 0, position.y - baseTarget.z))
      .angleTo(new THREE.Vector3(1, 0, 0));

    delta.rotateAround(new THREE.Vector2(0, 0), -angle + Math.PI);

    return delta;
  }

  onDown(e) {
    this._prevMove = getEventPosition(e);
  }

  onUp() {
    this._prevMove = null;
  }
}

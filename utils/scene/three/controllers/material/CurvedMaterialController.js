import MeshCurvedMaterial from "../../materials/MeshCurvedMaterial";
import {BaseController} from "../../../../../controllers/runner/BaseController";
import AssetsManager from "../../../loader/plugins/AssetsManager";
import md5 from "md5";

export default class CurvedMaterialController extends BaseController {

  name = "CurvedMaterialController";

  lastPosition = null;

  _currentLength = 0;

  _progressAreaX = 0;

  active = true;

  materialItems = [];

  materialData = {};

  materialsCache = {};

  constructor(data = {}) {
    const {eventBus, scene} = data;
    super(data);
    if (!eventBus)
      return console.log("has no event emmiter");
    this.eventBus = eventBus;
    this.scene = scene;
    eventBus.addEventListener("hero:position-changed", this.onMoving.bind(this));
    this.eventBus.addEventListener("place-item", this.onCreate.bind(this));
    this.eventBus.addEventListener("remove-item", this.onRemove.bind(this));
    this.eventBus.addEventListener("append-item", this.onCreate.bind(this));
    this.eventBus.addEventListener("get-curved-material", this.onGetMaterial.bind(this));
  }

  onGetMaterial(e) {
    const {data: {mainSceneSettings, customSettings, clone, materialType}} = e;
    e.data.material = this.getCurvedMaterial(mainSceneSettings, customSettings, clone, materialType);
  }

  getCurvedMaterial(mainSceneSettings = {}, customSettings = {}, clone, materialType) {
    const {materialsCache} = this;
    const props = this.getCurvedProps(mainSceneSettings, customSettings);
    const hash = md5(JSON.stringify({
      props: {
        materialType: materialType,
        textureUuid: props.texture.uuid,
        curvedAreaXLength: props.curvedAreaXLength
      }, clone: {
        map: clone?.map?.uuid,
      }
    }));

    if (!materialsCache[hash]) {
      const material = new MeshCurvedMaterial(props);
      if (clone)
        material.copy(clone);
      material.copiedFrom = clone;
      materialsCache[hash] = material;
    }

    return materialsCache[hash];
  }

  getCurvedProps(mainSceneSettings = {}, customSettings = {}) {
    const texture = AssetsManager.lib.texture.assets.blink.item;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    const {eventBus} = this;
    const {curvedMaterial = {}} = mainSceneSettings;
    return {...curvedMaterial, ...customSettings, eventBus, texture};
  }


  initData = (curvedMaterialSettings = {}) => {
    const {curvedAreaXLength, ..._settings} = curvedMaterialSettings;
    this._settings = _settings;
    this.curvedAreaXLength = curvedAreaXLength;
    this.initUniformsData();
  };

  initUniformsData() {
    if (!this._settings) return;
    const {_settings} = this;
    Object.entries(_settings).forEach(([key, value]) => this.materialData[key] = value);
  }

  set progressAreaX(value) {
    this._progressAreaX = Math.max(0, Math.min(1, value));
  }

  get progressAreaX() {
    return this._progressAreaX;
  }


  onCreate({data: {item}}) {
    if (!item) return;

    item.traverse((object) => {
      if (object?.material instanceof MeshCurvedMaterial && !this.materialItems.includes(object)) {
        this.materialItems.push(object);
      }
    });

    this.xDirection = this.xDirection;
    this.currentLength = this.currentLength;
  }

  onRemove({data: {item}}) {
    if (!item) return;

    this.checkRemoved();
    this.remove(item);
  }

  remove(item) {
    const {materialItems} = this;
    item.traverse((object) => {
      if (object.material && object.material instanceof MeshCurvedMaterial) {
        const index = materialItems.indexOf(object);
        index !== -1 && this.materialItems.splice(index, 1);
        const test = this.materialItems.some(testObject => testObject.material === object.material);

        if (!test)
          object.material?.reset();
      }
    });

  }

  checkRemoved() {
    const toRemove = [];

    this.materialItems.forEach((item) => {
      let parent = item.parent;
      while (parent && !(parent instanceof THREE.Scene)) {
        parent = parent.parent;
      }
      if (!parent) toRemove.push(item);
    });

    toRemove.forEach(item => {
      this.remove(item);
    });
  }

  get xDirection() {
    return this.getUniformByName("xDirection");
  }

  set xDirection(value) {
    this.setUniformByName("xDirection", value);
  }

  get xDirections() {
    return this.getUniformByName("xDirections");
  }


  onMoving({data: {hero}}) {
    if (!this.lastPosition) {
      this.lastPosition = hero.position.clone();
      this.turn();
    }

    if (this.active)
      this.onMoveActions(hero);

    this.lastPosition.copy(hero.position);
  }


  set currentLength(value) {
    this._currentLength = value;
    this.progressAreaX = Math.max(0, Math.min(1, this.currentLength / this.curvedAreaXLength));

    if (this.currentLength > this.curvedAreaXLength)
      this.turn();

    this.applyDirection();
  }

  get currentLength() {
    return this._currentLength;
  }

  onMoveActions(hero) {
    const {lastPosition} = this;
    const delta = hero.position.clone().sub(lastPosition);
    this.currentLength += Math.abs(delta.z);
  }

  get roadTurnProgress() {
    const {progressAreaX} = this;    // [0,1] => [0,...,1,...0];

    const progress = -1 * (2 * progressAreaX - 1) ** 2 + 1;
    // const progress = 1 - Math.abs(progressAreaX - .5) * 2;
    return Math.max(0, Math.min(1, progress));
  }

  setUniformByName(name, value) {
    if (!name) return;

    value = Math.round(value * 1000) / 1000;
    // console.log(this.materialItems);
    this.materialItems.forEach(({material}) => material.setProperty(name, value));
    this.materialData[name] = value;
  }

  getUniformByName(name) {
    return this.materialData[name];
  }

  applyDirection() {
    if (!this.directionData) return;
    const {directionData: {xDirection, nextDirection}} = this;
    const deltaDirection = (nextDirection - xDirection);
    this.xDirection = deltaDirection * this.roadTurnProgress;
  }


  turn() {
    const {xDirection, currentLength, curvedAreaXLength, xDirections} = this;
    const nextDirection = xDirections[Math.floor(xDirections.length * Math.random())];
    this.currentLength = Math.max(0, currentLength - curvedAreaXLength);

    this.directionData = {
      xDirection,
      nextDirection,
    };
  }


  reset() {
    this.directionData = null;
    this.initUniformsData();
    this.progressAreaX = 0;
    this.currentLength = 0;
    this.xDirection = 0;
    this.materialItems.length = 0;
  }

}
